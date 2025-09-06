'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { calcOverall } from '@/lib/progress';
import { Hasil, Proposal, Sidang } from '@/types/user';
import { CalendarDays, Eye, FileText } from 'lucide-react';
import { useMemo } from 'react';
import { AchievementCard } from './AchievementCard';
import { ThreeScene } from './ThreeScene';
import { Button } from './ui/button';
import { Card } from './ui/card';

// [DIUBAH] Hapus f_auto dari transformasi URL
const getVielablePdfUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  // Hanya gunakan fl_attachment:view untuk menampilkan PDF asli
  return `${parts[0]}/upload/fl_attachment:view/${parts[1]}`;
};

const ProgressCircle = ({ percentage }: { percentage: number }) => {
  const radius = 30,
    circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative w-20 h-20">
      <svg
        className="w-full h-full"
        viewBox="0 0 80 80"
      >
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          className="text-orange-500"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
        {percentage}%
      </span>
    </div>
  );
};

type DocumentType = Proposal | Hasil | Sidang | null;
const DocumentRow = ({
  title,
  document,
}: {
  title: string;
  document: DocumentType;
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <FileText className="w-6 h-6 text-orange-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          {document?.submittedAt && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <CalendarDays className="w-3 h-3 mr-1.5" />
              <span>Diajukan pada: {formatDate(document?.submittedAt)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${document
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
            }`}
        >
          {document ? 'Tersedia' : 'Tidak Tersedia'}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={!document}
          onClick={() =>
            document &&
            window.open(getVielablePdfUrl(document.fileUrl), '_blank')
          }
          className="w-full sm:w-auto"
        >
          <Eye className="w-4 h-4 mr-2" /> Lihat
        </Button>
      </div>
    </div>
  );
};

export const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const { proposal, hasil, sidang, loading } = useStudentProgress();

  const progress = useMemo(() => {
    return calcOverall({ proposal, hasil, sidang });
  }, [proposal, hasil, sidang]);

  const renderProgressMessage = () => {
    if (loading) return 'Memuat data...';
    switch (progress.activeStage) {
      case 'sidang':
        if (progress.status === 'completed')
          return `Selamat! Nilai Akhir Anda: ${progress.finalScore || 'N/A'}`;
        return `Tahap Sidang Akhir: ${progress.breakdown.sidang}% selesai`;
      case 'hasil':
        return `Tahap Seminar Hasil: ${progress.breakdown.hasil}% selesai`;
      case 'proposal':
        return `Tahap Seminar Proposal: ${progress.breakdown.proposal}% selesai`;
      default:
        return 'Mulai perjalanan Anda!';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-1 space-y-6 flex flex-col max-h-max">
        <Card className="shadow-lg rounded-2xl p-4">
          <h2 className="text-xl font-bold">
            Halo, {userProfile?.name?.split(' ')[0]}
          </h2>
        </Card>
        <Card className="shadow-lg rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Status Tugas Akhir</h3>
              <p className="text-sm text-gray-500">{renderProgressMessage()}</p>
            </div>
            <ProgressCircle percentage={progress.overall} />
          </div>
        </Card>
        <AchievementCard
          proposal={proposal}
          hasil={hasil}
          sidang={sidang}
          isLoading={loading}
          className="flex-grow min-h-0 lg:max-h-[55vh]"
        />
      </div>

      <div className="lg:col-span-2 lg:max-h-[84vh] lg:overflow-hidden">
        <Card className="shadow-2xs rounded-2xl p-6 h-full flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Tahapan Tugas Akhir
                </h3>
                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg ${proposal?.stage === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white'
                      }`}
                  >
                    <p className="font-semibold">Seminar Proposal</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${proposal
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {proposal?.stage?.replace('-', ' ') || 'Belum diajukan'}
                    </span>
                  </div>
                  <div
                    className={`p-4 border rounded-lg ${hasil?.stage === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white'
                      }`}
                  >
                    <p className="font-semibold">Seminar Hasil</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${hasil
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {hasil?.stage?.replace('-', ' ') || 'Belum dimulai'}
                    </span>
                  </div>
                  <div
                    className={`p-4 border rounded-lg ${sidang?.stage === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white'
                      }`}
                  >
                    <p className="font-semibold">Sidang Akhir</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${sidang
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {sidang?.stage?.replace('-', ' ') || 'Belum dimulai'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex-1 min-h-[300px] md:min-h-0 flex items-center justify-center">
              <div className="absolute w-full h-full md:-bottom-15">
                <ThreeScene
                  modelPath="/models/student.glb"
                  scale={4.8}
                  position={[0, -2, 0]}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-grow min-h-0">
            <h3 className="font-semibold text-lg mb-4">Daftar Dokumen</h3>
            <div className="space-y-3 flex-grow overflow-y-auto pr-2 scrollbar-hide">
              <DocumentRow
                title="Dokumen Proposal"
                document={proposal}
              />
              <DocumentRow
                title="Dokumen Hasil"
                document={hasil}
              />
              <DocumentRow
                title="Dokumen Sidang"
                document={sidang}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
