// components/AchievementCard.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hasil, Proposal, Sidang } from '@/types/user';
import { ArrowRight, CheckCircle, FileText, Send, XCircle } from 'lucide-react';
import { useState } from 'react';
import { SmartFileUploadDialog } from './SmartFileUploadDialog';

type SubmissionData = Proposal | Hasil | Sidang;

interface AchievementCardProps {
  proposal: Proposal | null;
  hasil: Hasil | null;
  sidang: Sidang | null;
  isLoading: boolean;
  className?: string;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-500 flex-shrink-0 mr-4">{label}</span>
    <span className="font-medium text-gray-800 text-right">{value || '-'}</span>
  </div>
);

const ScoreRow = ({
  label,
  name,
  score,
}: {
  label: string;
  name: string | undefined;
  score: number | null | undefined;
}) => (
  <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-200 last:border-b-0">
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{name || 'N/A'}</p>
    </div>
    <p className="font-bold text-lg text-gray-900">{score ?? '-'}</p>
  </div>
);

const ScoreDetails = ({ data }: { data: SubmissionData }) => (
  <div className="space-y-1 mb-4 p-4 bg-gray-50/80 rounded-lg border">
    <ScoreRow
      label="Pembimbing 1"
      name={data.supervisors?.supervisor1}
      score={data.scores?.supervisor1}
    />
    <ScoreRow
      label="Pembimbing 2"
      name={data.supervisors?.supervisor2}
      score={data.scores?.supervisor2}
    />
    <ScoreRow
      label="Penguji 1"
      name={data.examiners?.examiner1}
      score={data.scores?.examiner1}
    />
    <ScoreRow
      label="Penguji 2"
      name={data.examiners?.examiner2}
      score={data.scores?.examiner2}
    />
    <div className="pt-3 mt-2 flex justify-between items-center">
      <span className="font-semibold">
        Rata-rata:{' '}
        <span className="text-xl font-bold text-blue-600">
          {data.averageScore ?? '-'}
        </span>
      </span>
      <span className="font-semibold">
        Grade:{' '}
        <span className="text-xl font-bold text-blue-600">
          {data.grade ?? '-'}
        </span>
      </span>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <Card className="shadow-lg rounded-2xl p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded-lg"></div>
      <div className="h-20 bg-gray-200 rounded-lg"></div>
      <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
    </div>
  </Card>
);

export const AchievementCard = ({
  proposal,
  hasil,
  sidang,
  isLoading,
  className,
}: AchievementCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<
    'proposal' | 'hasil' | 'sidang'
  >('proposal');
  const openDialog = (type: 'proposal' | 'hasil' | 'sidang') => {
    setSubmissionType(type);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const renderContent = () => {
    // Tahap Sidang
    if (sidang) {
      switch (sidang.stage) {
        case 'submitted':
          return (
            <div>
              <h3 className="text-xl font-bold text-orange-500 mb-2">
                Sidang Terkirim
              </h3>
              <p className="text-gray-600">
                Dokumen sidang akhir Anda berhasil terkirim dan menunggu
                peninjauan.
              </p>
            </div>
          );
        case 'under-review':
          return (
            <div>
              <h3 className="text-xl font-bold text-blue-500 mb-2">
                Sidang Ditinjau
              </h3>
              <p className="text-gray-600">
                Dokumen sedang ditinjau oleh admin, menunggu persetujuan.
              </p>
            </div>
          );
        case 'pending':
          return (
            <div>
              <h3 className="text-xl font-bold text-yellow-600 mb-2">
                Jadwal Sidang Ditunda
              </h3>
              <p className="text-gray-600 mb-4">
                Alasan: <strong>{sidang.adminNotes}</strong>
              </p>
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                <InfoRow
                  label="Jadwal Baru"
                  value={`${sidang.schedule?.date}, ${sidang.schedule?.time}`}
                />
              </div>
            </div>
          );
        case 'approved':
          return (
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-4">
                Jadwal Sidang Disetujui
              </h3>
              <div className="space-y-2">
                <InfoRow
                  label="Judul"
                  value={sidang.title}
                />
                <InfoRow
                  label="Jadwal"
                  value={`${sidang.schedule?.date}, ${sidang.schedule?.time}`}
                />
                <InfoRow
                  label="Ruang"
                  value={sidang.schedule?.room}
                />
                <InfoRow
                  label="Pembimbing 1"
                  value={sidang.supervisors?.supervisor1}
                />
                <InfoRow
                  label="Pembimbing 2"
                  value={sidang.supervisors?.supervisor2}
                />
                <InfoRow
                  label="Penguji 1"
                  value={sidang.examiners?.examiner1}
                />
                <InfoRow
                  label="Penguji 2"
                  value={sidang.examiners?.examiner2}
                />
              </div>
            </div>
          );
        // [PERBAIKAN] Menambahkan case untuk 'in-progress'
        case 'in-progress':
          return (
            <div>
              <h3 className="text-xl font-bold text-teal-600 mb-4">
                Sidang Sedang Berlangsung
              </h3>
              <p className="text-gray-600 mb-4">
                Semoga berhasil! Hasil akan segera diumumkan setelah penilaian
                selesai.
              </p>
              <div className="space-y-2">
                <InfoRow
                  label="Judul"
                  value={sidang.title}
                />
                <InfoRow
                  label="Jadwal"
                  value={`${sidang.schedule?.date}, ${sidang.schedule?.time}`}
                />
                <InfoRow
                  label="Ruang"
                  value={sidang.schedule?.room}
                />
                <InfoRow
                  label="Pembimbing 1"
                  value={sidang.supervisors?.supervisor1}
                />
                <InfoRow
                  label="Pembimbing 2"
                  value={sidang.supervisors?.supervisor2}
                />
                <InfoRow
                  label="Penguji 1"
                  value={sidang.examiners?.examiner1}
                />
                <InfoRow
                  label="Penguji 2"
                  value={sidang.examiners?.examiner2}
                />
              </div>
            </div>
          );
        case 'rejected':
          return (
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                <XCircle className="inline mr-2" /> Sidang Ditolak
              </h3>
              <p className="text-gray-600 mb-4">
                Alasan: <strong>{sidang.rejectionReason}</strong>
              </p>
              <Button
                onClick={() => openDialog('sidang')}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" /> Kirim Ulang Sidang
              </Button>
            </div>
          );
        case 'completed':
          return (
            <div>
              <h3 className="text-xl font-bold text-green-700 mb-2">
                <CheckCircle className="inline mr-2" /> Selamat, Anda Lulus!
              </h3>
              <p className="text-gray-600 mb-4">
                Anda telah menyelesaikan seluruh rangkaian Tugas Akhir.
              </p>
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <InfoRow
                  label={`Proposal (${proposal?.grade})`}
                  value={`${proposal?.averageScore ?? '-'}/100`}
                />
                <InfoRow
                  label={`Hasil (${hasil?.grade})`}
                  value={`${hasil?.averageScore ?? '-'}/100`}
                />
                <InfoRow
                  label={`Sidang (${sidang.grade})`}
                  value={`${sidang.averageScore ?? '-'}/100`}
                />
                <div className="pt-2 border-t mt-2">
                  <InfoRow
                    label="Nilai Akhir"
                    value={
                      <span className="text-2xl font-bold text-green-700">
                        {sidang.finalScore}/100
                      </span>
                    }
                  />
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Menunggu Nilai Sidang
              </h3>
              <p className="text-gray-600">
                Sidang telah dilaksanakan. Harap tunggu rilis nilai akhir.
              </p>
            </div>
          );
      }
    }

    // Tahap Hasil
    if (hasil) {
      switch (hasil.stage) {
        case 'submitted':
          return (
            <div>
              <h3 className="text-xl font-bold text-orange-500 mb-2">
                Seminar Hasil Terkirim
              </h3>
              <p className="text-gray-600">
                Laporan hasil Anda berhasil terkirim dan menunggu peninjauan.
              </p>
            </div>
          );
        case 'under-review':
          return (
            <div>
              <h3 className="text-xl font-bold text-blue-500 mb-2">
                Seminar Hasil Ditinjau
              </h3>
              <p className="text-gray-600">
                Laporan sedang ditinjau oleh admin, menunggu persetujuan.
              </p>
            </div>
          );
        case 'pending':
          return (
            <div>
              <h3 className="text-xl font-bold text-yellow-600 mb-2">
                Jadwal Seminar Hasil Ditunda
              </h3>
              <p className="text-gray-600 mb-4">
                Alasan: <strong>{hasil.adminNotes}</strong>
              </p>
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                <InfoRow
                  label="Jadwal Baru"
                  value={`${hasil.schedule?.date}, ${hasil.schedule?.time}`}
                />
              </div>
            </div>
          );
        case 'approved':
          return (
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-4">
                Jadwal Seminar Hasil Disetujui
              </h3>
              <div className="space-y-2">
                <InfoRow
                  label="Judul"
                  value={hasil.title}
                />
                <InfoRow
                  label="Jadwal"
                  value={`${hasil.schedule?.date}, ${hasil.schedule?.time}`}
                />
                <InfoRow
                  label="Ruang"
                  value={hasil.schedule?.room}
                />
                <InfoRow
                  label="Pembimbing 1"
                  value={hasil.supervisors?.supervisor1}
                />
                <InfoRow
                  label="Pembimbing 2"
                  value={hasil.supervisors?.supervisor2}
                />
                <InfoRow
                  label="Penguji 1"
                  value={hasil.examiners?.examiner1}
                />
                <InfoRow
                  label="Penguji 2"
                  value={hasil.examiners?.examiner2}
                />
              </div>
            </div>
          );
        // [PERBAIKAN] Menambahkan case untuk 'in-progress'
        case 'in-progress':
          return (
            <div>
              <h3 className="text-xl font-bold text-teal-600 mb-4">
                Seminar Hasil Berlangsung
              </h3>
              <p className="text-gray-600 mb-4">
                Tim penguji dan pembimbing akan segera memberikan penilaian.
              </p>
              <div className="space-y-2">
                <InfoRow
                  label="Judul"
                  value={hasil.title}
                />
                <InfoRow
                  label="Jadwal"
                  value={`${hasil.schedule?.date}, ${hasil.schedule?.time}`}
                />
                <InfoRow
                  label="Ruang"
                  value={hasil.schedule?.room}
                />
                <InfoRow
                  label="Pembimbing 1"
                  value={hasil.supervisors?.supervisor1}
                />
                <InfoRow
                  label="Pembimbing 2"
                  value={hasil.supervisors?.supervisor2}
                />
                <InfoRow
                  label="Penguji 1"
                  value={hasil.examiners?.examiner1}
                />
                <InfoRow
                  label="Penguji 2"
                  value={hasil.examiners?.examiner2}
                />
              </div>
            </div>
          );
        case 'rejected':
          return (
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                <XCircle className="inline mr-2" /> Seminar Hasil Ditolak
              </h3>
              <p className="text-gray-600 mb-4">
                Alasan: <strong>{hasil.rejectionReason}</strong>
              </p>
              <Button
                onClick={() => openDialog('hasil')}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" /> Kirim Ulang Hasil
              </Button>
            </div>
          );
        case 'revision':
          return (
            <div>
              <h3 className="text-xl font-bold text-yellow-600 mb-2">
                Revisi Seminar Hasil
              </h3>
              <p className="text-gray-600 mb-4">
                Berikut rincian nilai Anda. Segera lakukan perbaikan.
              </p>
              <ScoreDetails data={hasil} />
              <Button
                onClick={() => openDialog('hasil')}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" /> Kirim Revisi Hasil
              </Button>
            </div>
          );
        case 'completed':
          return (
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Seminar Hasil Selesai!
              </h3>
              <p className="text-gray-600 mb-4">
                Kerja bagus! Segera siapkan laporan akhir untuk maju ke tahap
                terakhir.
              </p>
              <ScoreDetails data={hasil} />
              <Button
                onClick={() => openDialog('sidang')}
                className="w-full mt-4"
              >
                Lanjut ke Sidang Akhir <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          );
        default:
          return (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Menunggu Nilai Seminar Hasil
              </h3>
              <p className="text-gray-600">
                Seminar hasil telah dilaksanakan. Harap tunggu rilis nilai.
              </p>
            </div>
          );
      }
    }

    // Tahap Proposal
    if (proposal) {
      switch (proposal.stage) {
        case 'submitted':
          return (
            <div>
              <h3 className="text-xl font-bold text-orange-500 mb-2">
                Proposal Terkirim
              </h3>
              <p className="text-gray-600">
                Proposal Anda berhasil terkirim dan menunggu peninjauan oleh
                admin.
              </p>
            </div>
          );
        case 'under-review':
          return (
            <div>
              <h3 className="text-xl font-bold text-blue-500 mb-2">
                Proposal Ditinjau
              </h3>
              <p className="text-gray-600">
                Proposal sedang ditinjau oleh admin, menunggu persetujuan.
              </p>
            </div>
          );
        case 'pending':
          return (
            <div>
              <h3 className="text-xl font-bold text-yellow-600 mb-2">
                Jadwal Proposal Ditunda
              </h3>
              <p className="text-gray-600 mb-4">
                Alasan: <strong>{proposal.adminNotes}</strong>
              </p>
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                <InfoRow
                  label="Jadwal Baru"
                  value={`${proposal.schedule?.date}, ${proposal.schedule?.time}`}
                />
              </div>
            </div>
          );
        case 'approved':
          return (
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-4">
                Jadwal Proposal Disetujui
              </h3>
              <div className="space-y-2">
                <InfoRow
                  label="Judul"
                  value={proposal.title}
                />
                <InfoRow
                  label="Jadwal"
                  value={`${proposal.schedule?.date}, ${proposal.schedule?.time}`}
                />
                <InfoRow
                  label="Ruang"
                  value={proposal.schedule?.room}
                />
                <InfoRow
                  label="Pembimbing 1"
                  value={proposal.supervisors?.supervisor1}
                />
                <InfoRow
                  label="Pembimbing 2"
                  value={proposal.supervisors?.supervisor2}
                />
                <InfoRow
                  label="Penguji 1"
                  value={proposal.examiners?.examiner1}
                />
                <InfoRow
                  label="Penguji 2"
                  value={proposal.examiners?.examiner2}
                />
              </div>
            </div>
          );
        // [PERBAIKAN] Menambahkan case untuk 'in-progress'
        case 'in-progress':
          return (
            <div>
              <h3 className="text-xl font-bold text-teal-600 mb-4">
                Seminar Proposal Berlangsung
              </h3>
              <p className="text-gray-600 mb-4">
                Tim penguji dan pembimbing akan segera memberikan penilaian.
              </p>
              <div className="space-y-2">
                <InfoRow
                  label="Judul"
                  value={proposal.title}
                />
                <InfoRow
                  label="Jadwal"
                  value={`${proposal.schedule?.date}, ${proposal.schedule?.time}`}
                />
                <InfoRow
                  label="Ruang"
                  value={proposal.schedule?.room}
                />
                <InfoRow
                  label="Pembimbing 1"
                  value={proposal.supervisors?.supervisor1}
                />
                <InfoRow
                  label="Pembimbing 2"
                  value={proposal.supervisors?.supervisor2}
                />
                <InfoRow
                  label="Penguji 1"
                  value={proposal.examiners?.examiner1}
                />
                <InfoRow
                  label="Penguji 2"
                  value={proposal.examiners?.examiner2}
                />
              </div>
            </div>
          );
        case 'rejected':
          return (
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                <XCircle className="inline mr-2" /> Proposal Ditolak
              </h3>
              <p className="text-gray-600 mb-4">
                Alasan: <strong>{proposal.rejectionReason}</strong>
              </p>
              <Button
                onClick={() => openDialog('proposal')}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" /> Kirim Ulang Proposal
              </Button>
            </div>
          );
        case 'revision':
          return (
            <div>
              <h3 className="text-xl font-bold text-yellow-600 mb-2">
                Revisi Proposal
              </h3>
              <p className="text-gray-600 mb-4">
                Berikut rincian nilai Anda. Segera lakukan perbaikan.
              </p>
              <ScoreDetails data={proposal} />
              <Button
                onClick={() => openDialog('proposal')}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" /> Kirim Revisi Proposal
              </Button>
            </div>
          );
        case 'completed':
          return (
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Proposal Selesai!
              </h3>
              <p className="text-gray-600 mb-4">
                Lanjutkan penelitian dan siapkan laporan hasil.
              </p>
              <ScoreDetails data={proposal} />
              <Button
                onClick={() => openDialog('hasil')}
                className="w-full mt-4"
              >
                Lanjut ke Seminar Hasil <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          );
        default:
          return (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Menunggu Nilai Proposal
              </h3>
              <p className="text-gray-600">
                Seminar proposal telah dilaksanakan. Harap tunggu rilis nilai.
              </p>
            </div>
          );
      }
    }

    // Tampilan Awal jika belum ada proposal
    return (
      <div className="text-center flex flex-col items-center justify-center h-full">
        <FileText
          size={48}
          className="mx-auto text-orange-400 mb-4"
        />
        <h3 className="text-xl font-bold text-gray-800">
          Mulai Perjalanan Tugas Akhir Anda
        </h3>
        <p className="text-gray-500 mt-2 mb-6">
          Satu langkah kecil untuk sebuah pencapaian besar. Ajukan proposal Anda
          sekarang!
        </p>
        <Button
          onClick={() => openDialog('proposal')}
          size="lg"
        >
          <Send className="w-4 h-4 mr-2" /> Kirim Proposal
        </Button>
      </div>
    );
  };

  return (
    <>
      <Card className={`shadow-lg rounded-2xl p-6 flex flex-col ${className}`}>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 scrollbar-hidden">
          {renderContent()}
        </div>
      </Card>
      <SmartFileUploadDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        submissionType={submissionType}
        proposalData={proposal}
        hasilData={hasil}
        sidangData={sidang}
      />
    </>
  );
};
