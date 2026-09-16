import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../../lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7))
    const db = adminDb()
    const snap = await db.collection('circles').orderBy('createdAt', 'desc').limit(50).get()
    const circles = await Promise.all(snap.docs.map(async d => {
      const data = d.data()
      const member = await db.collection('circleMembers').doc(`${d.id}_${decoded.uid}`).get()
      return { id: d.id, ...data, memberCount: Number(data.memberCount || 0), joined: member.exists }
    }))
    return NextResponse.json({ circles })
  } catch (error) {
    console.error('circles GET failed', error)
    return NextResponse.json({ error: 'Could not load circles.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7))
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const niche = typeof body.niche === 'string' ? body.niche.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    if (name.length < 3 || name.length > 60) return NextResponse.json({ error: 'Circle name must be 3–60 characters.' }, { status: 400 })
    if (!niche) return NextResponse.json({ error: 'Choose a niche.' }, { status: 400 })
    if (description.length > 500) return NextResponse.json({ error: 'Description is too long.' }, { status: 400 })
    const db = adminDb()
    const ref = db.collection('circles').doc()
    const memberRef = db.collection('circleMembers').doc(`${ref.id}_${decoded.uid}`)
    const batch = db.batch()
    batch.set(ref, { name, niche, description, ownerId: decoded.uid, memberCount: 1, createdAt: FieldValue.serverTimestamp() })
    batch.set(memberRef, { circleId: ref.id, userId: decoded.uid, role: 'owner', joinedAt: FieldValue.serverTimestamp() })
    await batch.commit()
    return NextResponse.json({ id: ref.id })
  } catch (error) {
    console.error('circle creation failed', error)
    return NextResponse.json({ error: 'Could not create the circle.' }, { status: 500 })
  }
}