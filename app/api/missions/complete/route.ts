import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

function levelForXp(xp: number) {
  if (xp >= 2000) return 'Creator Leader'
  if (xp >= 1000) return 'Community Builder'
  if (xp >= 500) return 'Rising Creator'
  if (xp >= 150) return 'Active Creator'
  return 'New Creator'
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7))
    const body = await request.json()
    const missionId = typeof body.missionId === 'string' ? body.missionId : ''
    if (!missionId) return NextResponse.json({ error: 'missionId is required' }, { status: 400 })

    const db = adminDb()
    const missionRef = db.collection('missions').doc(missionId)
    const userRef = db.collection('users').doc(decoded.uid)
    const now = new Date()

    const result = await db.runTransaction(async tx => {
      const missionSnap = await tx.get(missionRef)
      const userSnap = await tx.get(userRef)
      if (!missionSnap.exists) throw new Error('MISSION_NOT_FOUND')
      if (!userSnap.exists) throw new Error('PROFILE_NOT_FOUND')
      const mission = missionSnap.data()!
      if (mission.assigneeId !== decoded.uid) throw new Error('NOT_ASSIGNEE')
      if (mission.status === 'completed') return { alreadyCompleted: true, xpAwarded: Number(mission.xpAwarded || 25) }
      if (mission.status !== 'assigned') throw new Error('MISSION_NOT_ACTIVE')

      const videoRef = db.collection('videos').doc(String(mission.videoId))
      const videoSnap = await tx.get(videoRef)
      if (!videoSnap.exists) throw new Error('VIDEO_NOT_FOUND')
      const video = videoSnap.data()!
      if (video.creatorId === decoded.uid) throw new Error('OWN_VIDEO')

      const user = userSnap.data()!
      const currentXp = Number(user.xp || 0)
      const award = Math.max(1, Number(mission.xpAwarded || 25))
      const nextXp = currentXp + award
      const lastDate = typeof user.lastMissionDate === 'string' ? user.lastMissionDate : ''
      const today = now.toISOString().slice(0, 10)
      const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10)
      const currentStreak = Number(user.streak || 0)
      const nextStreak = lastDate === today ? currentStreak : lastDate === yesterday ? currentStreak + 1 : 1

      tx.update(missionRef, { status: 'completed', completedAt: FieldValue.serverTimestamp() })
      tx.update(userRef, {
        xp: nextXp,
        reputation: Number(user.reputation || 0) + 1,
        streak: nextStreak,
        level: levelForXp(nextXp),
        lastMissionDate: today,
      })

      if (video.creatorId) {
        const notificationRef = db.collection('notifications').doc()
        tx.set(notificationRef, {
          userId: video.creatorId,
          type: 'feedback',
          title: 'Your video received meaningful feedback',
          message: `${user.displayName || 'A creator'} completed a support mission on “${video.title || 'your video'}”.`,
          videoId: mission.videoId,
          createdAt: FieldValue.serverTimestamp(),
        })
      }
      return { alreadyCompleted: false, xpAwarded: award, nextXp, nextStreak }
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const status = message === 'MISSION_NOT_FOUND' || message === 'PROFILE_NOT_FOUND' || message === 'VIDEO_NOT_FOUND' ? 404 : message === 'NOT_ASSIGNEE' ? 403 : message === 'MISSION_NOT_ACTIVE' || message === 'OWN_VIDEO' ? 400 : 500
    console.error('mission completion failed', error)
    return NextResponse.json({ error: message || 'Mission could not be completed.' }, { status })
  }
}
