import { auth, db } from '@/lib/firebase-admin';
import { Hasil, Proposal, Sidang } from '@/types/user';
import { NextRequest, NextResponse } from 'next/server';

async function verifyAdmin(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists && userDoc.data()?.isAdmin) {
        return { isAdmin: true, user: userDoc.data() };
      }
    } catch (error) {
      console.error("Error verifying token:", error);
    }
  }
  return { isAdmin: false, user: null };
}

function safeParseDate(dateString: string): Date | null {
  if (!dateString) return null;
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;
  const parts = dateString.split(', ');
  if (parts.length === 2) {
    date = new Date(parts[1]);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

const calculateGrade = (score: number | null | undefined): string => {
  if (score == null) return 'N/A';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 55) return 'D';
  return 'E';
};

export async function POST(request: NextRequest) {
  const { isAdmin } = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const logs: string[] = [];
    const now = new Date();
    const batch = db.batch();
    const collections: ("proposal" | "hasil" | "sidang")[] = ["proposal", "hasil", "sidang"];

    for (const collectionName of collections) {
      const querySnapshot = await db.collection(collectionName).where("stage", "in", ["approved", "pending"]).get();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const scheduleDate = safeParseDate(data.schedule?.date);
        if (scheduleDate && scheduleDate <= now) {
          batch.update(doc.ref, { stage: "in-progress", updatedAt: now.toISOString() });
        }
      });
    }

    for (const collectionName of collections) {
      const q = await db.collection(collectionName).where("stage", "not-in", ["completed", "rejected", "revision"]).get();
      for (const doc of q.docs) {
        const data = doc.data() as Proposal | Hasil | Sidang;
        const scores = data.scores;
        if (data.averageScore == null && scores?.supervisor1 != null && scores?.supervisor2 != null && scores?.examiner1 != null && scores?.examiner2 != null) {
          const totalScore = scores.supervisor1 + scores.supervisor2 + scores.examiner1 + scores.examiner2;
          const averageScore = parseFloat((totalScore / 4).toFixed(2));
          let newStage = data.stage;
          if (collectionName === "proposal") newStage = averageScore >= 70 ? "completed" : "revision";
          else newStage = "completed";
          
          const updatePayload: Record<string, string | number | object | null> = {
            averageScore, stage: newStage, updatedAt: now.toISOString(), grade: calculateGrade(averageScore)
          };

          if (collectionName === "sidang" && newStage === "completed") {
            const resultDoc = await db.collection("hasil").doc((data as Sidang).resultsId).get();
            if (resultDoc.exists) {
              const resultData = resultDoc.data();
              if (resultData?.averageScore != null) {
                const finalScore = parseFloat(((0.4 * resultData.averageScore) + (0.6 * averageScore)).toFixed(2));
                updatePayload.finalScore = finalScore;
                updatePayload.grade = calculateGrade(finalScore);
              }
            }
          }
          logs.push(`Scores & grade calculated for ${collectionName}/${doc.id}.`);
          batch.update(doc.ref, updatePayload);
        }
      }
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const collectionName of collections) {
      const q = await db.collection(collectionName).where("stage", "in", ["in-progress"]).get();
      q.forEach((doc) => {
        const data = doc.data();
        const scheduleDate = safeParseDate(data.schedule?.date);
        if (scheduleDate && scheduleDate < twentyFourHoursAgo) {
          const scores = data.scores || {};
          const personnel = ["supervisor1", "supervisor2", "examiner1", "examiner2"];
          let needsUpdate = false;
          const updatePayload: Record<string, string | number> = {};
          personnel.forEach((p) => {
            if (scores[p] == null) {
              needsUpdate = true;
              updatePayload[`scores.${p}`] = 35;
              updatePayload[`feedback.${p}`] = "Dosen tidak melakukan penilaian.";
            }
          });
          if (needsUpdate) {
            batch.update(doc.ref, updatePayload);
          }
        }
      });
    }

    await batch.commit();
    const message = logs.length > 0 ? `Proses berhasil. ${logs.length} aksi dilakukan.` : 'Otomatisasi berjalan, tidak ada aksi baru.';
    return NextResponse.json({ message, logs });
  } catch (error) {
    console.error("Automation API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
    return NextResponse.json({ message: 'Gagal menjalankan otomatisasi.', error: errorMessage }, { status: 500 });
  }
}
