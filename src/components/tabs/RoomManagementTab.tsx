'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Ruang } from '@/types/user';
import { DoorOpen, Edit, PlusCircle, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type RoomManagementTabProps = { rooms: Ruang[] };

const initialFormData: Omit<Ruang, 'id' | 'usageCount' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
  name: '', type: "Classroom", capacity: 0, isAvailable: true, building: '',
  floor: '', location: '', facilities: [], description: '',
};
const facilityOptions = ["Wi-Fi", "AC", "Proyektor", "Papan Tulis", "Kamera", "Pengeras Suara"];

export function RoomManagementTab({ rooms }: RoomManagementTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRoom, setSelectedRoom] = useState<Ruang | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');

  const filteredRooms = useMemo(() => rooms
    .filter(r => searchTerm === '' || r.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => filterAvailability === 'all' || (filterAvailability === 'available' ? r.isAvailable : !r.isAvailable)),
    [rooms, searchTerm, filterType, filterAvailability]);

  useEffect(() => {
    if (modalMode === 'edit' && selectedRoom) setFormData({ ...selectedRoom });
    else setFormData(initialFormData);
  }, [modalMode, selectedRoom]);

  const handleSubmit = async () => {
    // Validation can be added here
    const action = modalMode === 'add' ? 'CREATE_ROOM' : 'UPDATE_ROOM';
    const payload = { roomData: modalMode === 'add' ? formData : { ...formData, id: selectedRoom?.id } };
    try {
      const response = await fetch('/api/admin/actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, payload }), });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast.success(result.message);
      setIsModalOpen(false);
    } catch (error) { toast.error((error as Error).message); }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-start">
        <div><h2 className="text-2xl font-bold">Kelola Ruangan</h2><p className="text-muted-foreground">Atur ruang akademik dan fasilitas yang tersedia.</p></div>
        <Button onClick={() => { setModalMode('add'); setIsModalOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Ruang</Button>
      </div>

      <Card>
        <CardHeader className="flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 w-full"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nama ruang..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Semua Tipe</SelectItem><SelectItem value="Classroom">Ruang Kelas</SelectItem><SelectItem value="Laboratory">Laboratorium</SelectItem></SelectContent></Select>
            <Select value={filterAvailability} onValueChange={setFilterAvailability}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="available">Tersedia</SelectItem><SelectItem value="unavailable">Digunakan</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Menampilkan {filteredRooms.length} dari {rooms.length} ruangan.</p></CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader><CardTitle className="flex justify-between items-center"><span className="flex items-center"><DoorOpen className="mr-2 h-5 w-5 text-orange-600" /> {room.name}</span><span className={`text-xs font-bold px-2 py-1 rounded-full ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{room.isAvailable ? 'Tersedia' : 'Digunakan'}</span></CardTitle><CardDescription>{room.building}, Lt. {room.floor}</CardDescription></CardHeader>
            <CardContent className="text-sm space-y-2"><div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Kapasitas: {room.capacity} orang</div><div className="flex flex-wrap gap-2 pt-2">{room.facilities.map(f => <span key={f} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">{f}</span>)}</div></CardContent>
            <CardFooter className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => { setModalMode('edit'); setSelectedRoom(room); setIsModalOpen(true); }}><Edit className="mr-2 h-4 w-4" /> Edit</Button><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Hapus</Button></CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}><DialogContent className="sm:max-w-[650px]">
        <DialogHeader><DialogTitle>{modalMode === 'add' ? 'Tambah Ruangan Baru' : 'Edit Ruangan'}</DialogTitle><DialogDescription>Isi detail di bawah untuk mengelola ruangan.</DialogDescription></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2"><Label htmlFor="name">Nama Ruangan</Label><Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="space-y-2"><Label htmlFor="capacity">Kapasitas</Label><Input id="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData(p => ({ ...p, capacity: parseInt(e.target.value) || 0 }))} /></div>
        </div>
        <div className="space-y-4"><Label>Fasilitas</Label><div className="grid grid-cols-3 gap-4">{facilityOptions.map(f => (<div key={f} className="flex items-center space-x-2"><Checkbox id={f} checked={formData.facilities.includes(f)} onCheckedChange={() => setFormData(p => ({ ...p, facilities: p.facilities.includes(f) ? p.facilities.filter(i => i !== f) : [...p.facilities, f] }))} /><Label htmlFor={f} className="font-normal">{f}</Label></div>))}</div></div>
        <DialogFooter><Button onClick={handleSubmit}>{modalMode === 'add' ? 'Tambah Ruangan' : 'Simpan Perubahan'}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}