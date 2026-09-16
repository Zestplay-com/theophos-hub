import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7))
    const body = await request.json()
    const circleId = String(body.circleId || '').trim()
    const text = String(body.text || '').trim()
    if (!circleId || !text) return NextResponse.json({ error: 'Circle and message are required.' }, { status: 400 })
    if (text.length > 1000) return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    const db = adminDb()
    const member = await db.collection('circleMembers').doc(`${circleId}_${decoded.uid}`).get()
    if (!member.exists) return NextResponse.json({ error: 'Join this circle before posting.' }, { status: 403 })
    const profile = await db.collection('users').doc(decoded.uid).get()
    const displayName = profile.data()?.displayName || 'Creator'
    const ref = await db.collection('circlePosts').add({ circleId, authorId: decoded.uid, authorName: displayName, text, createdAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id })
  } catch (error) {
    console.error('circle post failed', error)
    return NextResponse.json({ error: 'Could not publish your circle post.' }, { status: 500 })
  }
}
