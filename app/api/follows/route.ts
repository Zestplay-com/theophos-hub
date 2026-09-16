import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../../lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7))
    const body = await request.json()
    const targetId = typeof body.targetId === 'string' ? body.targetId : ''
    const action = body.action === 'unfollow' ? 'unfollow' : 'follow'
    if (!targetId) return NextResponse.json({ error: 'targetId is required' }, { status: 400 })
    if (targetId === decoded.uid) return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })

    const db = adminDb()
    const targetRef = db.collection('users').doc(targetId)
    const targetSnap = await targetRef.get()
    if (!targetSnap.exists) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    const followId = `${decoded.uid}_${targetId}`
    const followRef = db.collection('follows').doc(followId)
    const existing = await followRef.get()

    if (action === 'unfollow') {
      if (existing.exists) await followRef.delete()
      return NextResponse.json({ following: false })
    }

    if (!existing.exists) {
      const actorSnap = await db.collection('users').doc(decoded.uid).get()
      await followRef.set({ followerId: decoded.uid, followingId: targetId, createdAt: FieldValue.serverTimestamp() })
      await db.collection('notifications').add({
        userId: targetId,
        type: 'follow',
        title: 'A creator followed you',
        message: `${actorSnap.data()?.displayName || 'A creator'} is now following your creator journey.`,
        fromCreatorId: decoded.uid,
        createdAt: FieldValue.serverTimestamp(),
      })
    }

    return NextResponse.json({ following: true })
  } catch (error) {
    console.error('follow service failed', error)
    return NextResponse.json({ error: 'Could not update the creator relationship.' }, { status: 500 })
  }
}
