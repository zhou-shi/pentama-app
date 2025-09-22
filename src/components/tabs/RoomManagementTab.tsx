'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import type { Ruang } from '@/types/user';
import { AlertTriangle, DoorOpen, Edit, PlusCircle, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type RoomManagementTabProps = {
  rooms: Ruang[];
};

const initialFormData: Omit<Ruang, 'id' | 'usageCount' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
  name: '',
  type: "Classroom",
  capacity: 0,
  isAvailable: false,
  building: '',
  floor: '',
  location: '',
  facilities: [],
  description: '',
};

const facilityOptions = ["Wi-Fi", "AC", "Proyektor", "Papan Tulis", "Kamera", "Pengeras Suara"];

export function RoomManagementTab({ rooms }: RoomManagementTabProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRoom, setSelectedRoom] = useState<Ruang | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // State untuk dialog konfirmasi hapus
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Ruang | null>(null);

  useEffect(() => {
    if (modalMode === 'edit' && selectedRoom) {
      setFormData({
        name: selectedRoom.name,
        type: selectedRoom.type,
        capacity: selectedRoom.capacity,
        isAvailable: selectedRoom.isAvailable,
        building: selectedRoom.building,
        floor: selectedRoom.floor,
        location: selectedRoom.location,
        facilities: selectedRoom.facilities,
        description: selectedRoom.description,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [modalMode, selectedRoom]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama ruangan tidak boleh kosong.";
    if (!formData.building.trim()) errors.building = "Gedung tidak boleh kosong.";
    if (!formData.floor.trim()) errors.floor = "Lantai tidak boleh kosong.";
    if (!formData.location.trim()) errors.location = "Lokasi spesifik tidak boleh kosong.";
    if (!formData.capacity || formData.capacity <= 0) errors.capacity = "Kapasitas harus lebih dari 0.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFacilityChange = (facility: string) => {
    setFormData(prev => {
      const newFacilities = prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities: newFacilities };
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.warning("Harap isi semua kolom yang wajib diisi.");
      return;
    }

    if (!user) {
      toast.error("Anda harus login untuk melakukan aksi ini.");
      return;
    }

    const action = modalMode === 'add' ? 'CREATE_ROOM' : 'UPDATE_ROOM';
    const payload = {
      roomData: modalMode === 'add' ? formData : { ...formData, id: selectedRoom?.id }
    };

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action, payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Terjadi kesalahan pada server.');
      toast.success(result.message);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error((error as Error).message);
    }
  };

  // Fungsi untuk menangani konfirmasi penghapusan
  const handleConfirmDelete = async () => {
    if (!roomToDelete || !user) {
      toast.error("Gagal menghapus ruangan: data tidak ditemukan.");
      return;
    }

    const action = 'DELETE_ROOM';
    const payload = { roomId: roomToDelete.id };

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action, payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menghapus ruangan.');

      toast.success(result.message);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error((error as Error).message);
    } finally {
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };


  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Kelola Ruangan</h2>
          <p className="text-muted-foreground">Atur ruang akademik dan fasilitas yang tersedia.</p>
        </div>
        <Button onClick={() => { setModalMode('add'); setIsModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Ruang
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center"><DoorOpen className="mr-2 h-5 w-5 text-orange-600" /> {room.name}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {room.isAvailable ? 'Tersedia' : 'Digunakan'}
                </span>
              </CardTitle>
              <CardDescription>{room.building}, Lantai {room.floor}, {room.location}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Kapasitas: {room.capacity} orang</div>
              <div className="flex flex-wrap gap-2 pt-2">
                {room.facilities.map(f => <span key={f} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">{f}</span>)}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setModalMode('edit'); setSelectedRoom(room); setIsModalOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => { setRoomToDelete(room); setIsDeleteDialogOpen(true); }}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialog untuk Tambah/Edit Ruangan */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
          <div className="relative">
            <img src="/images/book.jpg" alt="Academic background" className="absolute inset-0 w-full h-full object-cover opacity-10" />
            <div className="relative p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{modalMode === 'add' ? 'Tambah Ruangan Baru' : 'Edit Ruangan'}</DialogTitle>
                <DialogDescription>Isi detail di bawah untuk mengelola ruangan.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Ruangan</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Ruangan</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Classroom">Ruang Kelas</SelectItem>
                      <SelectItem value="Laboratory">Laboratorium</SelectItem>
                      <SelectItem value="Auditorium">Auditorium</SelectItem>
                      <SelectItem value="Meeting Room">Ruang Rapat</SelectItem>
                      <SelectItem value="Other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapasitas</Label>
                  <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)} />
                  {formErrors.capacity && <p className="text-xs text-red-500">{formErrors.capacity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building">Gedung</Label>
                  <Input id="building" value={formData.building} onChange={(e) => handleInputChange('building', e.target.value)} />
                  {formErrors.building && <p className="text-xs text-red-500">{formErrors.building}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Lantai</Label>
                  <Input id="floor" value={formData.floor} onChange={(e) => handleInputChange('floor', e.target.value)} />
                  {formErrors.floor && <p className="text-xs text-red-500">{formErrors.floor}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi Spesifik</Label>
                  <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                  {formErrors.location && <p className="text-xs text-red-500">{formErrors.location}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Informasi tambahan mengenai ruangan..." />
              </div>

              <div className="space-y-4">
                <Label>Fasilitas</Label>
                <div className="grid grid-cols-3 gap-4">
                  {facilityOptions.map(facility => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox id={facility} checked={formData.facilities.includes(facility)} onCheckedChange={() => handleFacilityChange(facility)} />
                      <Label htmlFor={facility} className="font-normal">{facility}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isAvailable" checked={formData.isAvailable} onCheckedChange={(checked) => handleInputChange('isAvailable', Boolean(checked))} />
                <Label htmlFor="isAvailable">Tersedia untuk digunakan</Label>
              </div>
              <DialogFooter className="pt-4">
                <Button onClick={handleSubmit} className="w-full bg-orange-600 hover:bg-orange-700">
                  {modalMode === 'add' ? 'Tambah Ruangan' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-red-500" />Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus ruangan <strong>{roomToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

