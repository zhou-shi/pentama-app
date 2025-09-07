// api/submission/rute.ts
import { generateUniquePublicId } from '@/lib/cloudinary-client';
import { deleteFromCloudinaryServer, uploadStreamToCloudinary } from '@/lib/cloudinary-server';
import { db } from '@/lib/firebase-admin';
import { Hasil, Proposal, User } from '@/types/user';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

function normalizeNameForComparison(name?: string, title?: string): string {
  let combined = name || '';
  if (title) {
    combined += ` ${title}`;
  }
  return combined.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const submissionType = formData.get('submissionType') as 'proposal' | 'hasil' | 'sidang';
    const uid = formData.get('uid') as string;
    const title = formData.get('title') as string;
    const researchField = formData.get('researchField') as any;
    const supervisor1FromFile = formData.get('supervisor1') as string;
    const supervisor2FromFile = formData.get('supervisor2') as string;

    const isResubmission = formData.get('isResubmission') === 'true';
    const oldDocId = formData.get('oldDocId') as string | null;
    const oldPublicId = formData.get('oldPublicId') as string | null;

    if (!file || !submissionType || !uid || !title || !researchField || !supervisor1FromFile || !supervisor2FromFile) {
      return NextResponse.json({ message: 'Data yang dikirim tidak lengkap.' }, { status: 400 });
    }

    if (isResubmission && oldDocId && oldPublicId) {
      console.log(submissionType, oldDocId, oldPublicId);
      const cleanPublicId = oldPublicId.replace(/\.[^/.]+$/, "");
      await deleteFromCloudinaryServer(cleanPublicId, 'image');
      await db.collection(submissionType).doc(oldDocId).delete();
    }

    const presets = {
      proposal: process.env.NEXT_PUBLIC_UPLOAD_PRESET_PROPOSALS!,
      hasil: process.env.NEXT_PUBLIC_UPLOAD_PRESET_RESULTS!,
      sidang: process.env.NEXT_PUBLIC_UPLOAD_PRESET_DEFENSES!
    };

    const preset = presets[submissionType];
    if (!preset) return NextResponse.json({ message: 'Tipe submission tidak valid.' }, { status: 400 });

    const publicId = generateUniquePublicId(uid, submissionType);
    const uploadResult = await uploadStreamToCloudinary(file, preset, 'auto', publicId);

    const docRef = await db.runTransaction(async (transaction) => {
      const roomsQuery = db.collection('ruang').where('isAvailable', '==', true).orderBy('usageCount', 'asc').limit(1);
      const roomsSnapshot = await transaction.get(roomsQuery);
      if (roomsSnapshot.empty) throw new Error("Tidak ada ruangan yang tersedia saat ini.");
      const roomDoc = roomsSnapshot.docs[0];

      const now = new Date();
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + 7);
      const schedule = {
        date: scheduleDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: "09:00 WIB", room: roomDoc.data().name, roomUid: roomDoc.id
      };
      let newDocData: any = {
        uid, title, researchField, fileName: file.name, fileUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id, stage: 'submitted',
        submittedAt: now.toISOString(), createdAt: now.toISOString(), updatedAt: now.toISOString(),
        autoRejectAt: new Date(new Date().setDate(now.getDate() + 3)).toISOString(), schedule,
      };

      if (submissionType === 'proposal') {
        // --- LOGIKA KHUSUS TAHAP PROPOSAL ---
        const lecturersSnapshot = await transaction.get(db.collection('users').where('role', '==', 'lecturer').where('lecturer.expertiseField', '==', researchField));
        const allLecturers = lecturersSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as User) }));

        const supervisor1 = allLecturers.find(d => normalizeNameForComparison(d.name, d.lecturer?.academicTitle) === normalizeNameForComparison(supervisor1FromFile));
        const supervisor2 = allLecturers.find(d => normalizeNameForComparison(d.name, d.lecturer?.academicTitle) === normalizeNameForComparison(supervisor2FromFile));

        if (!supervisor1 || !supervisor2) throw new Error("Data dosen pembimbing pada file tidak cocok dengan data di sistem.");

        const supervisorUids = [supervisor1.uid, supervisor2.uid];
        const potentialExaminers = allLecturers.filter(d => !supervisorUids.includes(d.uid)).sort((a, b) => (a.lecturer?.examinerCount || 0) - (b.lecturer?.examinerCount || 0));
        if (potentialExaminers.length < 2) throw new Error("Tidak cukup dosen penguji yang tersedia.");

        const examiner1 = potentialExaminers[0];
        const examiner2 = potentialExaminers[1];
        newDocData.supervisors = { supervisor1: `${supervisor1.name}, ${supervisor1.lecturer?.academicTitle}`, supervisor2: `${supervisor2.name}, ${supervisor2.lecturer?.academicTitle}`, supervisor1Uid: supervisor1.uid, supervisor2Uid: supervisor2.uid };
        newDocData.examiners = { examiner1: `${examiner1.name}, ${examiner1.lecturer?.academicTitle}`, examiner2: `${examiner2.name}, ${examiner2.lecturer?.academicTitle}`, examiner1Uid: examiner1.uid, examiner2Uid: examiner2.uid };

        // Naikkan examinerCount HANYA untuk tahap proposal
        transaction.update(db.collection('users').doc(examiner1.id), { 'lecturer.examinerCount': FieldValue.increment(1) });
        transaction.update(db.collection('users').doc(examiner2.id), { 'lecturer.examinerCount': FieldValue.increment(1) });
      } else {
        // --- LOGIKA VALIDASI & PENYALINAN UNTUK HASIL & SIDANG ---
        const prevDocId = (submissionType === 'hasil' ? formData.get('proposalId') : formData.get('resultsId')) as string | null;
        if (!prevDocId) throw new Error("ID tahap sebelumnya tidak ditemukan.");

        // Untuk validasi, kita selalu merujuk ke data proposal asli
        const proposalRef = db.collection('proposal').doc(submissionType === 'hasil' ? prevDocId : (await transaction.get(db.collection('hasil').doc(prevDocId))).data()?.proposalId);
        const proposalDoc = await transaction.get(proposalRef);
        if (!proposalDoc.exists) throw new Error("Dokumen proposal asli tidak ditemukan untuk validasi pembimbing.");
        const proposalData = proposalDoc.data() as Proposal;

        // VALIDASI KRUSIAL: Pastikan pembimbing di file baru sama dengan di proposal.
        const normalizedSupervisor1FromFile = normalizeNameForComparison(supervisor1FromFile);
        const normalizedSupervisor2FromFile = normalizeNameForComparison(supervisor2FromFile);
        const normalizedSupervisor1FromDB = normalizeNameForComparison(proposalData.supervisors?.supervisor1);
        const normalizedSupervisor2FromDB = normalizeNameForComparison(proposalData.supervisors?.supervisor2);

        if (normalizedSupervisor1FromFile !== normalizedSupervisor1FromDB || normalizedSupervisor2FromFile !== normalizedSupervisor2FromDB) {
          throw new Error("Pembimbing pada file tidak sesuai dengan data proposal. Harap gunakan file dengan data pembimbing yang benar.");
        }

        // Ambil data dari tahap sebelumnya (hasil untuk sidang, proposal untuk hasil)
        const prevCollectionName = submissionType === 'hasil' ? 'proposal' : 'hasil';
        const prevDoc = await transaction.get(db.collection(prevCollectionName).doc(prevDocId));
        const prevData = prevDoc.data() as Proposal | Hasil;

        // Salin data pembimbing dan penguji, JANGAN pilih yang baru
        newDocData.supervisors = prevData.supervisors;
        newDocData.examiners = prevData.examiners;
        if (submissionType === 'hasil') newDocData.proposalId = formData.get('proposalId') as string;
        if (submissionType === 'sidang') newDocData.resultsId = formData.get('resultsId') as string;
      }

      transaction.update(roomDoc.ref, { usageCount: FieldValue.increment(1) });
      const newDocRef = db.collection(submissionType).doc();
      transaction.set(newDocRef, newDocData);
      return newDocRef;
    });

    const message = isResubmission ? 'File berhasil dikirim ulang!' : 'File berhasil diunggah dan diproses!';
    return NextResponse.json({ message, id: docRef.id }, { status: 201 });

  } catch (error) {
    console.error("API Submission Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

