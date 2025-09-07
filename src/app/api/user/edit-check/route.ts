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
      const collections = ['proposal', 'hasil', 'sidang'];
      let isInvolved = false;
      for (const col of collections) {
        if (isInvolved) break;
        const supervisor1Query = db.collection(col).where(`supervisors.supervisor1Uid`, '==', uid).where('stage', 'not-in', ['completed', 'rejected']);
        const supervisor2Query = db.collection(col).where(`supervisors.supervisor2Uid`, '==', uid).where('stage', 'not-in', ['completed', 'rejected']);
        const examiner1Query = db.collection(col).where(`examiners.examiner1Uid`, '==', uid).where('stage', 'not-in', ['completed', 'rejected']);
        const examiner2Query = db.collection(col).where(`examiners.examiner2Uid`, '==', uid).where('stage', 'not-in', ['completed', 'rejected']);

        const [s1, s2, e1, e2] = await Promise.all([supervisor1Query.get(), supervisor2Query.get(), examiner1Query.get(), examiner2Query.get()]);

        if (!s1.empty || !s2.empty || !e1.empty || !e2.empty) {
          isInvolved = true;
        }
      }
      canEditExpertise = !isInvolved;
    }

    if (userData?.role === 'student') {
      const proposalSnap = await db.collection('proposal').where('uid', '==', uid).limit(1).get();
      const hasilSnap = await db.collection('hasil').where('uid', '==', uid).limit(1).get();
      const sidangSnap = await db.collection('sidang').where('uid', '==', uid).limit(1).get();
      canEditResearchField = proposalSnap.empty && hasilSnap.empty && sidangSnap.empty;
    }

    return NextResponse.json({ canEditExpertise, canEditResearchField }, { status: 200 });

  } catch (error) {
    console.error('[Edit Check API Error]', error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}