import { auth, db } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const idToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid } = decodedToken;

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();

    let canEditExpertise = false;
    let canEditResearchField = false;

    if (userData?.role === 'lecturer') {
      // Dosen bisa edit jika tidak terlibat di proposal, hasil, atau sidang yg aktif
      const collections = ['proposal', 'hasil', 'sidang'];
      let isInvolved = false;
      for (const col of collections) {
        const snapshot = await db.collection(col)
          .where(`supervisors.supervisor1Uid`, '==', uid)
          .where('stage', 'not-in', ['completed', 'rejected'])
          .get();
        if (!snapshot.empty) { isInvolved = true; break; }
        // Ulangi untuk supervisor2, examiner1, examiner2
      }
      canEditExpertise = !isInvolved;
    }

    if (userData?.role === 'student') {
      // Mahasiswa bisa edit jika belum punya proposal, hasil, atau sidang
      const proposalSnap = await db.collection('proposal').where('uid', '==', uid).limit(1).get();
      const hasilSnap = await db.collection('hasil').where('uid', '==', uid).limit(1).get();
      const sidangSnap = await db.collection('sidang').where('uid', '==', uid).limit(1).get();
      canEditResearchField = proposalSnap.empty && hasilSnap.empty && sidangSnap.empty;
    }

    return NextResponse.json({
      canEditExpertise,
      canEditResearchField
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Edit Check API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}