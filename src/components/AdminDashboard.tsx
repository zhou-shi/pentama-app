'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminData } from '@/hooks/useAdminData';
import { cn } from '@/lib/utils';
import { FileText, Files, Home, LineChart, Loader2, Search, University } from 'lucide-react';
import { useMemo, useState } from 'react';
import { OverviewCard } from './OverviewCard';
import { GradeManagementTab } from './tabs/GradeManagementTab';
import { ManagementTable } from './tabs/ManagementTable';
import { RoomManagementTab } from './tabs/RoomManagementTab';

const tabInfo = {
  proposal: { icon: <FileText className="mr-2 h-4 w-4" />, title: "Manajemen Seminar Proposal", description: "Persetujuan dan penjadwalan proposal.", className: "data-[state=active]:bg-amber-500 data-[state=active]:text-white", iconColor: "text-amber-600", bgColor: "bg-amber-50/40", },
  hasil: { icon: <Files className="mr-2 h-4 w-4" />, title: "Manajemen Seminar Hasil", description: "Persetujuan dan penjadwalan seminar hasil.", className: "data-[state=active]:bg-purple-600 data-[state=active]:text-white", iconColor: "text-purple-700", bgColor: "bg-purple-50/40", },
  sidang: { icon: <University className="mr-2 h-4 w-4" />, title: "Manajemen Sidang Skripsi", description: "Persetujuan dan penjadwalan sidang skripsi.", className: "data-[state=active]:bg-green-500 data-[state=active]:text-white", iconColor: "text-green-600", bgColor: "bg-green-50/40", },
  nilai: { icon: <LineChart className="mr-2 h-4 w-4" />, title: "Manajemen Nilai", description: "Kelola dan rekapitulasi nilai mahasiswa.", className: "data-[state=active]:bg-indigo-500 data-[state=active]:text-white", iconColor: "text-indigo-600", bgColor: "bg-indigo-50/40", },
  ruang: { icon: <Home className="mr-2 h-4 w-4" />, title: "Manajemen Ruangan", description: "Kelola ketersediaan ruang akademik.", className: "data-[state=active]:bg-orange-500 data-[state=active]:text-white", iconColor: "text-orange-600", bgColor: "bg-orange-50/40", },
};

const stageOptions = {
  common: ['submitted', 'under-review', 'approved', 'in-progress', 'pending', 'rejected', 'completed'],
  proposal: ['submitted', 'under-review', 'approved', 'in-progress', 'pending', 'rejected', 'revision', 'completed'],
};

export function AdminDashboard() {
  const { proposals, results, defenses, rooms, lecturers, students, loading, error } = useAdminData();
  const [activeTab, setActiveTab] = useState('proposal');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');

  const currentTabInfo = useMemo(() => tabInfo[activeTab as keyof typeof tabInfo], [activeTab]);
  const enrollmentYears = useMemo(() => {
    const years = new Set(students.map(s => s.student?.enrollmentYear).filter(Boolean));
    return ['all', ...Array.from(years).sort((a, b) => b!.localeCompare(a!))];
  }, [students]);

  const filteredData = useMemo(() => {
    const dataMap = { proposal: proposals, hasil: results, sidang: defenses };
    let data = dataMap[activeTab as keyof typeof dataMap] || [];

    if (selectedYear !== 'all') {
      const studentUidsInYear = new Set(students.filter(s => s.student?.enrollmentYear === selectedYear).map(s => s.uid));
      data = data.filter(item => studentUidsInYear.has(item.uid));
    }
    if (selectedStage !== 'all') {
      data = data.filter(item => item.stage === selectedStage);
    }
    if (searchTerm.trim() !== '') {
      const lowercasedTerm = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.studentName?.toLowerCase().includes(lowercasedTerm) ||
        item.studentNim?.toLowerCase().includes(lowercasedTerm)
      );
    }
    return data;
  }, [activeTab, proposals, results, defenses, students, searchTerm, selectedYear, selectedStage]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  if (error) return <div className="text-red-500 text-center mt-10">Error fetching data: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-3 h-full overflow-hidden">
        <Card className="h-full flex flex-col shadow-2xs">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow min-h-0">
            <CardHeader className="p-0 flex-shrink-0">
              <div className="px-6 pt-6"><CardTitle className={cn("flex items-center", currentTabInfo.iconColor)}>{currentTabInfo.icon} {currentTabInfo.title}</CardTitle><CardDescription className="mt-1">{currentTabInfo.description}</CardDescription></div>
              <div className="mt-4 px-6"><TabsList className="grid w-full grid-cols-5">{Object.entries(tabInfo).map(([key, info]) => <TabsTrigger key={key} value={key} className={info.className}>{key.charAt(0).toUpperCase() + key.slice(1)}</TabsTrigger>)}</TabsList></div>
            </CardHeader>

            {['proposal', 'hasil', 'sidang'].includes(activeTab) && (
              <div className={cn("flex items-center gap-2 px-6 py-4 flex-shrink-0")}>
                <div className="relative flex-grow"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari NIM atau Nama..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                <Select value={selectedYear} onValueChange={setSelectedYear}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent>{enrollmentYears.map(y => <SelectItem key={y} value={y}>{y === 'all' ? 'Semua Angkatan' : `Angkatan ${y}`}</SelectItem>)}</SelectContent></Select>
                <Select value={selectedStage} onValueChange={setSelectedStage}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {(activeTab === 'proposal' ? stageOptions.proposal : stageOptions.common).map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/[-_]/g, ' ')}</SelectItem>)}
                </SelectContent></Select>
              </div>
            )}

            <CardContent className={cn("p-0 flex-grow overflow-y-auto scrollbar-hidden")}>
              <TabsContent value="proposal" className="h-full m-0">
                <ManagementTable activeData={filteredData} collectionName="proposal" allSubmissions={{ proposals, results, defenses }} lecturers={lecturers} rooms={rooms} />
              </TabsContent>
              <TabsContent value="hasil" className="h-full m-0">
                <ManagementTable activeData={filteredData} collectionName="hasil" allSubmissions={{ proposals, results, defenses }} lecturers={lecturers} rooms={rooms} />
              </TabsContent>
              <TabsContent value="sidang" className="h-full m-0">
                <ManagementTable activeData={filteredData} collectionName="sidang" allSubmissions={{ proposals, results, defenses }} lecturers={lecturers} rooms={rooms} />
              </TabsContent>
              <TabsContent value="nilai" className="h-full m-0"><GradeManagementTab students={students} proposals={proposals} results={results} defenses={defenses} /></TabsContent>
              <TabsContent value="ruang" className="h-full m-0"><RoomManagementTab rooms={rooms} /></TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      <div className="lg:col-span-1 h-full overflow-hidden flex flex-col gap-2.5">
        <OverviewCard proposals={proposals} results={results} defenses={defenses} rooms={rooms} students={students} activeTab={activeTab} />
        <Card className="flex-shrink-0 shadow-2xs border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50"><CardHeader><CardTitle className="text-indigo-900">Logs</CardTitle></CardHeader><CardContent className="text-sm text-indigo-700"><p>Activity logs will be implemented here.</p></CardContent></Card>
      </div>
    </div>
  );
}