import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../../lib/firebase-admin'

const CATALOG = [
  { id: 'submit-first-video', title: 'Publish your next idea', description: 'Submit one genuine YouTube video to Theophos Hub.', action: 'submit_video', requirement: 1, xp: 40 },
  { id: 'give-three-feedback', title: 'Be a useful critic', description: 'Complete three support missions and leave honest feedback.', action: 'feedback', requirement: 3, xp: 60 },
  { id: 'meet-three-creators', title: 'Build your creator network', description: 'Follow three relevant creators you genuinely want to learn from.', action: 'follow', requirement: 3, xp: 50 },
]

async function auth(request: Request) {
  const header = request.headers.get('authorization') || ''
  if (!header.startsWith('Bearer ')) throw new Error('UNAUTHORIZED')
  return adminAuth().verifyIdToken(header.slice(7))
}

export async function GET(request: Request) {
  try {
    const decoded = await auth(request)
    const db = adminDb()
    const participantSnap = await db.collection('challengeParticipants').where('userId', '==', decoded.uid).limit(50).get()
    const participants = new Map(participantSnap.docs.map(d => [d.id, d.data()]))
    const challenges = CATALOG.map(c => ({ ...c, participant: participants.get(`${c.id}_${decoded.uid}`) || null }))
    return NextResponse.json({ challenges })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Unauthorized' : 'Could not load challenges.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 })
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await auth(request)
    const body = await request.json()
    const challengeId = typeof body.challengeId === 'string' ? body.challengeId : ''
    const action = body.action === 'complete' ? 'complete' : 'join'
    const challenge = CATALOG.find(c => c.id === challengeId)
    if (!challenge) return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
    const db = adminDb()
    const participantRef = db.collection('challengeParticipants').doc(`${challengeId}_${decoded.uid}`)
    const userRef = db.collection('users').doc(decoded.uid)
    if (action === 'join') {
      const existing = await participantRef.get()
      if (!existing.exists) await participantRef.set({ challengeId, userId: decoded.uid, status: 'active', progress: 0, joinedAt: FieldValue.serverTimestamp() })
      return NextResponse.json({ status: 'active' })
    }
    const result = await db.runTransaction(async tx => {
      const [participantSnap, userSnap] = await Promise.all([tx.get(participantRef), tx.get(userRef)])
      if (!participantSnap.exists) throw new Error('NOT_JOINED')
      if (!userSnap.exists) throw new Error('PROFILE_NOT_FOUND')
      const participant = participantSnap.data()!
      if (participant.status === 'completed') return { status: 'completed', xpAwarded: 0 }
      const joinedAt = participant.joinedAt?.toDate?.() || new Date(0)
      let progress = 0
      if (challenge.action === 'submit_video') {
        const snap = await db.collection('videos').where('creatorId', '==', decoded.uid).limit(100).get()
        progress = snap.docs.filter(d => (d.data().createdAt?.toDate?.() || new Date(0)) >= joinedAt).length
      } else if (challenge.action === 'feedback') {
        const snap = await db.collection('feedback').where('fromCreatorId', '==', decoded.uid).limit(100).get()
        progress = snap.docs.filter(d => (d.data().createdAt?.toDate?.() || new Date(0)) >= joinedAt).length
      } else {
        const snap = await db.collection('follows').where('followerId', '==', decoded.uid).limit(100).get()
        progress = snap.docs.filter(d => (d.data().createdAt?.toDate?.() || new Date(0)) >= joinedAt).length
      }
      if (progress < challenge.requirement) throw new Error(`PROGRESS_${progress}`)
      const user = userSnap.data()!
      const nextXp = Number(user.xp || 0) + challenge.xp
      tx.update(participantRef, { status: 'completed', progress: challenge.requirement, completedAt: FieldValue.serverTimestamp(), xpAwarded: challenge.xp })
      tx.update(userRef, { xp: nextXp, reputation: Number(user.reputation || 0) + 1, level: nextXp >= 2000 ? 'Creator Leader' : nextXp >= 1000 ? 'Community Builder' : nextXp >= 500 ? 'Rising Creator' : nextXp >= 150 ? 'Active Creator' : 'New Creator' })
      return { status: 'completed', progress, xpAwarded: challenge.xp }
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const status = message === 'NOT_JOINED' ? 400 : message === 'PROFILE_NOT_FOUND' ? 404 : message.startsWith('PROGRESS_') ? 400 : message === 'UNAUTHORIZED' ? 401 : 500
    return NextResponse.json({ error: message.startsWith('PROGRESS_') ? `Keep going — you have completed ${message.slice(9)} of the required actions.` : message || 'Challenge could not be completed.' }, { status })
  }
}