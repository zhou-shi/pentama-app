'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LecturerTask, useLecturerData } from '@/hooks/useLecturerData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, ExternalLink, Eye, Loader2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EvaluationPanel } from './EvaluationPanel';
import { ThreeScene } from './ThreeScene';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'approved': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'revision': return 'bg-purple-100 text-purple-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const tabInfo = {
  proposal: {
    className: "data-[state=active]:bg-amber-500 data-[state=active]:text-white",
    bgColor: "bg-amber-50/40",
  },
  hasil: {
    className: "data-[state=active]:bg-purple-600 data-[state=active]:text-white",
    bgColor: "bg-purple-50/40",
  },
  sidang: {
    className: "data-[state=active]:bg-green-500 data-[state=active]:text-white",
    bgColor: "bg-green-50/40",
  },
};

const ITEMS_PER_PAGE = 5;

export function LecturerDashboard() {
  const { tasks, loading, error } = useLecturerData();
  const [activeTab, setActiveTab] = useState<'proposal' | 'hasil' | 'sidang'>('proposal');
  const [selectedTask, setSelectedTask] = useState<LecturerTask | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const tabMatch = task.type === activeTab;
      const statusMatch = selectedStatus === 'all' || task.stage === selectedStatus;
      const searchMatch = !searchTerm ||
        task.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.studentNim?.toLowerCase().includes(searchTerm.toLowerCase());
      return tabMatch && statusMatch && searchMatch;
    });
  }, [tasks, activeTab, searchTerm, selectedStatus]);

  const displayedTasks = useMemo(() => {
    return filteredTasks.slice(0, visibleCount);
  }, [filteredTasks, visibleCount]);

  const statusOptions = useMemo(() => {
    const statuses = new Set(tasks.filter(t => t.type === activeTab).map(task => task.stage));
    return ['all', ...Array.from(statuses)];
  }, [tasks, activeTab]);

  const upcomingSchedules = useMemo(() => {
    return tasks
      .filter(task => {
        try {
          return task.schedule?.date && new Date(task.schedule.date.split(', ')[1]) >= new Date();
        } catch { return false; }
      })
      .sort((a, b) => new Date(a.schedule!.date.split(', ')[1]).getTime() - new Date(b.schedule!.date.split(', ')[1]).getTime())
      .slice(0, 3);
  }, [tasks]);

  const currentTabInfo = useMemo(() => tabInfo[activeTab], [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as any);
    setSelectedTask(null);
    setSearchTerm('');
    setSelectedStatus('all');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">Error fetching data: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Kolom Kiri */}
      <div className="lg:col-span-2 h-full flex flex-col gap-4">
        <div className="flex-shrink-0 flex justify-between items-center">
          <div className='relative'>
            <h1 className="text-3xl font-bold">Daftar Penilaian</h1>
            <p className="text-muted-foreground">Tugas bimbingan dan pengujian Anda.</p>
          </div>
          <div className="w-32 h-32 relative">
            <ThreeScene modelPath="/models/lecturer.glb" scale={4.8} position={[0, -2, 0]} />
          </div>
        </div>
        <Card className="flex-grow flex flex-col min-h-0 shadow-lg p-0 m-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-grow min-h-0">
            <CardHeader className="flex-shrink-0 p-4 border-b">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="proposal" className={tabInfo.proposal.className}>Proposal</TabsTrigger>
                <TabsTrigger value="hasil" className={tabInfo.hasil.className}>Hasil</TabsTrigger>
                <TabsTrigger value="sidang" className={tabInfo.sidang.className}>Sidang</TabsTrigger>
              </TabsList>
            </CardHeader>

            <div className="flex flex-col sm:flex-row items-center gap-2 px-4 py-3 border-b bg-gray-50/50 flex-shrink-0">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari Nama atau NIM Mahasiswa..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status === 'all' ? 'Semua Status' : status.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CardContent className={cn("flex-grow overflow-y-auto p-0 scrollbar-hide", currentTabInfo.bgColor)}>
              <TabsContent value={activeTab} className="m-0 h-full">
                <div className="overflow-auto h-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                      <TableRow>
                        <TableHead>Mahasiswa</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Peran Anda</TableHead>
                        <TableHead>Jadwal</TableHead>
                        <TableHead>Skor Anda</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedTasks.length > 0 ? displayedTasks.map(task => {
                        const score = task.scores?.[task.lecturerRoleKey];
                        const hasEvaluated = score !== null && score !== undefined;
                        const canEvaluate = task.stage === 'in-progress' && !hasEvaluated;

                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="font-medium">{task.studentName || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{task.studentNim || 'N/A'}</div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-xs text-muted-foreground">{task.studentResearchField}</div>
                            </TableCell>
                            <TableCell><span className="font-semibold">{task.lecturerRole}</span></TableCell>
                            <TableCell className="text-xs">
                              <div>{task.schedule?.date ? format(new Date(task.schedule.date.split(', ')[1]), 'd MMM yyyy', { locale: id }) : 'N/A'}</div>
                              <div>{task.schedule?.time} @ {task.schedule?.room}</div>
                            </TableCell>
                            <TableCell className="font-bold text-center text-lg">{score ?? '-'}</TableCell>
                            <TableCell>
                              <span className={cn("px-2 py-1 text-xs font-semibold rounded-full capitalize", getStatusBadge(task.stage))}>
                                {task.stage.replace('-', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <a href={task.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" /> Lihat</Button>
                                </a>
                                {canEvaluate && (
                                  <Button variant="default" size="sm" onClick={() => setSelectedTask(task)}>
                                    <Eye className="mr-2 h-4 w-4" /> Evaluasi
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      }) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            Tidak ada data yang cocok dengan filter Anda.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </CardContent>

            {filteredTasks.length > ITEMS_PER_PAGE && (
              <CardFooter className="flex justify-center items-center gap-4 py-4 flex-shrink-0 border-t">
                <Button variant="outline" size="sm" disabled={visibleCount <= ITEMS_PER_PAGE} onClick={() => setVisibleCount(p => Math.max(ITEMS_PER_PAGE, p - ITEMS_PER_PAGE))}>
                  Kurangi Lagi
                </Button>
                <span className="text-sm text-muted-foreground">
                  Menampilkan {displayedTasks.length} dari {filteredTasks.length}
                </span>
                <Button variant="outline" size="sm" disabled={visibleCount >= filteredTasks.length} onClick={() => setVisibleCount(p => p + ITEMS_PER_PAGE)}>
                  Tampilkan Lagi
                </Button>
              </CardFooter>
            )}
          </Tabs>
        </Card>
      </div>

      {/* Kolom Kanan */}
      <div className="lg:col-span-1 h-full flex flex-col gap-6">
        <Card className="flex-shrink-0 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-purple-900">Jadwal Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length > 0 ? upcomingSchedules.map(task => (
              <div key={task.id} className="flex items-center gap-4 py-2 border-b last:border-b-0 border-purple-200/50">
                <div className="p-2 bg-purple-100 rounded-md">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-purple-900">{task.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)} - {format(new Date(task.schedule!.date.split(', ')[1]), 'EEEE, d MMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal mendatang.</p>
            )}
          </CardContent>
        </Card>
        <EvaluationPanel selectedTask={selectedTask} onEvaluationSubmit={() => setSelectedTask(null)} />
      </div>
    </div>
  );
}








// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { LecturerTask, useLecturerData } from '@/hooks/useLecturerData';
// import { cn } from '@/lib/utils';
// import { format } from 'date-fns';
// import { id } from 'date-fns/locale';
// import { Calendar, ExternalLink, Eye, Loader2 } from 'lucide-react';
// import { useMemo, useState } from 'react';
// import { EvaluationPanel } from './EvaluationPanel';
// import { ThreeScene } from './ThreeScene';
// import { Button } from './ui/button';

// const getStatusBadge = (status: string) => {
//   switch (status) {
//     case 'completed': return 'bg-green-100 text-green-800';
//     case 'approved': return 'bg-blue-100 text-blue-800';
//     case 'in-progress': return 'bg-yellow-100 text-yellow-800';
//     case 'revision': return 'bg-purple-100 text-purple-800';
//     case 'rejected': return 'bg-red-100 text-red-800';
//     default: return 'bg-gray-100 text-gray-800';
//   }
// };

// const tabInfo = {
//   proposal: {
//     className: "data-[state=active]:bg-amber-500 data-[state=active]:text-white",
//     bgColor: "bg-amber-50/40",
//   },
//   hasil: {
//     className: "data-[state=active]:bg-purple-600 data-[state=active]:text-white",
//     bgColor: "bg-purple-50/40",
//   },
//   sidang: {
//     className: "data-[state=active]:bg-green-500 data-[state=active]:text-white",
//     bgColor: "bg-green-50/40",
//   },
// };

// export function LecturerDashboard() {
//   const { tasks, loading, error } = useLecturerData();
//   const [activeTab, setActiveTab] = useState<'proposal' | 'hasil' | 'sidang'>('proposal');
//   const [selectedTask, setSelectedTask] = useState<LecturerTask | null>(null);

//   const filteredTasks = useMemo(() => {
//     return tasks.filter(task => task.type === activeTab);
//   }, [tasks, activeTab]);

//   const upcomingSchedules = useMemo(() => {
//     return tasks
//       .filter(task => {
//         try {
//           // Parsing tanggal yang lebih aman
//           return task.schedule?.date && new Date(task.schedule.date.split(', ')[1]) >= new Date();
//         } catch { return false; }
//       })
//       .sort((a, b) => new Date(a.schedule!.date.split(', ')[1]).getTime() - new Date(b.schedule!.date.split(', ')[1]).getTime())
//       .slice(0, 3);
//   }, [tasks]);

//   const currentTabInfo = useMemo(() => tabInfo[activeTab], [activeTab]);

//   if (loading) {
//     return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
//   }

//   if (error) {
//     return <div className="text-red-500 text-center mt-10">Error fetching data: {error.message}</div>;
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
//       {/* Kolom Kiri */}
//       <div className="lg:col-span-2 h-full flex flex-col gap-4">
//         <div className="flex-shrink-0 flex justify-between items-center">
//           <div className='relative'>
//             <h1 className="text-3xl font-bold">Daftar Penilaian</h1>
//             <p className="text-muted-foreground">Tugas bimbingan dan pengujian Anda.</p>
//           </div>
//           <div className="w-32 h-32 relative">
//             <ThreeScene modelPath="/models/lecturer.glb" scale={4.8} position={[0, -2, 0]} />
//           </div>
//         </div>
//         <Card className="flex-grow flex flex-col min-h-0 shadow-lg">
//           <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as any); setSelectedTask(null); }} className="flex flex-col flex-grow min-h-0">
//             <CardHeader className="flex-shrink-0 p-4 border-b">
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="proposal" className={tabInfo.proposal.className}>Proposal</TabsTrigger>
//                 <TabsTrigger value="hasil" className={tabInfo.hasil.className}>Hasil</TabsTrigger>
//                 <TabsTrigger value="sidang" className={tabInfo.sidang.className}>Sidang</TabsTrigger>
//               </TabsList>
//             </CardHeader>
//             <CardContent className={cn("flex-grow overflow-y-auto p-0 scrollbar-hide", currentTabInfo.bgColor)}>
//               <TabsContent value={activeTab} className="m-0 h-full">
//                 <div className="overflow-auto h-full">
//                   <Table>
//                     <TableHeader className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
//                       <TableRow>
//                         <TableHead>Mahasiswa</TableHead>
//                         <TableHead>Judul</TableHead>
//                         <TableHead>Peran Anda</TableHead>
//                         <TableHead>Jadwal</TableHead>
//                         <TableHead>Skor Anda</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Aksi</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {filteredTasks.length > 0 ? filteredTasks.map(task => {
//                         const score = task.scores?.[task.lecturerRoleKey];
//                         const hasEvaluated = score !== null && score !== undefined;
//                         const canEvaluate = task.stage === 'in-progress' && !hasEvaluated;

//                         return (
//                           <TableRow key={task.id}>
//                             <TableCell>
//                               <div className="font-medium">{task.studentName || 'N/A'}</div>
//                               <div className="text-xs text-muted-foreground">{task.studentNim || 'N/A'}</div>
//                             </TableCell>
//                             <TableCell className="max-w-xs truncate">
//                               <div className="font-medium">{task.title}</div>
//                               <div className="text-xs text-muted-foreground">{task.studentResearchField}</div>
//                             </TableCell>
//                             <TableCell><span className="font-semibold">{task.lecturerRole}</span></TableCell>
//                             <TableCell className="text-xs">
//                               <div>{task.schedule?.date ? format(new Date(task.schedule.date.split(', ')[1]), 'd MMM yyyy', { locale: id }) : 'N/A'}</div>
//                               <div>{task.schedule?.time} @ {task.schedule?.room}</div>
//                             </TableCell>
//                             <TableCell className="font-bold text-center text-lg">{score ?? '-'}</TableCell>
//                             <TableCell>
//                               <span className={cn("px-2 py-1 text-xs font-semibold rounded-full capitalize", getStatusBadge(task.stage))}>
//                                 {task.stage.replace('-', ' ')}
//                               </span>
//                             </TableCell>
//                             <TableCell className="text-right">
//                               <div className="flex gap-2 justify-end">
//                                 <a href={task.fileUrl} target="_blank" rel="noopener noreferrer">
//                                   <Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" /> Lihat</Button>
//                                 </a>
//                                 {canEvaluate && (
//                                   <Button variant="default" size="sm" onClick={() => setSelectedTask(task)}>
//                                     <Eye className="mr-2 h-4 w-4" /> Evaluasi
//                                   </Button>
//                                 )}
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         )
//                       }) : (
//                         <TableRow>
//                           <TableCell colSpan={7} className="text-center h-24">
//                             Tidak ada tugas pada tahap ini.
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </TabsContent>
//             </CardContent>
//           </Tabs>
//         </Card>
//       </div>

//       {/* Kolom Kanan */}
//       <div className="lg:col-span-1 h-full flex flex-col gap-6">
//         <Card className="flex-shrink-0 bg-gradient-to-br from-purple-50 to-indigo-50">
//           <CardHeader>
//             <CardTitle className="text-purple-900">Jadwal Mendatang</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {upcomingSchedules.length > 0 ? upcomingSchedules.map(task => (
//               <div key={task.id} className="flex items-center gap-4 py-2 border-b last:border-b-0 border-purple-200/50">
//                 <div className="p-2 bg-purple-100 rounded-md">
//                   <Calendar className="h-5 w-5 text-purple-600" />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-sm text-purple-900">{task.studentName}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {task.type.charAt(0).toUpperCase() + task.type.slice(1)} - {format(new Date(task.schedule!.date.split(', ')[1]), 'EEEE, d MMM yyyy', { locale: id })}
//                   </p>
//                 </div>
//               </div>
//             )) : (
//               <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal mendatang.</p>
//             )}
//           </CardContent>
//         </Card>
//         <EvaluationPanel selectedTask={selectedTask} onEvaluationSubmit={() => setSelectedTask(null)} />
//       </div>
//     </div>
//   );
// }