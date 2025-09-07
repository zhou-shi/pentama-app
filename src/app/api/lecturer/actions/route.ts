import { db } from '@/lib/firebase-admin';
import type { Hasil, Proposal, Scores, Sidang } from '@/types/user';
import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  action: 'SUBMIT_EVALUATION';
  payload: {
    docId: string;
    collectionName: string;
    score: number;
    feedback: string;
  };
}

const getLecturerRole = (doc: Proposal | Hasil | Sidang, uid: string): keyof Scores | null => {
  if (doc.supervisors?.supervisor1Uid === uid) return 'supervisor1';
  if (doc.supervisors?.supervisor2Uid === uid) return 'supervisor2';
  if (doc.examiners?.examiner1Uid === uid) return 'examiner1';
  if (doc.examiners?.examiner2Uid === uid) return 'examiner2';
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid } = decodedToken;

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'lecturer') {
      return NextResponse.json({ error: 'Forbidden: User is not a lecturer' }, { status: 403 });
    }

    const { action, payload }: RequestBody = await req.json();

    switch (action) {
      case 'SUBMIT_EVALUATION': {
        const { docId, collectionName, score, feedback } = payload;

        if (!docId || !collectionName || typeof score !== 'number' || score < 0 || score > 100) {
          return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
        }

        const docRef = db.collection(collectionName).doc(docId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
        }

        const docData = docSnap.data() as Proposal | Hasil | Sidang;

        const lecturerRole = getLecturerRole(docData, uid);
        if (!lecturerRole) {
          return NextResponse.json({ error: 'Anda tidak memiliki izin untuk menilai dokumen ini.' }, { status: 403 });
        }

        const updateData = {
          [`scores.${lecturerRole}`]: score,
          [`feedback.${lecturerRole}`]: feedback || '',
          updatedAt: new Date().toISOString(),
        };

        await docRef.update(updateData);
        return NextResponse.json({ message: 'Penilaian berhasil dikirim.' }, { status: 200 });
      }

      default:
        return NextResponse.json({ error: `Action "${action}" tidak dikenali.` }, { status: 400 });
    }
  } catch (error) {
    console.error('[Lecturer API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan internal pada server.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}