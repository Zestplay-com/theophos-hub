import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '../../../lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const header = request.headers.get('authorization') || ''
    if (!header.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(header.slice(7))
    const db = adminDb()
    const followSnap = await db.collection('follows').where('followerId', '==', decoded.uid).limit(100).get()
    const ids = new Set([decoded.uid, ...followSnap.docs.map(d => String(d.data().followingId)).filter(Boolean)])
    const videosSnap = await db.collection('videos').orderBy('createdAt', 'desc').limit(50).get()
    const videos: any[] = videosSnap.docs
      .filter(d => ids.has(String(d.data().creatorId)))
      .map(d => ({ id: d.id, kind: 'video', createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null, ...d.data() }))
    const profiles = new Map<string, any>()
    await Promise.all([...ids].map(async id => { const s = await db.collection('users').doc(id).get(); if (s.exists) profiles.set(id, s.data()) }))
    return NextResponse.json({ activities: videos.map(v => ({ ...v, creator: profiles.get(v.creatorId) || null })) })
  } catch (error) {
    console.error('activity feed failed', error)
    return NextResponse.json({ error: 'Could not load your activity feed.' }, { status: 500 })
  }
}
