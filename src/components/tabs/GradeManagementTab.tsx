'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Hasil, Proposal, Sidang, User } from '@/types/user';
import { Download, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

type GradeManagementTabProps = {
  students: User[];
  proposals: Proposal[];
  results: Hasil[];
  defenses: Sidang[];
};

export function GradeManagementTab({ students, proposals, results, defenses }: GradeManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedField, setSelectedField] = useState('all');

  // Membuat Peta (Map) untuk pencarian data yang lebih cepat
  const proposalMap = useMemo(() => new Map(proposals.map(p => [p.uid, p])), [proposals]);
  const resultMap = useMemo(() => new Map(results.map(r => [r.uid, r])), [results]);
  const defenseMap = useMemo(() => new Map(defenses.map(d => [d.uid, d])), [defenses]);

  // Mendapatkan daftar angkatan dan bidang riset secara dinamis
  const enrollmentYears = useMemo(() => ['all', ...Array.from(new Set(students.map(s => s.student?.enrollmentYear).filter(Boolean)))], [students]);
  const researchFields = useMemo(() => ['all', ...Array.from(new Set(students.map(s => s.student?.researchField).filter(Boolean)))], [students]);

  // Logika untuk memfilter mahasiswa berdasarkan input
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const yearMatch = selectedYear === 'all' || student.student?.enrollmentYear === selectedYear;
      const fieldMatch = selectedField === 'all' || student.student?.researchField === selectedField;
      const searchMatch = !searchTerm ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student?.nim.toLowerCase().includes(searchTerm.toLowerCase());
      return yearMatch && fieldMatch && searchMatch;
    });
  }, [students, searchTerm, selectedYear, selectedField]);

  // Fungsi untuk menangani ekspor data ke Excel
  const handleExport = (type: 'all' | 'filtered' | 'year' | 'field') => {
    let dataToExport = students;

    if (type === 'filtered') dataToExport = filteredStudents;
    if (type === 'year' && selectedYear !== 'all') dataToExport = students.filter(s => s.student?.enrollmentYear === selectedYear);
    if (type === 'field' && selectedField !== 'all') dataToExport = students.filter(s => s.student?.researchField === selectedField);

    const formattedData = dataToExport.map(student => {
      const proposal = proposalMap.get(student.uid);
      const result = resultMap.get(student.uid);
      const defense = defenseMap.get(student.uid);
      return {
        'NIM': student.student?.nim,
        'Nama Mahasiswa': student.name,
        'Angkatan': student.student?.enrollmentYear,
        'Bidang Riset': student.student?.researchField,
        'Nilai Proposal': proposal?.averageScore ?? 'N/A',
        'Grade Proposal': proposal?.grade ?? 'N/A',
        'Nilai Hasil': result?.averageScore ?? 'N/A',
        'Grade Hasil': result?.grade ?? 'N/A',
        'Nilai Sidang': defense?.averageScore ?? 'N/A',
        'Grade Sidang': defense?.grade ?? 'N/A',
        'Nilai Akhir': defense?.finalScore ?? 'N/A',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi Nilai');
    XLSX.writeFile(workbook, `rekapitulasi_nilai_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4">
      {/* Area Filter dan Aksi */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari NIM atau Nama Mahasiswa..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>{enrollmentYears.map(y => <SelectItem key={y} value={y}>{y === 'all' ? 'Semua Angkatan' : y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedField} onValueChange={setSelectedField}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>{researchFields.map(f => <SelectItem key={f} value={f}>{f === 'all' ? 'Semua Bidang' : f}</SelectItem>)}</SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Ekspor</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('all')}>Ekspor Semua Data</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('filtered')}>Ekspor Hasil Filter</DropdownMenuItem>
            {selectedYear !== 'all' && <DropdownMenuItem onClick={() => handleExport('year')}>Ekspor Angkatan {selectedYear}</DropdownMenuItem>}
            {selectedField !== 'all' && <DropdownMenuItem onClick={() => handleExport('field')}>Ekspor Bidang {selectedField}</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabel Rekapitulasi */}
      <Card className="flex-grow overflow-y-auto border shadow-none p-0! h-full">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur-sm">
            <TableRow>
              <TableHead>Mahasiswa</TableHead>
              <TableHead className="text-center">Proposal (Nilai/Grade)</TableHead>
              <TableHead className="text-center">Hasil (Nilai/Grade)</TableHead>
              <TableHead className="text-center">Sidang (Nilai/Grade)</TableHead>
              <TableHead className="text-center font-bold">Nilai Akhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map(student => {
              const proposal = proposalMap.get(student.uid);
              const result = resultMap.get(student.uid);
              const defense = defenseMap.get(student.uid);
              return (
                <TableRow key={student.uid}>
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.student?.nim}</div>
                  </TableCell>
                  <TableCell className="text-center">{proposal ? `${proposal.averageScore} (${proposal.grade})` : '-'}</TableCell>
                  <TableCell className="text-center">{result ? `${result.averageScore} (${result.grade})` : '-'}</TableCell>
                  <TableCell className="text-center">{defense ? `${defense.averageScore} (${defense.grade})` : '-'}</TableCell>
                  <TableCell className="text-center font-bold text-lg text-blue-600">{defense?.finalScore ?? '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}