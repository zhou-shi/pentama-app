import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  action: string;
  payload: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // [PERBAIKAN] Kembalikan ke request.json() yang benar untuk API ini
    const { action, payload }: RequestBody = await request.json();

    switch (action) {
      case 'UPDATE_STAGE': {
        const { collectionName, docId, stage, reason } = payload;
        const updateData: Record<string, string | Date> = { stage, updatedAt: new Date().toISOString() };
        if (stage === 'rejected' && reason) {
          updateData.rejectionReason = reason as string;
        }
        await db.collection(collectionName).doc(docId).update(updateData);
        return NextResponse.json({ message: `Status berhasil diubah menjadi ${stage}` });
      }

      case 'APPROVE_SUBMISSION': {
        const { collectionName, docId, examiners } = payload;
        const docRef = db.collection(collectionName).doc(docId);

        await db.runTransaction(async (t) => {
          t.update(docRef, { stage: 'approved', updatedAt: new Date().toISOString() });

          if (examiners?.examiner1Uid) {
            const examiner1Ref = db.collection('users').doc(examiners.examiner1Uid);
            t.update(examiner1Ref, { 'lecturer.examinerCount': FieldValue.increment(1) });
          }
          if (examiners?.examiner2Uid) {
            const examiner2Ref = db.collection('users').doc(examiners.examiner2Uid);
            t.update(examiner2Ref, { 'lecturer.examinerCount': FieldValue.increment(1) });
          }
        });
        return NextResponse.json({ message: 'Pengajuan berhasil disetujui!' });
      }

      case 'UPDATE_PERSONNEL': {
        const { collectionName, docId, personnelType, personnelData } = payload;
        const updateField = personnelType === 'supervisors' ? { supervisors: personnelData } : { examiners: personnelData };
        await db.collection(collectionName).doc(docId).update({ ...updateField, updatedAt: new Date().toISOString() });
        return NextResponse.json({ message: `${personnelType} berhasil diperbarui!` });
      }

      case 'UPDATE_SCHEDULE': {
        const { collectionName, docId, scheduleData } = payload;
        await db.collection(collectionName).doc(docId).update({ schedule: scheduleData, updatedAt: new Date().toISOString() });
        return NextResponse.json({ message: 'Jadwal berhasil diperbarui!' });
      }

      case 'CREATE_ROOM': {
        const { roomData } = payload;
        const newRoom = { ...(roomData as object), usageCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        await db.collection('ruang').add(newRoom);
        return NextResponse.json({ message: 'Ruangan berhasil dibuat!' });
      }

      case 'UPDATE_ROOM': {
        const { id, ...dataToUpdate } = payload.roomData;
        await db.collection('ruang').doc(id).update({ ...dataToUpdate, updatedAt: new Date().toISOString() });
        return NextResponse.json({ message: 'Ruangan berhasil diperbarui!' });
      }

      case 'PENDING_SUBMISSION': {
        const { collectionName, docId, reason, durationInMinutes } = payload;
        const startTime = new Date();
        const newDateTime = new Date(startTime.getTime() + (durationInMinutes as number) * 60000);
        const newScheduleData = {
          date: newDateTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: newDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB",
          room: payload.room,
          roomUid: payload.roomUid,
        };
        const adminNote = `Jadwal ditunda pada ${new Date().toLocaleString('id-ID')}. Alasan: ${reason}. Jadwal baru akan dibuat setelah ${durationInMinutes} menit dari sekarang.`;
        await db.collection(collectionName).doc(docId).update({
          stage: 'pending',
          schedule: newScheduleData,
          adminNotes: adminNote,
          updatedAt: new Date().toISOString()
        });
        return NextResponse.json({ message: 'Jadwal berhasil ditunda!' });
      }

      default:
        return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin actions API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}