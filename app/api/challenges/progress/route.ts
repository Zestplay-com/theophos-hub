import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7))
    const { challengeId } = await request.json()
    if (!challengeId || typeof challengeId !== 'string') return NextResponse.json({ error: 'challengeId is required.' }, { status: 400 })
    const db = adminDb()
    const challengeRef = db.collection('challenges').doc(challengeId)
    const challengeSnap = await challengeRef.get()
    if (!challengeSnap.exists) return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
    const challenge = challengeSnap.data() || {}
    const participantRef = db.collection('challengeParticipants').doc(`${challengeId}_${decoded.uid}`)
    const participantSnap = await participantRef.get()
    if (!participantSnap.exists) return NextResponse.json({ error: 'Join the challenge first.' }, { status: 403 })
    const participant = participantSnap.data() || {}
    if (participant.status === 'completed') return NextResponse.json({ completed: true, alreadyCompleted: true })
    const action = String(challenge.action || '')
    let progress = Number(participant.progress || 0)
    const target = Number(challenge.target || 1)
    if (action === 'submit_video') {
      const videos = await db.collection('videos').where('creatorId', '==', decoded.uid).limit(target).get()
      progress = Math.min(videos.size, target)
    } else if (action === 'feedback') {
      const feedback = await db.collection('feedback').where('fromCreatorId', '==', decoded.uid).limit(target).get()
      progress = Math.min(feedback.size, target)
    } else if (action === 'follow') {
      const follows = await db.collection('follows').where('followerId', '==', decoded.uid).limit(target).get()
      progress = Math.min(follows.size, target)
    }
    const completed = progress >= target
    const update: any = { progress, updatedAt: FieldValue.serverTimestamp() }
    if (completed) {
      update.status = 'completed'
      update.completedAt = FieldValue.serverTimestamp()
      update.rewarded = true
      const reward = Number(challenge.xpReward || 0)
      if (reward > 0) await db.collection('users').doc(decoded.uid).update({ xp: FieldValue.increment(reward) })
      await db.collection('notifications').add({ userId: decoded.uid, type: 'challenge', title: 'Challenge completed', message: `You completed ${challenge.title || 'a creator challenge'} and earned ${reward} XP.`, createdAt: FieldValue.serverTimestamp() })
    }
    await participantRef.update(update)
    return NextResponse.json({ completed, progress, target, reward: completed ? Number(challenge.xpReward || 0) : 0 })
  } catch (error) {
    console.error('challenge progress failed', error)
    return NextResponse.json({ error: 'Could not update challenge progress.' }, { status: 500 })
  }
}
