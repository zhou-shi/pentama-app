'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import type { ProfileFormData, User as UserProfileType } from '@/types/user';
import { Check, Edit, Eye, GraduationCap, Info, Loader2, LogOut, Shield, User, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as THREE from 'three';
import { AdminDashboard } from './AdminDashboard';
import { AutomationTrigger } from './AutomationTrigger';
import { LecturerDashboard } from './LecturerDashboard';
import { StudentDashboard } from './StudentDashboard';

// --- Helper Component: Profile Modal ---
const ProfileModal = ({ userProfile, onClose }: { userProfile: UserProfileType; onClose: () => void; }) => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'academic'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editability, setEditability] = useState({
    canEditExpertise: false,
    canEditResearchField: false,
    checked: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing || !mountRef.current) return;
    const currentMount = mountRef.current;
    let animationFrameId: number;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    const geometry = new THREE.IcosahedronGeometry(1.5, 0);
    const material = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.3, roughness: 0.6 });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    camera.position.z = 5;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      shape.rotation.x += 0.005;
      shape.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount?.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [isEditing]);

  const handleEditClick = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/user/edit-check', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal memeriksa izin edit.');
      const data = await response.json();
      setEditability({ ...data, checked: true });
    } catch (error) {
      toast.error((error as Error).message);
      setEditability({ canEditExpertise: false, canEditResearchField: false, checked: true });
    }
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: userProfile.name,
        gender: userProfile.gender,
        phone: userProfile.phone,
        dateOfBirth: userProfile.dateOfBirth ? userProfile.dateOfBirth.split('T')[0] : '',
        address: userProfile.address,
        bio: userProfile.bio,
        nidn: userProfile.lecturer?.nidn,
        expertiseField: userProfile.lecturer?.expertiseField,
        researchField: userProfile.student?.researchField,
      });
      setPhotoPreview(userProfile.profilePhotoUrl?.trim() || null);
    }
  }, [isEditing, userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'gender' | 'expertiseField' | 'researchField', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const allowedTypes = ['image/png', 'image/jpeg'];
      const maxSize = 3 * 1024 * 1024; // 3MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipe file tidak valid. Harap unggah file PNG atau JPG.');
        return;
      }

      if (file.size > maxSize) {
        toast.error('Ukuran file terlalu besar. Maksimal 3MB.');
        return;
      }

      setProfilePhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const formPayload = new FormData();
    if (formData.name) formPayload.append('name', formData.name);
    if (formData.gender) formPayload.append('gender', formData.gender);
    if (formData.phone) formPayload.append('phone', formData.phone);
    if (formData.dateOfBirth) formPayload.append('dateOfBirth', formData.dateOfBirth);
    if (formData.address) formPayload.append('address', formData.address);
    if (formData.bio) formPayload.append('bio', formData.bio);
    if (formData.nidn && !userProfile.lecturer?.nidn) formPayload.append('lecturer.nidn', formData.nidn);
    if (formData.expertiseField) formPayload.append('lecturer.expertiseField', formData.expertiseField);
    if (formData.researchField) formPayload.append('student.researchField', formData.researchField);

    if (profilePhotoFile) {
      formPayload.append('profilePhoto', profilePhotoFile);
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formPayload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast.success('Profil berhasil diperbarui!');
      updateUserProfile(result.user);
      setIsEditing(false);
      setProfilePhotoFile(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2">{value || '-'}</dd>
    </div>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const PersonalInfo = () => (
    <dl className="divide-y divide-gray-200">
      <InfoItem label="Nama Lengkap" value={userProfile.name} />
      <InfoItem label="Email" value={userProfile.email} />
      <InfoItem label="Jenis Kelamin" value={userProfile.gender} />
      <InfoItem label="Tanggal Lahir" value={formatDate(userProfile.dateOfBirth)} />
      <InfoItem label="Telepon" value={userProfile.phone} />
      <InfoItem label="Alamat" value={userProfile.address} />
      <InfoItem label="Bio" value={userProfile.bio} />
    </dl>
  );

  const AcademicInfo = () => {
    if (userProfile.role === 'student' && userProfile.student) {
      return (
        <dl className="divide-y divide-gray-200">
          <InfoItem label="NIM" value={userProfile.student.nim} />
          <InfoItem label="Fakultas" value={userProfile.student.faculty} />
          <InfoItem label="Program Studi" value={userProfile.student.studyProgram} />
          <InfoItem label="Angkatan" value={userProfile.student.enrollmentYear} />
          <InfoItem label="Bidang Riset" value={userProfile.student.researchField} />
        </dl>
      );
    }
    if (userProfile.role === 'lecturer' && userProfile.lecturer) {
      return (
        <dl className="divide-y divide-gray-200">
          <InfoItem label="NIDN" value={userProfile.lecturer.nidn} />
          <InfoItem label="Jabatan" value={userProfile.lecturer.position} />
          <InfoItem label="Bidang Keahlian" value={userProfile.lecturer.expertiseField} />
        </dl>
      );
    }
    return <div className='text-sm text-gray-500'>Informasi akademik tidak tersedia.</div>;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative transform transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-20"><X size={24} /></button>
        <div className="absolute top-4 left-4 z-20">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEditClick}><Edit className="w-4 h-4 mr-2" /> Edit Profil</Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Simpan
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>Batal</Button>
            </div>
          )}
        </div>

        <div className="relative h-48 bg-gray-50">
          <div ref={mountRef} className="absolute inset-0 z-0 opacity-50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 bg-gradient-to-t from-white via-white/70 to-transparent">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg">

                {/* [PERBAIKAN] Tag <img> diganti dengan komponen <Image> */}
                <Image
                  src={isEditing ? photoPreview || 'https://via.placeholder.com/96' : userProfile.profilePhotoUrl?.trim() || 'https://via.placeholder.com/96'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />

              </div>
              {isEditing && (
                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit size={24} />
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                </button>
              )}
            </div>
            {isEditing ? (
              <Input name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-4 text-2xl font-bold text-center h-auto bg-transparent border-dashed" />
            ) : (
              <h2 className="mt-4 text-2xl font-bold text-gray-900">{userProfile.name}</h2>
            )}
            <p className="text-sm text-gray-500 capitalize">{userProfile.role === 'student' ? 'Mahasiswa' : 'Dosen'}</p>
          </div>
        </div>

        <div className="p-6">
          {!isEditing ? (
            <>
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button onClick={() => setActiveTab('personal')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'personal' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}> <Info size={16} className="inline-block mr-2" /> Informasi Pribadi </button>
                  <button onClick={() => setActiveTab('academic')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'academic' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}> <GraduationCap size={16} className="inline-block mr-2" /> Informasi Akademik </button>
                </nav>
              </div>
              <div className="transition-opacity duration-300">
                {activeTab === 'personal' ? <PersonalInfo /> : <AcademicInfo />}
              </div>
            </>
          ) : (
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <Select name="gender" value={formData.gender} onValueChange={(v) => handleSelectChange('gender', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                      <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="address">Alamat</Label>
                <Textarea id="address" name="address" value={formData.address || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="Ceritakan sedikit tentang diri Anda..." />
              </div>
              <div className="text-sm pt-4 border-t">
                <p className="font-bold mb-2 text-base text-gray-800">Informasi Akademik</p>
                {userProfile.role === 'lecturer' && (
                  <div className="space-y-4">
                    {!userProfile.lecturer?.nidn && (
                      <div>
                        <Label htmlFor="nidn">NIDN</Label>
                        <Input id="nidn" name="nidn" value={formData.nidn || ''} onChange={handleInputChange} />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="expertiseField">Bidang Keahlian</Label>
                      <Select name="expertiseField" value={formData.expertiseField} onValueChange={(v) => handleSelectChange('expertiseField', v)} disabled={!editability.canEditExpertise}>
                        <SelectTrigger><SelectValue placeholder="Pilih Bidang Keahlian" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AES">AES</SelectItem>
                          <SelectItem value="NIC">NIC</SelectItem>
                        </SelectContent>
                      </Select>
                      {!editability.canEditExpertise && editability.checked && (
                        <p className="text-xs text-red-500 mt-1">Tidak dapat diubah saat sedang membimbing/menguji.</p>
                      )}
                    </div>
                  </div>
                )}
                {userProfile.role === 'student' && (
                  <div>
                    <Label htmlFor="researchField">Bidang Penelitian</Label>
                    <Select name="researchField" value={formData.researchField} onValueChange={(v) => handleSelectChange('researchField', v)} disabled={!editability.canEditResearchField}>
                      <SelectTrigger><SelectValue placeholder="Pilih Bidang Penelitian" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AES">AES</SelectItem>
                        <SelectItem value="NIC">NIC</SelectItem>
                      </SelectContent>
                    </Select>
                    {!editability.canEditResearchField && editability.checked && (
                      <p className="text-xs text-red-500 mt-1">Tidak dapat diubah setelah memulai proses tugas akhir.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Komponen Dashboard Utama ---
export default function Dashboard() {
  const { user, userProfile, logout } = useAuth()
  const [isAdminView, setIsAdminView] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Anda telah berhasil keluar.')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Gagal keluar. Silakan coba lagi.')
    }
  }

  const renderCurrentView = () => {
    if (userProfile?.isAdmin && isAdminView) {
      return <AdminDashboard />
    }
    if (userProfile?.role === 'student') {
      return <StudentDashboard />
    }
    if (userProfile?.role === 'lecturer') {
      return <LecturerDashboard />
    }
    return <div className='flex h-full items-center justify-center'><Loader2 className='w-8 h-8 animate-spin' /></div>
  }

  return (
    <>
      <div className="h-screen w-screen flex flex-col bg-gray-50/50">
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">P</div>
                <span className="ml-3 text-2xl font-bold text-gray-900">PENTAMA</span>
              </div>
              <div className="flex items-center space-x-4">
                {userProfile?.isAdmin && (
                  <div className="flex items-center space-x-4 border-r pr-4">
                    <AutomationTrigger />
                    <div className="flex items-center space-x-2 text-violet-600">
                      <Label htmlFor="admin-view-toggle" className="flex items-center gap-1 cursor-pointer">
                        {isAdminView ? <Shield size={14} /> : <Eye size={14} />}
                        <span className="capitalize">{isAdminView ? 'Admin' : `${userProfile.role}`}</span>
                      </Label>
                      <Switch id="admin-view-toggle" checked={isAdminView} onCheckedChange={setIsAdminView} />
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <button onClick={() => setIsModalOpen(true)} className="w-8 h-8 rounded-full overflow-hidden cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-orange-400 transition-all">
                    {userProfile?.profilePhotoUrl ? (
                      <img src={userProfile.profilePhotoUrl.trim()} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </button>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{userProfile?.name || user?.displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{userProfile?.isAdmin ? 'Admin' : userProfile?.role === 'student' ? 'Mahasiswa' : 'Dosen'}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center">
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex-grow lg:max-h-[92vh]">
          {renderCurrentView()}
        </main>
      </div>
      {isModalOpen && userProfile && (
        <ProfileModal userProfile={userProfile} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}