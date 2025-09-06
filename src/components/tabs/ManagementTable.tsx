'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { CombinedData } from '@/hooks/useAdminData';
import type { Ruang, User } from '@/types/user';
import { ExternalLink, Inbox, Loader2, MoreVertical } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ManagementTableProps = {
  activeData: CombinedData[];
  collectionName: 'proposal' | 'hasil' | 'sidang';
  allSubmissions: {
    proposals: CombinedData[];
    results: CombinedData[];
    defenses: CombinedData[];
  };
  lecturers: User[];
  rooms: Ruang[];
};

type ModalType =
  | 'reject'
  | 'approve'
  | 'editExaminers'
  | 'editSchedule'
  | 'pending';

const ITEMS_PER_PAGE = 5;
const stageVariantMap: {
  [key: string]: 'default' | 'secondary' | 'destructive' | 'outline';
} = {
  submitted: 'secondary',
  'under-review': 'outline',
  approved: 'default',
  rejected: 'destructive',
  completed: 'default',
  revision: 'outline',
  pending: 'secondary',
  'in-progress': 'outline',
};

export function ManagementTable({
  activeData,
  collectionName,
  allSubmissions,
  lecturers,
  rooms,
}: ManagementTableProps) {
  const [modalState, setModalState] = useState<{
    type: ModalType | null;
    data: CombinedData | null;
  }>({ type: null, data: null });
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingReason, setPendingReason] = useState('');
  const [pendingDuration, setPendingDuration] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
  });
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeData]);

  const displayedData = useMemo(
    () => activeData.slice(0, visibleCount),
    [activeData, visibleCount]
  );

  const handleAction = async (action: string, payload: any) => {
    setIsLoadingAction(true);
    try {
      const response = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Terjadi kesalahan');
      toast.success(result.message || 'Aksi berhasil.');
      closeModal();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const openModal = (type: ModalType, item: CombinedData) => {
    setModalState({ type, data: item });
    const scheduleDate = item.schedule?.date
      ? new Date(item.schedule.date.split(', ')[1]).toISOString().split('T')[0]
      : '';
    setEditFormData({
      examiner1Uid: item.examiners?.examiner1Uid || '',
      examiner2Uid: item.examiners?.examiner2Uid || '',
      date: scheduleDate,
      time: item.schedule?.time?.substring(0, 5) || '09:00',
      roomUid: item.schedule?.roomUid || '',
    });
  };

  const closeModal = () => {
    setModalState({ type: null, data: null });
    setRejectionReason('');
    setPendingReason('');
    setPendingDuration({ days: 7, hours: 0, minutes: 0 });
  };

  const handleFormInputChange = (field: string, value: string) =>
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));

  const handleDurationChange = (
    unit: 'days' | 'hours' | 'minutes',
    value: string
  ) => {
    const numericValue = parseInt(value, 10) || 0;
    setPendingDuration((prev) => ({ ...prev, [unit]: numericValue }));
  };

  const handleFormSubmit = () => {
    const { type, data: item } = modalState;
    if (!type || !item) return;
    let payload: any = { collectionName, docId: item.id };
    let action: string = '';

    switch (type) {
      case 'editExaminers': {
        const p1_uid = editFormData.examiner1Uid;
        const p2_uid = editFormData.examiner2Uid;
        const p1 = lecturers.find((l) => l.uid === p1_uid);
        const p2 = lecturers.find((l) => l.uid === p2_uid);

        if (!p1 || !p2) return toast.error(`Harap pilih kedua penguji.`);
        if (p1_uid === p2_uid)
          return toast.error(
            'Penguji 1 dan Penguji 2 tidak boleh orang yang sama.'
          );

        action = 'UPDATE_PERSONNEL';
        payload.personnelType = 'examiners';
        payload.personnelData = {
          examiner1: `${p1.name}, ${p1.lecturer?.academicTitle}`,
          examiner2: `${p2.name}, ${p2.lecturer?.academicTitle}`,
          examiner1Uid: p1.uid,
          examiner2Uid: p2.uid,
        };
        break;
      }
      case 'editSchedule': {
        const room = rooms.find((r) => r.id === editFormData.roomUid);
        if (!editFormData.date || !editFormData.time || !room)
          return toast.error('Harap lengkapi tanggal, waktu, dan ruangan.');
        action = 'UPDATE_SCHEDULE';
        payload.scheduleData = {
          date: new Date(editFormData.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          time: editFormData.time + ' WIB',
          room: room.name,
          roomUid: room.id,
        };
        break;
      }
      default:
        return;
    }
    handleAction(action, payload);
  };

  const renderModalContent = () => {
    const { type, data: item } = modalState;
    if (!type || !item) return null;

    switch (type) {
      case 'reject':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Tolak Pengajuan</DialogTitle>
              <DialogDescription>
                Anda akan menolak pengajuan dari{' '}
                <strong>{item.studentName}</strong>. Harap berikan alasan yang
                jelas.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label
                htmlFor="rejectionReason"
                className="sr-only"
              >
                Alasan Penolakan
              </Label>
              <Input
                id="rejectionReason"
                placeholder="Alasan (wajib diisi)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeModal}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectionReason || isLoadingAction}
                onClick={() =>
                  handleAction('UPDATE_STAGE', {
                    collectionName,
                    docId: item.id,
                    stage: 'rejected',
                    reason: rejectionReason,
                  })
                }
              >
                {isLoadingAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Konfirmasi Tolak'
                )}
              </Button>
            </DialogFooter>
          </>
        );
      case 'approve':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Setujui Pengajuan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menyetujui pengajuan dari{' '}
                <strong>{item.studentName}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={closeModal}
              >
                Batal
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoadingAction}
                onClick={() =>
                  handleAction('APPROVE_SUBMISSION', {
                    collectionName,
                    docId: item.id,
                    examiners: item.examiners,
                  })
                }
              >
                {isLoadingAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Ya, Setujui'
                )}
              </Button>
            </DialogFooter>
          </>
        );
      case 'pending': {
        const totalMinutes =
          pendingDuration.days * 24 * 60 +
          pendingDuration.hours * 60 +
          pendingDuration.minutes;
        const isDurationInvalid = totalMinutes <= 0;

        return (
          <>
            <DialogHeader>
              <DialogTitle>Tunda Jadwal</DialogTitle>
              <DialogDescription>
                Anda akan menunda jadwal untuk{' '}
                <strong>{item.studentName}</strong>. Jadwal baru akan dihitung
                otomatis berdasarkan durasi yang dimasukkan.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="pendingReason">Alasan Penundaan (Wajib)</Label>
                <Textarea
                  id="pendingReason"
                  placeholder="Contoh: Dosen penguji berhalangan hadir..."
                  value={pendingReason}
                  onChange={(e) => setPendingReason(e.target.value)}
                />
              </div>
              <div>
                <Label>Durasi Penundaan</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1">
                    <Label
                      htmlFor="pendingDays"
                      className="text-xs font-normal"
                    >
                      Hari
                    </Label>
                    <Input
                      id="pendingDays"
                      type="number"
                      min="0"
                      value={pendingDuration.days}
                      onChange={(e) =>
                        handleDurationChange('days', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="pendingHours"
                      className="text-xs font-normal"
                    >
                      Jam
                    </Label>
                    <Input
                      id="pendingHours"
                      type="number"
                      min="0"
                      max="23"
                      value={pendingDuration.hours}
                      onChange={(e) =>
                        handleDurationChange('hours', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="pendingMinutes"
                      className="text-xs font-normal"
                    >
                      Menit
                    </Label>
                    <Input
                      id="pendingMinutes"
                      type="number"
                      min="0"
                      max="59"
                      value={pendingDuration.minutes}
                      onChange={(e) =>
                        handleDurationChange('minutes', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeModal}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                disabled={
                  !pendingReason || isDurationInvalid || isLoadingAction
                }
                onClick={() =>
                  handleAction('PENDING_SUBMISSION', {
                    collectionName,
                    docId: item.id,
                    reason: pendingReason,
                    durationInMinutes: totalMinutes,
                    schedule: item.schedule,
                  })
                }
              >
                {isLoadingAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Konfirmasi Tunda'
                )}
              </Button>
            </DialogFooter>
          </>
        );
      }
      case 'editExaminers': {
        const excludedUids = new Set([
          item.supervisors?.supervisor1Uid,
          item.supervisors?.supervisor2Uid,
        ]);
        const availableLecturers = lecturers.filter(
          (l) => !excludedUids.has(l.uid)
        );
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Penguji</DialogTitle>
              <DialogDescription>
                Ubah penguji untuk <strong>{item.studentName}</strong>.
              </DialogDescription>
            </DialogHeader>
            {availableLecturers.length < 2 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Semua dosen yang tersedia telah ditugaskan sebagai pembimbing.
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="examiner1Uid"
                    className="text-right"
                  >
                    Penguji 1
                  </Label>
                  <Select
                    value={editFormData.examiner1Uid}
                    onValueChange={(v) =>
                      handleFormInputChange('examiner1Uid', v)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Penguji 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLecturers.map((l) => (
                        <SelectItem
                          key={l.uid}
                          value={l.uid}
                          disabled={l.uid === editFormData.examiner2Uid}
                        >
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="examiner2Uid"
                    className="text-right"
                  >
                    Penguji 2
                  </Label>
                  <Select
                    value={editFormData.examiner2Uid}
                    onValueChange={(v) =>
                      handleFormInputChange('examiner2Uid', v)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Penguji 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLecturers.map((l) => (
                        <SelectItem
                          key={l.uid}
                          value={l.uid}
                          disabled={l.uid === editFormData.examiner1Uid}
                        >
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeModal}
              >
                Batal
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={isLoadingAction || availableLecturers.length < 2}
              >
                {isLoadingAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </DialogFooter>
          </>
        );
      }
      case 'editSchedule': {
        const allSchedules = [
          ...allSubmissions.proposals,
          ...allSubmissions.results,
          ...allSubmissions.defenses,
        ];
        const busySlots = new Set(
          allSchedules
            .filter(
              (sub) =>
                sub.id !== item.id &&
                sub.schedule?.date &&
                sub.schedule?.time &&
                sub.schedule?.roomUid
            )
            .map(
              (sub) =>
                `${sub.schedule!.date}-${sub.schedule!.time}-${
                  sub.schedule!.roomUid
                }`
            )
        );
        const availableRooms = rooms.filter((room) => {
          const scheduleKey = `${
            editFormData.date
              ? new Date(editFormData.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : ''
          }-${editFormData.time ? editFormData.time + ' WIB' : ''}-${room.id}`;
          return !busySlots.has(scheduleKey);
        });

        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Jadwal & Ruangan</DialogTitle>
              <DialogDescription>
                Ubah jadwal dan ruangan untuk{' '}
                <strong>{item.studentName}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="date"
                  className="text-right"
                >
                  Tanggal
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  value={editFormData.date}
                  onChange={(e) =>
                    handleFormInputChange('date', e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="time"
                  className="text-right"
                >
                  Waktu
                </Label>
                <Input
                  id="time"
                  type="time"
                  className="col-span-3"
                  value={editFormData.time}
                  onChange={(e) =>
                    handleFormInputChange('time', e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="room"
                  className="text-right"
                >
                  Ruangan
                </Label>
                <Select
                  value={editFormData.roomUid}
                  onValueChange={(v) => handleFormInputChange('roomUid', v)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Ruangan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((r) => (
                      <SelectItem
                        key={r.id}
                        value={r.id}
                      >
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeModal}
              >
                Batal
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={isLoadingAction}
              >
                {isLoadingAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Simpan Jadwal'
                )}
              </Button>
            </DialogFooter>
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col p-0 mx-2.5 overflow-hidden shadow-2xs">
      <CardContent className="p-0 flex-grow min-h-0">
        <div className="overflow-auto scrollbar-hide h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead>Mahasiswa</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Personil</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedData.length > 0 ? (
                displayedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.studentName}
                      <br />
                      <span className="text-xs text-gray-500 font-normal">
                        {item.studentNim}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.title}
                      <br />
                      <span className="text-xs text-gray-500">
                        {item.studentResearchField}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      S1: {item.supervisors?.supervisor1}
                      <br />
                      S2: {item.supervisors?.supervisor2}
                      <br />
                      <span className="text-gray-400">
                        E1: {item.examiners?.examiner1}
                      </span>
                      <br />
                      <span className="text-gray-400">
                        E2: {item.examiners?.examiner2}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.schedule?.date}
                      <br />
                      {item.schedule?.time} @ {item.schedule?.room}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={stageVariantMap[item.stage] || 'secondary'}
                        className="capitalize"
                      >
                        {item.stage.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.stage === 'submitted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleAction('UPDATE_STAGE', {
                                collectionName,
                                docId: item.id,
                                stage: 'under-review',
                              })
                            }
                          >
                            Tinjau
                          </Button>
                        )}
                        {item.stage === 'under-review' && (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openModal('reject', item)}
                            >
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openModal('approve', item)}
                            >
                              Setujui
                            </Button>
                          </>
                        )}
                        {item.stage === 'in-progress' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openModal('pending', item)}
                          >
                            Tunda
                          </Button>
                        )}

                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Lihat File"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>

                        {item.stage === 'approved' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {collectionName === 'proposal' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openModal('editExaminers', item)
                                  }
                                >
                                  Edit Penguji
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => openModal('editSchedule', item)}
                              >
                                Edit Jadwal & Ruang
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500">Tidak ada data.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {activeData.length > ITEMS_PER_PAGE && (
        <CardFooter className="flex justify-center items-center gap-4 py-4 flex-shrink-0 border-t">
          <Button
            variant="outline"
            size="sm"
            disabled={visibleCount <= ITEMS_PER_PAGE}
            onClick={() =>
              setVisibleCount((p) =>
                Math.max(ITEMS_PER_PAGE, p - ITEMS_PER_PAGE)
              )
            }
          >
            Kurangi Lagi
          </Button>
          <span className="text-sm text-muted-foreground">
            Menampilkan {displayedData.length} dari {activeData.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={visibleCount >= activeData.length}
            onClick={() =>
              setVisibleCount((p) =>
                Math.min(activeData.length, p + ITEMS_PER_PAGE)
              )
            }
          >
            Tampilkan Lagi
          </Button>
        </CardFooter>
      )}
      <Dialog
        open={modalState.type !== null}
        onOpenChange={(isOpen) => !isOpen && closeModal()}
      >
        <DialogContent>{renderModalContent()}</DialogContent>
      </Dialog>
    </Card>
  );
}
