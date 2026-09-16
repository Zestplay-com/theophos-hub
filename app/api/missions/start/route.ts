import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.slice(7)
    const decoded = await adminAuth().verifyIdToken(token)
    const body = await request.json()
    const videoId = typeof body.videoId === 'string' ? body.videoId : ''
    if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 })

    const db = adminDb()
    const videoRef = db.collection('videos').doc(videoId)
    const videoSnap = await videoRef.get()
    if (!videoSnap.exists) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

    const video = videoSnap.data()!
    if (video.creatorId === decoded.uid) return NextResponse.json({ error: 'You cannot support your own video' }, { status: 400 })

    const missionId = `${decoded.uid}_${videoId}`
    const missionRef = db.collection('missions').doc(missionId)
    const existing = await missionRef.get()
    if (existing.exists) return NextResponse.json({ id: existing.id, ...existing.data() })

    const mission = {
      videoId,
      assigneeId: decoded.uid,
      status: 'assigned',
      xpAwarded: 25,
      createdAt: new Date(),
    }
    await missionRef.set(mission)
    return NextResponse.json({ id: missionId, ...mission })
  } catch (error) {
    console.error('mission start failed', error)
    return NextResponse.json({ error: 'Mission service is not configured or the request is invalid.' }, { status: 500 })
  }
}
