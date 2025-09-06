'use client';

import { ThreeScene } from '@/components/ThreeScene';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CombinedData, Ruang, User } from '@/types/user';
import {
  BookOpen,
  CheckCircle,
  Clock,
  File,
  PauseIcon,
  ThumbsDown,
  ThumbsUp,
  Users,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type OverviewCardProps = {
  activeTab: string;
  proposals: CombinedData[];
  results: CombinedData[];
  defenses: CombinedData[];
  rooms: Ruang[];
  students: User[];
};

const StatItem = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) => (
  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-200/50 last:border-b-0">
    <div className="flex items-center gap-2 text-gray-600">
      {icon}
      <span>{label}</span>
    </div>
    <strong className={`font-bold text-base ${color || 'text-gray-800'}`}>
      {value}
    </strong>
  </div>
);

// Komponen untuk Leaderboard Nilai
const TopStudentItem = ({
  rank,
  student,
  score,
  stage,
}: {
  rank: number;
  student?: User;
  score: number;
  stage: string;
}) => {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-200/50 last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{medals[rank]}</span>
        <div>
          <p className="font-bold text-gray-800">{student?.name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {stage} / {student?.student?.researchField}
          </p>
        </div>
      </div>
      <span className="text-xl font-bold text-blue-600">
        {score.toFixed(2)}
      </span>
    </div>
  );
};

export function OverviewCard({
  activeTab,
  proposals,
  results,
  defenses,
  rooms,
  students,
}: OverviewCardProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  // State untuk filter di leaderboard nilai
  const [topScoreFilter, setTopScoreFilter] = useState('semua');
  const [topFieldFilter, setTopFieldFilter] = useState('semua');
  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.uid, s])),
    [students]
  );

  // Logika kompleks untuk menentukan 3 nilai teratas
  const topStudents = useMemo(() => {
    let allScores: {
      uid: string;
      score: number;
      stage: string;
      field: string;
    }[] = [];

    const dataSets = {
      proposal: proposals,
      hasil: results,
      sidang: defenses,
    };

    if (topScoreFilter === 'semua' || topScoreFilter === 'proposal') {
      dataSets.proposal.forEach(
        (p) =>
          p.averageScore &&
          allScores.push({
            uid: p.uid,
            score: p.averageScore,
            stage: 'proposal',
            field: p.researchField,
          })
      );
    }
    if (topScoreFilter === 'semua' || topScoreFilter === 'hasil') {
      dataSets.hasil.forEach(
        (h) =>
          h.averageScore &&
          allScores.push({
            uid: h.uid,
            score: h.averageScore,
            stage: 'hasil',
            field: h.researchField,
          })
      );
    }
    if (topScoreFilter === 'semua' || topScoreFilter === 'sidang') {
      // Prioritaskan finalScore jika ada
      dataSets.sidang.forEach((s) => {
        if (s.finalScore)
          allScores.push({
            uid: s.uid,
            score: s.finalScore,
            stage: 'nilai akhir',
            field: s.researchField,
          });
        else if (s.averageScore)
          allScores.push({
            uid: s.uid,
            score: s.averageScore,
            stage: 'sidang',
            field: s.researchField,
          });
      });
    }

    // Filter berdasarkan bidang riset
    if (topFieldFilter !== 'semua') {
      allScores = allScores.filter((s) => s.field === topFieldFilter);
    }

    // Urutkan dari tertinggi dan ambil 3 teratas
    return allScores.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [topScoreFilter, topFieldFilter, proposals, results, defenses]);

  const enrollmentYears = useMemo(() => {
    const years = new Set(
      students.map((s) => s.student?.enrollmentYear).filter(Boolean)
    );
    return ['all', ...Array.from(years).sort((a, b) => b!.localeCompare(a!))];
  }, [students]);

  const filteredData = useMemo(() => {
    if (selectedYear === 'all') return { proposals, results, defenses };
    const uids = new Set(
      students
        .filter((s) => s.student?.enrollmentYear === selectedYear)
        .map((s) => s.uid)
    );
    return {
      proposals: proposals.filter((p) => uids.has(p.uid)),
      results: results.filter((r) => uids.has(r.uid)),
      defenses: defenses.filter((d) => uids.has(d.uid)),
    };
  }, [selectedYear, proposals, results, defenses, students]);

  const stats = useMemo(() => {
    const dataMap = {
      proposal: filteredData.proposals,
      hasil: filteredData.results,
      sidang: filteredData.defenses,
    };
    const data = dataMap[activeTab as keyof typeof dataMap] || [];
    if (activeTab === 'ruang')
      return {
        total: rooms.length,
        available: rooms.filter((r) => r.isAvailable).length,
        inUse: rooms.filter((r) => !r.isAvailable).length,
      };

    return {
      total: data.length,
      completed: data.filter((d) => d.stage === 'completed').length,
      submitted: data.filter((d) => d.stage === 'submitted').length,
      underReview: data.filter((d) => d.stage === 'under-review').length,
      approved: data.filter((d) => d.stage === 'approved').length,
      rejected: data.filter((d) => d.stage === 'rejected').length,
      revision: data.filter((d) => d.stage === 'revision').length,
      pending: data.filter((d) => d.stage === 'pending').length,
    };
  }, [activeTab, filteredData, rooms]);

  const renderContent = () => {
    // Tampilan khusus saat tab 'nilai' aktif
    if (activeTab === 'nilai') {
      return (
        <div className="h-full flex flex-col">
          <CardTitle className="text-gray-800 mb-2">
            Peringkat Teratas
          </CardTitle>
          <div className="flex gap-2 mb-4">
            <Select
              value={topScoreFilter}
              onValueChange={setTopScoreFilter}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Tahap</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="hasil">Hasil</SelectItem>
                <SelectItem value="sidang">Sidang & Akhir</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={topFieldFilter}
              onValueChange={setTopFieldFilter}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Bidang</SelectItem>
                <SelectItem value="AES">AES</SelectItem>
                <SelectItem value="NIC">NIC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow space-y-1">
            {topStudents.length > 0 ? (
              topStudents.map((item, index) => (
                <TopStudentItem
                  key={`${item.uid}-${index}`}
                  rank={index}
                  student={studentMap.get(item.uid)}
                  score={item.score}
                  stage={item.stage}
                />
              ))
            ) : (
              <p className="text-sm text-center text-gray-500 pt-8">
                Tidak ada data nilai untuk ditampilkan.
              </p>
            )}
          </div>
          <div className="h-48 -mb-4 -mx-4">
            <ThreeScene
              modelPath="/models/graduate.glb"
              scale={4}
              position={[0, -1.5, 0]}
            />
          </div>
        </div>
      );
    }

    // Logika renderContent untuk tab lain
    switch (activeTab) {
      case 'proposal':
        return (
          <>
            <StatItem
              icon={<Users size={14} />}
              label="Total"
              value={stats.total!}
            />
            <StatItem
              icon={<CheckCircle size={14} />}
              label="Selesai"
              value={stats.completed!}
              color="text-green-600"
            />
            <StatItem
              icon={<File size={14} />}
              label="Baru Masuk"
              value={stats.submitted!}
            />
            <StatItem
              icon={<Clock size={14} />}
              label="Ditinjau"
              value={stats.underReview!}
              color="text-yellow-600"
            />
            <StatItem
              icon={<ThumbsUp size={14} />}
              label="Disetujui"
              value={stats.approved!}
              color="text-blue-600"
            />
            <StatItem
              icon={<ThumbsDown size={14} />}
              label="Ditolak"
              value={stats.rejected!}
              color="text-red-600"
            />
            <StatItem
              icon={<BookOpen size={14} />}
              label="Revisi"
              value={stats.revision!}
              color="text-purple-600"
            />
            <StatItem
              icon={<PauseIcon size={14} />}
              label="Pending"
              value={stats.pending!}
              color="text-orange-500"
            />
          </>
        );
      case 'hasil':
      case 'sidang':
        return (
          <>
            <StatItem
              icon={<Users size={14} />}
              label="Total"
              value={stats.total!}
            />
            <StatItem
              icon={<CheckCircle size={14} />}
              label="Selesai"
              value={stats.completed!}
              color="text-green-600"
            />
            <StatItem
              icon={<File size={14} />}
              label="Baru Masuk"
              value={stats.submitted!}
            />
            <StatItem
              icon={<Clock size={14} />}
              label="Ditinjau"
              value={stats.underReview!}
              color="text-yellow-600"
            />
            <StatItem
              icon={<ThumbsUp size={14} />}
              label="Disetujui"
              value={stats.approved!}
              color="text-blue-600"
            />
            <StatItem
              icon={<ThumbsDown size={14} />}
              label="Ditolak"
              value={stats.rejected!}
              color="text-red-600"
            />
            <StatItem
              icon={<PauseIcon size={14} />}
              label="Pending"
              value={stats.pending!}
              color="text-orange-500"
            />
          </>
        );
      case 'ruang':
        return (
          <div className="flex flex-col h-full">
            <StatItem
              icon={<Users size={14} />}
              label="Jml Ruangan"
              value={stats.total!}
            />
            <StatItem
              icon={<CheckCircle size={14} />}
              label="Tersedia"
              value={stats.available!}
              color="text-green-600"
            />
            <StatItem
              icon={<XCircle size={14} />}
              label="Digunakan"
              value={stats.inUse!}
              color="text-red-600"
            />
            <div className="flex-grow min-h-0">
              <ThreeScene
                modelPath="/models/room.glb"
                scale={5}
                position={[0, -1.5, 0]}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="flex-grow- flex flex-col shadow-2xs lg:max-h-[65vh]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-800">Overview</CardTitle>
          {['proposal', 'hasil', 'sidang'].includes(activeTab) && (
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger className="w-[150px] text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enrollmentYears.map((year) => (
                  <SelectItem
                    key={year}
                    value={year!}
                  >
                    {year === 'all' ? 'Semua Angkatan' : `Angkatan ${year}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {activeTab !== 'nilai' && (
          <CardDescription>
            Statistik dinamis berdasarkan tab aktif
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {renderContent()}
      </CardContent>
    </Card>
  );
}