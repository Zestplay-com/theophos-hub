import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { adminAuth, adminDb } from '../../../lib/firebase-admin'

const fallbackCoach = {
  summary: '', titleIdeas: [], hook: '', strengths: [], improvements: [], contentIdeas: [], cta: '', nextStep: ''
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7))
    let body: any
    try { body = await request.json() } catch { return NextResponse.json({ error: 'The Coach received an invalid request.' }, { status: 400 }) }

    const title = String(body.title || '').trim()
    const description = String(body.description || '').trim()
    const niche = String(body.niche || '').trim()
    const contentType = String(body.contentType || '').trim()
    const goal = String(body.goal || '').trim()

    if (!title) return NextResponse.json({ error: 'A video title is required.' }, { status: 400 })
    if (title.length > 180 || description.length > 5000 || goal.length > 1000) return NextResponse.json({ error: 'One of the fields is too long.' }, { status: 400 })
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'AI Coach is not configured on the server. Add OPENAI_API_KEY in Vercel.' }, { status: 503 })

    const db = adminDb()
    let profile: any = {}
    try {
      const profileSnap = await db.collection('users').doc(decoded.uid).get()
      profile = profileSnap.exists ? profileSnap.data() || {} : {}
    } catch (profileError) {
      console.warn('Coach profile lookup failed; continuing without profile context.', profileError)
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const system = `You are Theophos Hub AI Creator Coach. Give practical, specific creator advice. Never invent YouTube analytics, views, subscribers, rankings, audience data, revenue, or guaranteed growth. Judge only the information supplied. Return ONLY valid JSON with these exact keys: summary (string), titleIdeas (array of 3 strings), hook (string), strengths (array of 3 strings), improvements (array of 4 strings), contentIdeas (array of 3 strings), cta (string), nextStep (string).`

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_COACH_MODEL || 'gpt-5-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify({ creatorNiche: profile.primaryNiche || niche || 'Other', creatorFormat: profile.contentFormat || contentType || 'both', title, description, niche, contentType, goal }) }
      ]
    })

    const raw = response.choices?.[0]?.message?.content?.trim()
    if (!raw) return NextResponse.json({ error: 'The AI provider returned no coaching content. Please try again.' }, { status: 502 })

    let coach: any
    try { coach = JSON.parse(raw) } catch {
      console.error('Coach returned invalid JSON:', raw)
      return NextResponse.json({ error: 'The AI provider returned an invalid coaching format. Please try again.' }, { status: 502 })
    }

    coach = { ...fallbackCoach, ...coach }
    if (!coach.summary) return NextResponse.json({ error: 'The Coach returned an incomplete analysis. Please try again.' }, { status: 502 })

    try {
      await db.collection('coachAnalyses').add({ userId: decoded.uid, title, niche, contentType, createdAt: new Date(), coach })
    } catch (saveError) {
      console.warn('Coach history save failed; returning successful analysis anyway.', saveError)
    }

    return NextResponse.json({ coach }, { status: 200 })
  } catch (error: any) {
    console.error('AI coach error', error)
    const message = error?.status === 401 || error?.code === 'invalid_api_key'
      ? 'The AI Coach server key is invalid. Check OPENAI_API_KEY in Vercel.'
      : error?.message?.includes('Firebase')
        ? 'The Coach could not verify your account. Check the Firebase Admin environment variables.'
        : error?.message || 'The AI Coach could not complete the analysis.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
