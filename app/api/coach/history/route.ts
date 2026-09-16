import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '../../../../lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7))
    const snap = await adminDb().collection('coachAnalyses').where('userId', '==', decoded.uid).limit(30).get()
    const analyses: any[] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    analyses.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    return NextResponse.json({ analyses })
  } catch (error) {
    console.error('coach history failed', error)
    return NextResponse.json({ error: 'Could not load coach history.' }, { status: 500 })
  }
}
