import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { adminAuth, adminDb } from '../../../lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(token)
    const body = await request.json()
    const title = String(body.title || '').trim()
    const description = String(body.description || '').trim()
    const niche = String(body.niche || '').trim()
    const contentType = String(body.contentType || '').trim()
    const goal = String(body.goal || '').trim()
    if (!title) return NextResponse.json({ error: 'A video title is required.' }, { status: 400 })
    if (title.length > 180 || description.length > 5000 || goal.length > 1000) return NextResponse.json({ error: 'Input is too long.' }, { status: 400 })
    const profileSnap = await adminDb.collection('users').doc(decoded.uid).get()
    const profile = profileSnap.exists ? profileSnap.data() || {} : {}
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'AI Coach is not configured yet.' }, { status: 503 })
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.responses.create({
      model: process.env.OPENAI_COACH_MODEL || 'gpt-5-mini',
      input: [
        { role: 'system', content: 'You are Theophos Hub AI Creator Coach. Give practical, honest creator improvement advice. Never invent YouTube analytics, views, subscribers, rankings, audience data, or guaranteed growth. Judge only the information supplied. Return valid JSON with keys: summary, titleIdeas (array of 3 strings), hook, strengths (array of 3 strings), improvements (array of 4 strings), contentIdeas (array of 3 strings), cta, nextStep.' },
        { role: 'user', content: JSON.stringify({ creatorNiche: profile.primaryNiche || niche || 'Other', creatorFormat: profile.contentFormat || contentType || 'both', title, description, niche, contentType, goal }) }
      ],
      text: { format: { type: 'json_object' } }
    })
    const raw = response.output_text || '{}'
    let coach
    try { coach = JSON.parse(raw) } catch { coach = { summary: raw, titleIdeas: [], hook: '', strengths: [], improvements: [], contentIdeas: [], cta: '', nextStep: '' } }
    await adminDb.collection('coachAnalyses').add({ userId: decoded.uid, title, niche, contentType, createdAt: new Date(), coach })
    return NextResponse.json({ coach })
  } catch (error) {
    console.error('AI coach error', error)
    return NextResponse.json({ error: 'The AI Coach could not complete the analysis. Please try again.' }, { status: 500 })
  }
}
