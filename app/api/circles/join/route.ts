import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7))
    const body = await request.json()
    const circleId = typeof body.circleId === 'string' ? body.circleId : ''
    const action = body.action === 'leave' ? 'leave' : 'join'
    if (!circleId) return NextResponse.json({ error: 'circleId is required' }, { status: 400 })
    const db = adminDb()
    const circleRef = db.collection('circles').doc(circleId)
    const memberRef = db.collection('circleMembers').doc(`${circleId}_${decoded.uid}`)
    const result = await db.runTransaction(async tx => {
      const [circleSnap, memberSnap] = await Promise.all([tx.get(circleRef), tx.get(memberRef)])
      if (!circleSnap.exists) throw new Error('CIRCLE_NOT_FOUND')
      const circle = circleSnap.data()!
      if (action === 'leave') {
        if (circle.ownerId === decoded.uid) throw new Error('OWNER_CANNOT_LEAVE')
        if (memberSnap.exists) {
          tx.delete(memberRef)
          tx.update(circleRef, { memberCount: Math.max(0, Number(circle.memberCount || 1) - 1) })
        }
        return { joined: false, memberCount: Math.max(0, Number(circle.memberCount || 0) - (memberSnap.exists ? 1 : 0)) }
      }
      if (!memberSnap.exists) {
        tx.set(memberRef, { circleId, userId: decoded.uid, role: 'member', joinedAt: FieldValue.serverTimestamp() })
        tx.update(circleRef, { memberCount: Number(circle.memberCount || 0) + 1 })
        return { joined: true, memberCount: Number(circle.memberCount || 0) + 1 }
      }
      return { joined: true, memberCount: Number(circle.memberCount || 0) }
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const status = message === 'CIRCLE_NOT_FOUND' ? 404 : message === 'OWNER_CANNOT_LEAVE' ? 400 : 500
    return NextResponse.json({ error: message || 'Could not update circle membership.' }, { status })
  }
}