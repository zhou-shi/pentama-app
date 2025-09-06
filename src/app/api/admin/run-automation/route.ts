import { auth, db } from '@/lib/firebase-admin';
import { Hasil, Proposal, Sidang } from '@/types/user';
import { NextRequest, NextResponse } from 'next/server';

// Helper function untuk memvalidasi token admin
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
      return { isAdmin: false, user: null };
    }
  }
  return { isAdmin: false, user: null };
}

// Helper function untuk mem-parsing tanggal secara aman
function safeParseDate(dateString: string): Date | null {
  if (!dateString) return null;
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  const parts = dateString.split(', ');
  if (parts.length === 2) {
    date = new Date(parts[1]);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  console.warn(`[Automation] Gagal mem-parsing tanggal: "${dateString}"`);
  return null;
}

// Helper function untuk menentukan grade berdasarkan skor
const calculateGrade = (score: number | null | undefined): string => {
  if (score == null) return 'N/A';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 55) return 'D';
  return 'E';
};

// ===============================================================================================
// FUNGSI UTAMA API
// ===============================================================================================
export async function POST(request: NextRequest) {
  const { isAdmin } = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Akses ditolak: Hanya admin yang diizinkan.' }, { status: 403 });
  }

  try {
    const logs: string[] = [];
    const now = new Date();
    const batch = db.batch();
    const collections: ("proposal" | "hasil" | "sidang")[] = ["proposal", "hasil", "sidang"];

    // ================== TUGAS 1: UPDATE STAGE BERDASARKAN JADWAL ==================
    for (const collectionName of collections) {
      const querySnapshot = await db.collection(collectionName).where("stage", "in", ["approved", "pending"]).get();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const scheduleDate = safeParseDate(data.schedule?.date);
        if (scheduleDate && scheduleDate <= now) {
          logs.push(`Stage updated for ${collectionName}/${doc.id} to 'in-progress'.`);
          batch.update(doc.ref, { stage: "in-progress", updatedAt: now.toISOString() });
        }
      });
    }

    // ================== TUGAS 2: KALKULASI NILAI, GRADE, & STAGE LANJUTAN ==================
    for (const collectionName of collections) {
      const querySnapshot = await db.collection(collectionName)
        .where("stage", "not-in", ["completed", "rejected", "revision"])
        .get();

      for (const doc of querySnapshot.docs) {
        const data = doc.data() as Proposal | Hasil | Sidang;
        const scores = data.scores;

        // Cek jika semua skor sudah terisi dan belum ada averageScore (untuk efisiensi)
        if (data.averageScore == null && scores && scores.supervisor1 != null && scores.supervisor2 != null && scores.examiner1 != null && scores.examiner2 != null) {
          const totalScore = scores.supervisor1 + scores.supervisor2 + scores.examiner1 + scores.examiner2;
          const averageScore = parseFloat((totalScore / 4).toFixed(2));
          let newStage = data.stage;

          if (collectionName === "proposal") {
            newStage = averageScore >= 70 ? "completed" : "revision";
          } else {
            newStage = "completed";
          }

          const updatePayload: { [key: string]: any } = {
            averageScore,
            stage: newStage,
            updatedAt: now.toISOString(),
            grade: calculateGrade(averageScore)
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
          logs.push(`Scores & grade calculated for ${collectionName}/${doc.id}. New stage: ${newStage}.`);
          batch.update(doc.ref, updatePayload);
        }
      }
    }

    // ================== TUGAS 3: PENANGANAN KETERLAMBATAN PENILAIAN ==================
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const collectionName of collections) {
      const querySnapshot = await db.collection(collectionName).where("stage", "in", ["in-progress"]).get();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const scheduleDate = safeParseDate(data.schedule?.date);
        if (scheduleDate && scheduleDate < twentyFourHoursAgo) {
          const scores = data.scores || {};
          const personnel = ["supervisor1", "supervisor2", "examiner1", "examiner2"];
          let needsUpdate = false;
          const updatePayload: { [key: string]: any } = {};

          personnel.forEach((p) => {
            if (scores[p] === null || scores[p] === undefined) {
              needsUpdate = true;
              updatePayload[`scores.${p}`] = 35;
              updatePayload[`feedback.${p}`] = "Dosen tidak melakukan penilaian.";
              logs.push(`Auto-scoring for ${p} on ${collectionName}/${doc.id}.`);
            }
          });

          if (needsUpdate) {
            updatePayload.updatedAt = now.toISOString();
            batch.update(doc.ref, updatePayload);
          }
        }
      });
    }

    await batch.commit();

    const message = logs.length > 0 ? `Proses berhasil. ${logs.length} aksi dilakukan.` : 'Otomatisasi berjalan, tidak ada aksi baru yang perlu dilakukan.';
    return NextResponse.json({ message, logs });
  } catch (error) {
    console.error("Automation API error:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server saat menjalankan otomatisasi.', error: (error as Error).message }, { status: 500 });
  }
}