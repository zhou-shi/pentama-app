Tolong kamu tinjau pengkodean berikut ini dalam proyek(pentama-rev) NextJs saya:
```tsx
'use client'

import { ThreeScene } from '@/components/ThreeScene'; // Pastikan path import ini benar
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, LogOut, User } from 'lucide-react';

// Komponen untuk Progress Circle
const ProgressCircle = ({ percentage }: { percentage: number }) => {
  const radius = 30 // Ukuran diperkecil
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-20 h-20"> {/* Ukuran diperkecil */}
      <svg className="w-full h-full" viewBox="0 0 80 80">
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
  )
}

// Komponen khusus untuk tampilan Dashboard Mahasiswa
const StudentDashboardView = () => {
  const { userProfile } = useAuth()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Kiri */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-lg rounded-2xl p-4">
          <h2 className="text-xl font-bold">Halo, {userProfile?.name?.split(' ')[0]}</h2>
        </Card>
        <Card className="shadow-lg rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Status Tugas Akhir</h3>
              <p className="text-sm text-gray-500">3 langkah tersisa</p>
            </div>
            <ProgressCircle percentage={35} />
          </div>
        </Card>
        <Card className="shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-orange-500 mb-4">Pencapaian</h3>
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4 space-y-3">
              <p className="font-bold text-lg">Seminar Proposal</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-1 rounded-md">Jadwal</span>
                <span className="text-sm text-gray-600">Terjadwal 12 Sep 2025, 09.00</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded-md mr-2">AES</span>
                  <span>Judul Penelitian</span>
                </div>
                <div className="flex -space-x-2">
                  <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=3" alt="user" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Pembimbing 1</span>
                  <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=1" alt="user" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Pembimbing 2</span>
                  <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=2" alt="user" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Penguji 1</span>
                  <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=4" alt="user" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Penguji 2</span>
                  <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?img=5" alt="user" />
                </div>
              </div>
            </div>
            <Button variant="secondary" className="w-full bg-gray-200 text-gray-700">
              <Lock className="w-4 h-4 mr-2" />
              Sedang Berlangsung
            </Button>
          </div>
        </Card>
      </div>

      {/* Kolom Kanan (Digabung) */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg rounded-2xl p-6 h-full">
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Bagian Teks (Langkah & Dokumen) */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Langkah-langkah</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-white">
                    <p className="font-semibold">Seminar Proposal</p>
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">Belum diajukan</span>
                  </div>
                  <div className="p-4 border rounded-lg bg-white">
                    <p className="font-semibold">Seminar Hasil</p>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Revisi</span>
                  </div>
                  <div className="p-4 border rounded-lg bg-white">
                    <p className="font-semibold">Sidang Akhir</p>
                    <p className="text-sm text-gray-500">Terjadwal 12 Sep 2025, 09.00</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">Dokumen Terakhir</h3>
                <div className="space-y-3 p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Proposal_TA_Revisi_Final.pdf</p>
                    <p className="text-xs text-gray-400">Terakhir diubah</p>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
            {/* Bagian Model 3D */}
            <div className="relative flex-1 min-h-[300px] md:min-h-full flex items-center justify-center">
              <div className="absolute w-full h-full md:-bottom-15">
                <ThreeScene
                  modelPath="/models/student.glb"
                  scale={4.8}
                  position={[0, -2, 0]}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Komponen Dashboard Utama
export default function Dashboard() {
  const { user, userProfile, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                P
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">PENTAMA</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {userProfile?.profilePhotoUrl ? (
                    <img
                      src={userProfile.profilePhotoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.name || user?.displayName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userProfile?.role === 'student' ? 'Mahasiswa' : 'Dosen'}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {userProfile?.role === 'student' ? (
          <StudentDashboardView />
        ) : (
          // Tampilan untuk Dosen atau peran lain bisa diletakkan di sini
          <div>
            <h1 className="text-3xl font-bold">Dashboard Dosen</h1>
            {/* ... Isi dashboard dosen ... */}
          </div>
        )}
      </main>
    </div>
  )
}
```
Kode ini adalah kode Komponen 'componets/Dashbaord.tsx' dalam proyek NexJs saya, untuk tanpilannya bisa kamu tinjau pada gambar yang saya kirim ini. Kemudian saya juga sudah menyiapkan tipe lengkap pada 'types/users.ts' berikut isi filenya:
```ts
export type UserRole = "student" | "lecturer"
export type Gender = "LAKI-LAKI" | "PEREMPUAN"
export type ResearchField = "NIC" | "AES"

export type Student = {
  nim: string
  researchField: ResearchField
  faculty: string
  educationLevel: string
  studyProgram: string
  programType: string
  enrollmentYear: string
  semester: string
}

export type Lecturer = {
  nidn?: string
  expertiseField: ResearchField // Changed from string to ResearchField
  position: string
  academicTitle: string
  examinerCount: number
}

export type User = {
  id: string
  uid: string // dari Firebase Auth
  email: string
  role: UserRole
  isAdmin: boolean
  name: string
  gender: Gender
  dateOfBirth: string
  phone: string
  address: string
  completedAt: string
  createdAt: string
  updatedAt: string
  cloudinaryPublicId?: string
  profilePhotoUrl?: string
  bio?: string
  student?: Student
  lecturer?: Lecturer
}

// Form data types
export type ProfileFormData = {
  name: string
  email: string
  gender: Gender | ""
  phone: string
  dateOfBirth: string
  address: string
  bio?: string
  role: UserRole | ""
  profilePhoto?: File
  // Student specific
  nim?: string
  researchField?: ResearchField
  // Lecturer specific
  nidn?: string
  expertiseField?: ResearchField // Changed from string to ResearchField
  position?: string
  academicTitle?: string
}

// NIM parsing result
export type NIMInfo = {
  faculty: string
  educationLevel: string
  studyProgram: string
  programType: string
  enrollmentYear: string
  semester: string
}

export type Supervisors = {
  supervisor1: string // format `${users.name}, ${users.lecturer.academicTitle}`
  supervisor2: string
  supervisor1Uid: string // diambil dari koleksi 'users' dengan role lecturer
  supervisor2Uid: string
};

export type Examiners = {
  examiner1: string
  examiner2: string
  examiner1Uid: string
  examiner2Uid: string
}

export type Stages = "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "revision" | "completed" | "pending"

export type Schedule = {
  date: string
  time: string
  room: string
  roomUid?: string
}

export type Scores = {
  supervisor1: number | null
  supervisor2: number | null
  examiner1: number | null
  examiner2: number | null
}

export type Feedback = {
  supervisor1: string
  supervisor2: string
  examiner1: string
  examiner2: string
}

// Koleksi 'proposal':
export type Proposal = {
  id: string
  uid: string // diambil dari koleksi 'users' dengan role student
  title: string
  researchField: ResearchField
  fileName: string
  fileUrl: string
  cloudinaryPublicId: string
  stage: Stages
  submittedAt: string
  createdAt: string
  updatedAt: string
  autoRejectAt: string
  supervisors?: Supervisors
  examiners?: Examiners
  schedule?: Schedule
  rejectionReason?: string
  adminNotes?: string
  scores?: Scores
  feedback?: Feedback
  averageScore?: number | null
  grade?: string
}

// Koleksi 'hasil'
export type Hasil = {
  id: string
  uid: string // diambil dari koleksi 'users' dengan role student
  proposalId: string // diambil dari id proposal yang sama dengan uid user(student)
  title: string
  researchField: ResearchField
  fileName: string
  fileUrl: string
  cloudinaryPublicId: string
  stage: Stages 
  submittedAt: string
  createdAt: string
  updatedAt: string
  autoRejectAt: string
  supervisors?: Supervisors
  examiners?: Examiners
  schedule?: Schedule
  rejectionReason?: string
  adminNotes?: string
  scores?: Scores
  feedback?: Feedback
  averageScore?: number | null
  grade?: string
}

// Koleksi 'sidang'
export type Sidang = {
  id: string
  uid: string // diambil dari koleksi 'users' dengan role student
  resultslId: string // diambil dari id hasil yang sama dengan uid user(student)
  title: string
  researchField: ResearchField
  fileName: string
  fileUrl: string
  cloudinaryPublicId: string
  stage: Stages 
  submittedAt: string
  createdAt: string
  updatedAt: string
  autoRejectAt: string
  supervisors?: Supervisors
  examiners?: Examiners
  schedule?: Schedule
  rejectionReason?: string
  adminNotes?: string
  scores?: Scores
  feedback?: Feedback
  averageScore?: number | null
  finalScore?: number | null // Bobot 40% hasil.averageScore + 60% sidang.averageScore
  grade?: string
}

// Koleksi 'ruang'
export type Ruang = {
  id: string
  building: string
  capacity: number
  description: string
  floor: string
  facilities: string[] // Diperbaiki: Menjadi array of strings
  isAvailable: boolean
  location: string
  name: string
  type: "Classroom" | "Laboratory" | "Auditorium" | "Meeting Room" | "Other"
  usageCount: number
  createdBy: string // uid user yang membuat ruangan
  createdAt: string
  updatedAt: string
}
```

Nah sekrang saya ingin kamu mengesuaiakn komponen 'Pencapaian' yang ada di dalam komponnen 'Dashboard' ini tepatnya Dashboard -> StudeStudentDashboard -> Cari komponen Pencapaian. Saya ingin kamu membuat komponen ini menjadi dinamis:
-> Ketika mahasiswa belum mengirmkan proposal maka:
  -> Tampilan akan berisi ajakan menarik dan dengan tombol "Kirim Proposal". Ketika di klik akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'proposal.stage' sama dengan 'submitted'
  -> Tampilan akan berisi pemberitahuan proposal berhasil terkirim menunggu peninjauan oleh admin.
-> Kemudian ketika 'proposal.stage' sama dengan 'under-review'
  -> Tampilan akan berisi pemberitahuan proposal telah di tinjau menunggu persetujuan oleh admin.
-> Kemudian ketika 'proposal.stage' sama dengan 'approved'
  -> Tampilan akan berisi judul proposal, jadwal(waktu dan ruang), Pembimbing 1 dan 2 serta Penguji 1 dan 2
-> Kemudian ketika 'proposal.stage' sama dengan 'rejected'
  -> Tampilan akan berisi pemberitahuan kenapa proposal di reject 'proposal.rejectionReason', dengan tombol 'Kirim Ulang Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'proposal.stage' sama dengan 'revision'
  -> Tampilam akan berisi :
      -> nama Pembimbing 1 'proposal.supervisors.supervisors1' dan menampilkan nilai yang  di berikan Pembimbing 1'proposal.scores.supervisor1'
      -> nama Pembimbing 2 'proposal.supervisors.supervisor2' dan menampilkan nilai yang  di berikan Pembimbing 2'proposal.scores.supervisor2'
      -> nama Penguji 1 'proposal.examiners.examiner1' dan menampilkan nilai yang  di berikan Penguji 1'proposal.scores.examiner1'
      -> nama Penguji 2 'proposal.examiners.examiner2' dan menampilkan nilai yang  di berikan Penguji 2'proposal.scores.examiner2'
      -> nilai rata-rata 'hasil.averageScore' dan proposal.grade
      -> dengan tombol 'Kirim Revisi Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'proposal.stage' sama dengan 'completed'
  -> Tampilam akan berisi :
      -> nama Pembimbing 1 'proposal.supervisors.supervisors1' dan menampilkan nilai yang  di berikan Pembimbing 1'proposal.scores.supervisor1'
      -> nama Pembimbing 2 'proposal.supervisors.supervisor2' dan menampilkan nilai yang  di berikan Pembimbing 2'proposal.scores.supervisor2'
      -> nama Penguji 1 'proposal.examiners.examiner1' dan menampilkan nilai yang  di berikan Penguji 1'proposal.scores.examiner1'
      -> nama Penguji 2 'proposal.examiners.examiner2' dan menampilkan nilai yang  di berikan Penguji 2'proposal.scores.examiner2'
      -> nilai rata-rata 'hasil.averageScore' dan proposal.grade
      -> Pesan penyemangat untuk melanjutkan ke tahap seminar hasil" dengan tombol 'Kirim Hasil' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'hasil.stage' sama dengan 'submitted'
  -> Tampilan akan berisi pemberitahuan hasil berhasil terkirim menunggu peninjauan oleh admin.
-> Kemudian ketika 'hasil.stage' sama dengan 'under-review'
  -> Tampilan akan berisi pemberitahuan hasil di tinjau menunggu persetujuan oleh admin.
-> Kemudian ketika 'hasil.stage' sama dengan 'approved'
  -> Tampilan akan berisi judul hasil, jadwal(waktu dan ruang), Pembimbing 1 dan 2 serta Penguji 1 dan 2
-> Kemudian ketika 'hasil.stage' sama dengan 'rejected'
  -> Tampilan akan berisi pemberitahuan kenapa hasil di reject 'hasil.rejectionReason', dengan tombol 'Kirim Ulang Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'hasil.stage' sama dengan 'completed'
  -> Tampilam akan berisi :
      -> nama Pembimbing 1 'hasil.supervisors.supervisors1' dan menampilkan nilai yang  di berikan Pembimbing 1'hasil.scores.supervisor1'
      -> nama Pembimbing 2 'hasil.supervisors.supervisor2' dan menampilkan nilai yang  di berikan Pembimbing 2'hasil.scores.supervisor2'
      -> nama Penguji 1 'hasil.examiners.examiner1' dan menampilkan nilai yang  di berikan Penguji 1'hasil.scores.examiner1'
      -> nama Penguji 2 'hasil.examiners.examiner2' dan menampilkan nilai yang  di berikan Penguji 2'hasil.scores.examiner2'
      -> nilai rata-rata 'hasil.averageScore' dan hasil.grade
      -> Pesan penyemangat untuk melanjutkan ke tahap seminar hasil" dengan tombol 'Kirim Hasil' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'sidang.stage' sama dengan 'submitted'
  -> Tampilan akan berisi pemberitahuan sidang berhasil terkirim menunggu peninjauan oleh admin.
-> Kemudian ketika 'sidang.stage' sama dengan 'under-review'
  -> Tampilan akan berisi pemberitahuan sidang telah di tinjau menunggu persetujuan oleh admin.
-> Kemudian ketika 'sidang.stage' sama dengan 'approved'
  -> Tampilan akan berisi judul sidang, jadwal(waktu dan ruang), Pembimbing 1 dan 2 serta Penguji 1 dan 2
-> Kemudian ketika 'sidang.stage' sama dengan 'rejected'
  -> Tampilan akan berisi pemberitahuan kenapa sidang di reject 'sidang.rejectionReason', dengan tombol 'Kirim Ulang Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'sidang.stage' sama dengan 'complete'
  -> Tampilam akan berisi :
      -> Pesan selamat telah menyelesaikan semua tahaapan
      -> nilai rata-rata 'proposal.averageScore' dan proposal.grade
      -> nilai rata-rata 'hasil.averageScore' dan hasil.grade
      -> nilai rata-rata 'sidang.averageScore' dan sidang.grade
      -> 'sidang.finalScore
-> Tambahan jika stage sama dengan pending maka muncukkan pemberitauan kenapa di pending (adminNotes) dan jadwal baru(di pending sampai kapan) tambahan ini untuk setiap tahap/koleksi sama.

Kemudian berikut adalah ranjagan 'Dialog Modal Smart File Upload':
Ketika file di upload maka, akan melakukan pengecekan:
    -> file harus pdf dan ukuran maxsimal adalah 5MB
  Kemudian setelah valid maka sistem akan membaca file menggunkan pdfjs-dist, setelah isi file di perolah dan di normalisasi, maka isi yang sudah normal ini di akan di gunkan:
    -> fitur yang cerdas untuk mencari :
        - Judul
        - Bidang Penelitan
        - Pembimbing 1 dan 2
        - File
      Format yang ada di dalam file untuk memudahkan pencarin seperti ini:
      Judul Penelitian : Rahasia AI Mambuat Dewa AKU.
      Bidang Penenelitian: NIC
      Dosen Pembimbing 1: Rahmi Hidayati , S.Kom., M.Cs.
      Dosen Pembimbing 2: Sukar Sego, S.Kom., M.Cs.
      Mata Kuliah Pilihan :
      Catatan Ketika mencari Judul cari "Judul Penelitian : Rahasia AI Mambuat Dewa AKU.
      Bidang Penenelitian:" hilangkan Judul Penelitan : dan Juga Bidang Penelitan: maka akan mendapatkan Judul Penelitan begitun untuk data lainya. dan juga terdapat fitur pengecekan:
        -> Jika 'Dialog Modal Smart File Upload' di gunkan pada koleksi 'proposal'(Seminar Proposal) maka sistem akan mengecek:
          -> Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField))
          -> Dosen Pembimbing 1 dan 2 harus sama dengan `${uses.name}, {users.lecturer.academicTitle}
        -> Jika 'Dialog Modal Smart File Upload' di gunkan pada koleksi 'hasil' maka sistem akan mengecek:
          - Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField)),
          - Dosen Pembimbing 1 dan 2 harus sama dengan `${proposal.superviors.supervisor1/2}`
          - Tentukan examiner 1 dan 2 secara otomatis dengan:
              - mengambil examiner 1 da 2 dari koleksi 'proposal'(copy proposal.examiners ke hasil.examiners ) dengan 'uid' mahasiswa yang bersangkutan
        -> Jika 'Dialog Modal Smart File Upload' di gunkan pada koleksi 'sidang' maka sistem akan mengecek:
          - Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField)),
          - Dosen Pembimbing 1 dan 2 harus sama dengan `${hasil.superviors.supervisor1/2}`
          - Tentukan examiner 1 dan 2 secara otomatis dengan:
            - mengambil examiner 1 da 2 dari koleksi 'proposal'(copy proposal.examiners ke sidang.examiners ) dengan 'uid' mahasiswa yang bersangkutan
        -> Kemudian saat di submit sediaakan API untuk menangangi:
            -> Ketika sumbit pada koleksi 'proposal':
              -> Tentukan examiner 1 dan 2 secara otomtis dan adil dengan:
                - `${users.lecturer.expertiseField}` sama dengan `${users.student.researchField}`
                - prioritaskan `${users.lecturer.examinerCount}` yang paling rendah
                - pastikan dosen yang menjadi examiner 1 atau examiner 2 tidak sama dengan dosen yang telah menjadi supervisor 1 atau supervisor 2 yang ada di dalam file.
                - Dan ambil juga uid dosen yang menjadi 'examiner 1 dan 2' sehingga data sesuai dengan tipe data koleksi 'proposal.examiners'
              -> Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
              -> Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
            -> Ketika sumbit pada koleksi 'hasil':
              -> Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
              -> Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
            -> Ketika sumbit pada koleksi 'sidang':
              -> Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
              -> Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
Kemudian ini adalah isi dari .env.local saya agar kamu lebih paham tentang proyek NextJs saya:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUEREMENT_ID

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_UPLOAD_PRESET_PROFILES
NEXT_PUBLIC_UPLOAD_PRESET_PROPOSALS
NEXT_PUBLIC_UPLOAD_PRESET_RESULTS
NEXT_PUBLIC_UPLOAD_PRESET_DEFENSES

# server-only
CLOUDINARY_CLOUD_API_KEY
CLOUDINARY_CLOUD_API_SECRET
```
Dan berikut isi dari lib/firebase.ts
```ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUEREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Configure Google provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

export default app
```


        






#Saya ingin membuat sebuah website untuk penilain tugas akhir mahasiswa(PENTAMA):
##0. Tipe koleksi (simpan pada 'types/index.ts' agar dapat di gunkan kembali):
  - Koleksi 'users':
  ```ts
    type users = {
      id: string
      uid: string // diamabil dari uid authentikasi user
      email: string
      role: "student" | "lecturer"
      isAdmin: boolean
      name: string
      gander: "LAKI-LAKI" | "PEREMPUAN"
      dateOfBirth: string
      phone: string
      address: string
      completedAt: string
      createdAt: string
      updatedAt: string
      cloudinaryPublicId?: string
      profilePhotoUrl?: string
      bio?: string
      student?: {
        nim: string,
        researchField: "NIC" | "AES",
        faculty: string,
        educationLevel: string,
        major: string,
        studyProgram: string,
        enrollmentYear: string,
        semester: string
      }
      lecturer?: {
        nidn?: string,
        expertiseField: string,
        position: string,
        academicTitle: string,
        examinerCount: number
      }
    }
  ```

  - Koleksi 'proposal':
  ```ts
    type Proposal = {
      id: string
      uid: string // diambil dari koleksi 'users' dengan role student
      title: string
      researchField: "AES" | "NIC"
      fileName: string
      fileUrl: string
      cloudinaryPublicId: string
      stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "revision" | "completed" | "pending"
      submittedAt: string
      createdAt: string
      updatedAt: string
      autoRejectAt: string
      supervisors?: {
        supervisor1: string // format `${users.name}, ${users.lecturer.academicTitle}`
        supervisor2: string
        supervisor1Uid: string // diambil dari koleksi 'users' dengan role lecturer
        supervisor2Uid: string
      }
      examiners?: {
        examiner1: string
        examiner2: string
        examiner1Uid: string
        examiner2Uid: string
      }
      schedule?: {
        date: string
        time: string
        room: string
        roomUid?: string
      }
      rejectionReason?: string
      adminNotes?: string
      scores?: {
        supervisor1: number | null
        supervisor2: number | null
        examiner1: number | null
        examiner2: number | null
      }
      feedback?: {
        supervisor1: string
        supervisor2: string
        examiner1: string
        examiner2: string
      }
      averageScore?: number | null
      grade?: string
    }
  ```

  - Koleksi 'hasil'
  ```ts
    type hasil = {
      id: string
      uid: string // diambil dari koleksi 'users' dengan role student
      proposalId: string // diambil dari id proposal yang sama dengan uid user(student)
      title: string
      researchField: "AES" | "NIC"
      fileName: string
      fileUrl: string
      cloudinaryPublicId: string
      stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed"
      submittedAt: string
      createdAt: string
      updatedAt: string
      autoRejectAt: string
      supervisors?: {
        supervisor1: string // diambil dari koleksi 'proposal'(proposal.supervisors.supervisor1)
        supervisor2: string
        supervisor1Uid: string // diambil dari koleksi 'proposal'(proposal.supervisors.supervisor1Uid)
        supervisor2Uid: string
      }
      examiners?: {
        examiner1: string
        examiner2: string
        examiner1Uid: string
        examiner2Uid: string
      }
      schedule?: {
        date: string
        time: string
        room: string
        roomUid: string
      }
      rejectionReason?: string
      adminNotes?: string
      scores?: {
        supervisor1: number | null
        supervisor2: number | null
        examiner1: number | null
        examiner2: number | null
      }
      feedback?: {
        supervisor1: string
        supervisor2: string
        examiner1: string
        examiner2: string
      }
      averageScore?: number | null
      grade?: string
    }
  ```

  - Koleksi 'sidang'
  ```ts
    type sidang = {
      id: string
      uid: string // diambil dari koleksi 'users' dengan role student
      resultslId: string // diambil dari id hasil yang sama dengan uid user(student)
      title: string
      researchField: "AES" | "NIC"
      fileName: string
      fileUrl: string
      cloudinaryPublicId: string
      stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed"
      submittedAt: string
      createdAt: string
      updatedAt: string
      autoRejectAt: string
      supervisors?: {
        supervisor1: string // diambil dari koleksi 'proposal'(proposal.supervisors.supervisor1)
        supervisor2: string
        supervisor1Uid: string // diambil dari koleksi 'proposal'(proposal.supervisors.supervisor1Uid)
        supervisor2Uid: string
      }
      examiners?: {
        examiner1: string
        examiner2: string
        examiner1Uid: string
        examiner2Uid: string
      }
      schedule?: {
        date: string
        time: string
        room: string
        roomId: string
      }
      rejectionReason?: string
      adminNotes?: string
      scores?: {
        supervisor1: number | null
        supervisor2: number | null
        examiner1: number | null
        examiner2: number | null
      }
      feedback?: {
        supervisor1: string
        supervisor2: string
        examiner1: string
        examiner2: string
      }
      averageScore?: number | null
      finalScore?: number | null // Bobot 40% hasil.averageScore + 60% sidang.averageScore
      grade?: string
    }
  ```

  - Koleksi 'ruang'
  ```ts
  type ruang = {
    id: string
    building: string
    capacity: number
    description: string
    floor: string
    facilities: []
    isAvailable: boolean
    location: string
    name: string
    type: "Classroom" | "Laboratory" | "Auditorium" | "Meeting Room" | "Other"
    usageCount: number
    createdBy: string // uid user yang membuat ruangan
    createdAt: string
    updatedAt: string
  }
  ```

##1. UI pada Rute "/" ketika user belum login:
  Tampilan akan menjadi halaman landing, dengan komponen:
    - Header lengket di atas dengan komponen di dalamnya:
      - logo yang bersebebelah dengan tuliasan "PENTAMA" yang berada di sebelah kiri
    - Hero Section yang di dalamya:
      - CTA komponen yang menarik dengan 3d model('tolong kamu rekomendasikn 3d model yang akan di gunakan) dan tomol 'login dengan goggle' yang menggunkan provider google dari firebase.
##2. UI pada Rute "/" ketika user seudah login tetapi data diri belum lengkap:
  Tampilan akan menjadi halaman untuk melengkapi data diri:
    - Data diri dasar:
      - Nama
      - Email (Sudah terisi otomatis karena sudah ada di firebase ketika login dengan akun google dan tidak bisa di ubah).
      - Jenis kelamin (Laki-laki/Perempuan)
      - Nomor telepon
      - Tanggal Lahir
      - Alamat
      - Bio data (Optional)
    - Data diri optiolan:
      - Photo profile(
        - Jika tidak diisi akan menggunkan poto profile dari akun googe nya,
        - Jika diisi maka cek dulu foto saat ini apakah ada di cloudinary jika ada hapus, setelah berhasil terhapus maka unggah foto baru, dan abil url photo baru yang telah terhapus untuk di simpan ke koleksi 'users'
      )
    - Data diri berdasarkan 'peran':
      - Jika peran yang di piliah adalah mahasiswa data diri mahasiswa:
        - NIM (
          NIM memiliki format contoh: "H1051211028"
            - H ==> kode fakultas (MIPA)
            - 1 ==> kode jenjang pendidikan
            - 05 ==> kode program studi
            - 1 ==> kode program reguler/non reguler
            - 21 ==> kode tahun(angkatan)
            - 1 ==> kode semester masuk pertama kali sebagai mahasiswa
            - 028 ==> no urutan pendaftaran di fakultas
          berikut adalah penjelasan yang lebih rinci:
            akademik:{
              "facultyCode": { "H": "FMIPA" },
              "levelCode": { "0": "Diploma", "1": "S1", "2": "S2", "3": "S3" },
              "programType": { "1": "Reguler", "2": "Non-Reguler" },
              "semesterCode": { "1": "Ganjil", "2": "Genap" },
              "fmipaProdi": {
                "01": "Matematika",
                "02": "Fisika",
                "03": "Kimia",
                "04": "Biologi",
                "05": "Rekayasa Sistem Komputer",
                "07": "Ilmu Kelautan",
                "08": "Geofisika",
                "09": "Statistika",
                "10": "Sistem Informasi"
              }
            }
            Kemudian karena saat ini masih sebatas fakultas FMIPA selain kode 'H' pada awalnya tampilan pesan tidak valid
          Sehingga bisa menciptkan sistem cerdas yang dapat secara otomatis mengisi data diri mahasiswa :
            - Fakultas
            - Jenjang Pendidikan
            - Jurusan
            - Prodi
            - Tahun Masuk
            - Semester (berdasakan tahun masuk dan tahun saat ini)
          ) dan (NIM harus unique di koleksi 'users')
        - Bidang Penelitian (NIC/AES)
    Jika peran yang di pilih adalah 'dosen' data diri dosen:
      - NID (Optioan) dan jika di isi (Harus unique di koleksi 'users')
      - Bidang Keahlian (NIC/AES)
      - Gelar Akademik (e.g., S.H., LL.M., Ph.D. )
      - Posisi (Tenaga Pengajar/Lektor/Asisten Ahli)
##3. Sidebar UI Format:
  - Hanya tampil Jika peran adalah 'mahasiswa/dosen' :
      - Sidebar section 1 (lengket di atas, sidebar header) berisi :
        - Logo dan "PENTAMA"
      - Sidebar section 2 (hanya tampil jika isAdmin 'true') berisi:
        - Card dengan isi :
          - Logo perisai dan "Administrator'
          - "Full System Access Enabled"
      - Sidebar section 3 (scollabel, sidebar kontent) berisi:
        - sidebar grup "Informasi Dasar":
          - sidebar menu 'Dashboard'
          - sidebar menu 'Profile'
        - sidebar grup "Adminitrator" (hanya tampil jika isAdmin 'true'):
          - sidebar menu 'Ringkasan'
          - siebar menu 'Kelola Proposal'
          - siebar menu 'Kelola Hasil'
          - siebar menu 'Kelola Sidang'
        - sidebar grup "Mahasiswa/Dosen":
          - seidebar menu 'Proposal'
          - sidebar menu 'Hasil'
          - sidebar menu 'Sidang'
      - Sidebar section 4 (sidebar footer, lengket bawah):
        - Tombol logOut
##4. Pseudocode Overall Progres
  ```ts
      // =======================
    // 1) TYPE DEFINITIONS
    // =======================

    // Koleksi yang dihitung
    type CollectionKey = "proposal" | "hasil" | "seminar";

    // Stage per collection (union khusus)
    type ProposalStage =
      | "submitted"
      | "under-review"
      | "approved"
      | "in-progress"
      | "revision"
      | "completed"
      | "pending"
      | "rejected";

    type HasilStage =
      | "submitted"
      | "under-review"
      | "approved"
      | "in-progress"
      | "completed"
      | "rejected";

    type SeminarStage =
      | "submitted"
      | "under-review"
      | "in-progress"
      | "completed"
      | "rejected";

    // Minimal dokumen yang dibutuhkan fungsi (cukup stage)
    interface ProposalDoc { stage: ProposalStage | null | undefined }
    interface HasilDoc    { stage: HasilStage    | null | undefined }
    interface SeminarDoc  { stage: SeminarStage  | null | undefined }

    // Peta stage → persen (hanya menerima key union stage terkait)
    type StagePercentMap<TStage extends string> = Record<TStage, number>;

    // Hasil perhitungan
    interface CalcOverallResult {
      overall: number; // 0..100 dibulatkan
      status: "completed" | "blocked" | "in-progress";
      breakdown: Partial<Record<CollectionKey, number>>; // persen per collection
      weights:   Partial<Record<CollectionKey, number>>; // bobot final (ternormalisasi)
    }

    // =======================
    // 2) STAGE → PERCENT MAPS
    // =======================

    const mapProposal = {
      "submitted": 10,
      "under-review": 30,
      "approved": 50,
      "in-progress": 70,
      "pending" : 78,
      "revision": 85,
      "completed": 100,
      "rejected": 0,
    } as const satisfies StagePercentMap<ProposalStage>;

    const mapHasil = {
      "submitted": 10,
      "under-review": 30,
      "approved": 55,
      "in-progress": 80,
      "completed": 100,
      "rejected": 0,
    } as const satisfies StagePercentMap<HasilStage>;

    const mapSeminar = {
      "submitted": 10,
      "under-review": 40,
      "in-progress": 80,
      "completed": 100,
      "rejected": 0,
    } as const satisfies StagePercentMap<SeminarStage>;

    // =======================
    // 3) HELPERS
    // =======================

    function pctFromStage<TStage extends string>(
      stage: TStage | null | undefined,
      map: StagePercentMap<TStage>
    ): number {
      if (!stage) return 0;       // null/undefined → 0%
      return map[stage] ?? 0;     // fallback 0 utk keamanan runtime
    }

    function normalizeWeights(
      base: Partial<Record<CollectionKey, number>>,
      activeKeys: CollectionKey[]
    ): Partial<Record<CollectionKey, number>> {
      const picked: Partial<Record<CollectionKey, number>> = {};
      for (const k of activeKeys) picked[k] = base[k] ?? 0;

      const sum = activeKeys.reduce((acc, k) => acc + (picked[k] ?? 0), 0);
      if (sum <= 0) return picked; // caller akan fallback ke bobot setara

      for (const k of activeKeys) picked[k] = (picked[k] ?? 0) / sum; // normalisasi → total 1
      return picked;
    }

    // =======================
    // 4) FUNGSI UTAMA
    // =======================

    function calcOverall(
      input: {
        proposal?: ProposalDoc | null;
        hasil?: HasilDoc | null;
        seminar?: SeminarDoc | null;
      },
      options?: {
        weights?: Partial<Record<CollectionKey, number>>; // bobot opsional
      }
    ): CalcOverallResult {
      // Tentukan collection aktif (dokumen tersedia)
      const active: CollectionKey[] = (["proposal", "hasil", "seminar"] as const)
        .filter((k) => Boolean(input[k]));

      if (active.length === 0) {
        return { overall: 0, status: "in-progress", breakdown: {}, weights: {} };
      }

      // Breakdown per collection (0..100)
      const breakdown: Partial<Record<CollectionKey, number>> = {};
      if (input.proposal) breakdown.proposal = pctFromStage(input.proposal.stage, mapProposal);
      if (input.hasil)    breakdown.hasil    = pctFromStage(input.hasil.stage,    mapHasil);
      if (input.seminar)  breakdown.seminar  = pctFromStage(input.seminar.stage,  mapSeminar);

      // Status agregat
      const isBlocked = active.some((k) => {
        const stage = (input[k] as ProposalDoc | HasilDoc | SeminarDoc | null)?.stage;
        return stage === "rejected";
      });

      const allCompleted = active.every((k) => {
        const stage = (input[k] as ProposalDoc | HasilDoc | SeminarDoc | null)?.stage;
        return stage === "completed";
      });

      // Bobot
      let weights: Partial<Record<CollectionKey, number>>;
      if (options?.weights && Object.keys(options.weights).length > 0) {
        weights = normalizeWeights(options.weights, active);
        // Jika semua 0 → fallback bobot setara
        const sum = active.reduce((a, k) => a + (weights[k] ?? 0), 0);
        if (sum <= 0) {
          const eq = 1 / active.length;
          weights = {};
          for (const k of active) weights[k] = eq;
        }
      } else {
        const eq = 1 / active.length;
        weights = {};
        for (const k of active) weights[k] = eq;
      }

      // Overall
      let total = 0;
      for (const k of active) {
        const pct = (breakdown[k] ?? 0) / 100; // 0..1
        const w   = weights[k] ?? 0;
        total += pct * w;
      }
      const overall = Math.round(total * 100); // 0..100 (dibulatkan)

      // Status final (prioritas: allCompleted > blocked > in-progress)
      const status: CalcOverallResult["status"] =
        allCompleted ? "completed" : (isBlocked ? "blocked" : "in-progress");

      return { overall, status, breakdown, weights };
    }

    // =======================
    // 5) CONTOH PEMAKAIAN
    // =======================

    const r1 = calcOverall({
      proposal: { stage: "approved" },   // 50%
      hasil:    { stage: "submitted" },  // 10%
      seminar:  null
    }); // -> overall 30, status "in-progress"

    const r2 = calcOverall({
      proposal: { stage: "revision" },     // 85%
      hasil:    { stage: "in-progress" },  // 80%
      seminar:  { stage: "under-review" }, // 40%
    }, {
      weights: { proposal: 1, hasil: 1, seminar: 1 } // dinormalisasi → setara
    }); // -> overall ≈ 68, status "in-progress"

```
##5. UI pada rute "/" ketika user sudah login dan data diri sudah lengkap:
  Tampilan akan menjadi halaman "Dashboard" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent dashboard:
  - Ketika peran adalah mahasiswa:
    - Card dengan komponen:
      - h2 "Selamat Datang Kemblai, `${users.name}`
      - p "Track your final project progress and upcoming schedules"
      - Kontainer dengan komponen:
        - badge komponen `${users.role}`
        - badge komponen `${users.student.researchField}`
    - Card jadwal
    - Card dengan komponen:
      - h2 icon + "Final Project Informarmation"
      - h3 "Research Title"
      - p `${hasil.title}`
      - h3 "Overall Progress"
      - p (bobot atau perentase dari `calcOverall`)
    - Card dengan komponen:
      - h2 icon + "Tim Penguji"
      - Sesi Pembimbing:
        - Pembimbing 1
        - `${proposal.supervisors.supervisor1}`
        - Pembimbing 2
        - `${proposal.supervisors.supervisor2}`
      - Sesi Pnguji:
        - Pengujai 1
        - `${proposal.examiners.examiner1}`
        - Pengujai 2
        - `${proposal.examiners.examiner2}`
    - Card 'Progres Tracker
  - Ketika peran adalah dosen:
     - Card dengan komponen:
      - h2 "Selamat Datang Kemblai, `${users.name}, ${users.lecturer.academicTitle}`
      - p "Manage your students and track academic progress"
      - Kontainer dengan komponen:
        - badge komponen `${users.role}`
        - badge komponen `${users.lecturer.expertiseField}`
    - Card Jumlah mahasiswa yang di bimbing
    - Card jumlah mahasiswa yang di uji
    - Card Jumlah penilaian yang akan akan datang
    - Card Upcoming Testing Schedule
    - Card Recent Activities
  - Kemudian jika isAdmin true maka di setaip dashboard yang akan mengswap atau bisa meindah tampilan ke Dashboard admin(Untuk UI dan data-data yang di tampilan tolong kamu rancangkan)
##6. UI pada rute "/profile" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran). Tampilan akan menjadi halaman "Profile" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent profile:
  - Rancangkan agar menampilkan ada diri yang ada di koleksi users, data menyesuaikan dengan role users.
  - Kemudain tambhkan tombol atau aksi edit profile untuk menampilakn 'modal edit profile', dan untuk fungsi edit foto profile, cek dulu apakah users.profilePhotoUrl ada jika ada cek apakah ada di coudinary jika ada hapus foto yang ada cloudinary baru unggah foto baru ke cloudinary.
  - simpan semua data diri baru.   
##7. Rancangan 'Smart File Upload':
  Ketika file di upload maka, akan melakukan pengecekan:
    - file harus pdf dan ukuran maxsimal adalah 5MB
  Kemudian setelah valid maka sistem akan membaca file menggunkan 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js', setelah isi file di perolah dan di normalisasi, maka isi yang sudah normal ini di akan di gunkan:
    - fitur yang cerdas untuk mencari :
        - Judul
        - Bidang Penelitan
        - Pembimbing 1 dan 2
        - File
      Format yang ada di dalam file untuk memudahkan pencarin seperti ini:
      Judul Penelitian : Rahasia AI Mambuat Dewa AKU.
      Bidang Penenelitian: NIC
      Dosen Pembimbing 1: Rahmi Hidayati , S.Kom., M.Cs.
      Dosen Pembimbing 2: Sukar Sego, S.Kom., M.Cs.
      Mata Kuliah Pilihan :
      Catatan Ketika mencari Judul cari "Judul Penelitian : Rahasia AI Mambuat Dewa AKU.
      Bidang Penenelitian:" hilangkan Judul Penelitan : dan Juga Bidang Penelitan: maka akan mendapatkan Judul Penelitan begitun untuk data lainya. dan juga terdapat fitur pengecekan:
        - Jika 'smart file upload' di gunkan pada koleksi 'proposal' maka sistem akan mengecek:
          - Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField))
          - Dosen Pembimbing 1 dan 2 hasus sama dengan `${uses.name}, {users.lecturer.academicTitle}
          - Tentukan examiner 1 dan 2 secara otomtis dan adil dengan:
            - `${users.lecturer.expertiseField}` sama dengan `${users.student.researchField}`
            - prioritaskan `${users.lecturer.examinerCount}` yang paling rendah
            - pastikan dosen yang menjadi examiner 1 atau examiner 2 tidak sama dengan dosen yang telah menjadi supervisor 1 atau supervisor 2 yang ada di dalam file.
            - Dan ambil juga uid dosen yang menjadi 'examiner 1 dan 2' sehingga data sesuai dengan tipe data koleksi 'proposal.examiners'
          - Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
          - Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
        - Jika 'smart file uplod' di gunkan pada koleksi 'hasil' maka sistem akan mengecek:
          - Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField)),
          - Dosen Pembimbing 1 dan 2 harus sama dengan `${proposal.superviors.supervisor1/2}`
          - Tentukan examiner 1 dan 2 secara otomatis dengan:
              - mengambil examiner 1 da 2 dari koleksi 'proposal'(copy proposal.examiners ke hasil.examiners ) dengan 'uid' mahasiswa yang bersangkutan
          - Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
          - Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
        - Jika 'smart file uplod' di gunkan pada koleksi 'sidang' maka sistem akan mengecek:
          - Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField)),
          - Dosen Pembimbing 1 dan 2 harus sama dengan `${hasil.superviors.supervisor1/2}`
          - Tentukan examiner 1 dan 2 secara otomatis dengan:
            - mengambil examiner 1 da 2 dari koleksi 'proposal'(copy proposal.examiners ke sidang.examiners ) dengan 'uid' mahasiswa yang bersangkutan
          - Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
          - Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
    Tampilakn informasi lengkap data yang sudah falid "Information Extracted & Assignments Made"(akan tampil jika stage tidak sama dengan 'rejected' atau 'revision'). Jika stage sama dengan 'rejected' atau 'revision' atau null maka Tampilan akan tetap Tampilan untuk unggah file.
    Kemudain ketika di klik submit:
      - Jika 'smart file upload' digunkan pada koleksi 'proposal':
        - Jika belum ada proposal atau `${proposal.stage}` sama dengan null atau belum ada:
          - Simpan file ke cloudinary ke preset(env.NEXT_PUBLIC_UPLOAD_PRESET_PROPOSAL).
          - Setelah itu semimpan semua data yang di perlukan oleh keleksi 'proposal'
        - Jika `${proposal.stage}` sama dengan 'rejected' atau 'revision':
          - Cek file yang ada di Cloudinary dengan `${proposal.fileUrl}`, jika ada maka hapus file pada cloudinary, dan setelah penghapusan berhasil simpan file baru di Cloudinary.
      - Jika 'smart file upload' digunkan pada koleksi 'hasil':
        - Jika belum ada hasil atau `${hasil.stage}` sama dengan null atau belum ada:
          - Simpan file ke cloudinary ke preset(env.NEXT_PUBLIC_UPLOAD_PRESET_RESULTS).
          - Setelah itu seimpan semua data yang di perlukan oleh keleksi 'hasil'
        - Jika `${hasil.stage}` sama dengan 'rejected':
           - Cek file yang ada di Cloudinary dengan `${hasil.fileUrl}`, jika ada maka hapus file pada cloudinary, dan setelah penghapusan berhasil simpan file baru di Cloudinary.
          - Setelah itu perbarui semua data yang di perlukan oleh keleksi 'hasil'
      - Jika 'smart file upload' digunkan pada koleksi 'sidang':
        - Jika belum ada sidang atau `${siang.stage}` sama dengan null atau belum ada:
          - Simpan file ke cloudinary ke preset(env.NEXT_PUBLIC_UPLOAD_PRESET_DEFENSE).
          - Setelah itu seimpan semua data yang di perlukan oleh keleksi 'sidang'
        - Jika `${sidang.stage}` sama dengan 'rejected':
           - Cek file yang ada di Cloudinary dengan `${sidang.fileUrl}`, jika ada maka hapus file pada cloudinary, dan setelah penghapusan berhasil simpan file baru di Cloudinary.
          - Setelah itu perbarui semua data yang di perlukan oleh keleksi 'sidang'
##8. UI pada rute "/proposal" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran). Tampilan akan menjadi halaman "Proposal" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent proposal:
  - Ketika peran student maka komponen UI:
    - Kontainer :
      - Icon
      - Kontainer :
        - "Research Proposal Submission"
        - Upload and manage your proposal
    - Card :
      - Icon
      - Kontainer:
        - "Mahasiswa"
        - `${users.name}`
    - Card :
      - Icon
      - Kontainer:
        - "Bidang Penelitian"
        - `${users.student.researchField}`
    - Card :
      - Icon
      - Kontainer:
        - "Bidang status"
        - `${proposal.stage}`
    - Alert "Resubmission Required" jika proposal.stage sama dengan 'rejected' atau 'revision'
    - Proposal Progress Tracker tampil jika jika proposal.stage tidak sama dengan rejected atau revision
    - Previous Evaluation Results tampil jika proposal.stage sama dengan 'revison' atau 'completed'
    - Smart File Upload
  - Ketika peran dosen Tampilan komponen ui:
    - Kontainer:
      - Icon 
      - "Welcome, `${users.name}, ${users.lecturer.academicTitle}`"
      - "Evaluate student proposal"
    - Kontainer:
      - Kontainer
        - Icon
        - Student Proposal Evaluation
      - Box search (by title, student name, or nim)
      - Filter select by stage ( stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "revision" | "completed")
      - Filter select by Filed ("AES"/"NIC") muncul jika dosen adalah 'examiner 1 atau 2'
      - Alert "No proposal found where you are assigned as supervisor or examiner." akan muncul jika dosen belum manjadi examiners atau supervisors untuk mahasiswa manapun
      - Table "Student Seminar Proposals", akan memunculkan seluruh mahasiswa yang proposal.examiners.examiner1Uid atau proposal.examiners.examiner1Uid atau proposal.supervisors.supervisor1Uid atau proposal.supervisors.supervisor2Uid sama dengan uid dosen. 
        - Kolom Stundet:
          - Nama Mahasiswa(users.name)
          - NIM (users.student.nim)
        - Kolom Title:
          - Judul Proposal (proposal.title)
          - Bidang Penelitian (users.student.researchField)
        - Kolom Role:
          - (Supervisors1/Supervisors2/Examiner1/Examiners2)
        - Kolom Jadwal:
          - mm-dd-yy
          - jam
        - Kolom Ruangan:
          - (proposal.schedule.room)
        - Kolom Score:
          - (proposal.scores.(berdarkan prean dosen yang mengakses(supervisor1/2/examiner1/2)))
        - Kolom Status:
          - proposal.stage
        - Kolom Aksi
          - lihat proposal
          - evaluai(
            aksi untuk menampilkan modal penilaian, yang hanya tampil dan dapat di gunkan pada saat proposal.stage sama dengan "in-progress",
            Kemudian nilai yang di bserikan harus besar dari 0 dan kurang dari atau sama dengan 100, kemudain ketika di klik kirim maka, tampilkan modal konfirmasi agar dosen yakin dengan mahasiswa yang di berikan nilai oleh nya, dan jika sudah di lakukan penilain maka aksi ini akan hilang dan tidak dapat di gunkan lagi.
          )
##9. UI pada rute "/hasil" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran). Tampilan akan menjadi halaman "Hasil" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent proposal:
  - Ketika peran student maka komponen UI(hanya muncul ketika(proposal.stage sama dengan "completed" dan prposal.averageScore besar dari atau sama dengan 70)):
    - Kontainer :
      - Icon
      - Kontainer :
        - "Research Results Submission"
        - Upload and manage your Results
    - Card :
      - Icon
      - Kontainer:
        - "Mahasiswa"
        - `${users.name}`
    - Card :
      - Icon
      - Kontainer:
        - "Bidang Penelitian"
        - `${users.student.researchField}`
    - Card :
      - Icon
      - Kontainer:
        - "Bidang status"
        - `${hasil.stage}`
    - Alert "Resubmission Required" jika hasil.stage sama dengan 'rejected'
    - Hasil Progress Tracker tampil jika hasil.stage tidak sama dengan rejected
    - Previous Evaluation Results tampil jika hasil.stage sama dengan 'completed'
    - Smart File Upload
  - Ketika peran dosen Tampilan komponen ui:
    - Kontainer:
      - Icon 
      - "Welcome, `${users.name}, ${users.lecturer.academicTitle}`"
      - "Evaluate student hasil"
    - Kontainer:
      - Kontainer
        - Icon
        - Student Hasil Evaluation
      - Box search (by title, student name, or nim)
      - Filter select by stage ( stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed")
      - Filter select by Filed ("AES"/"NIC") muncul jika dosen adalah 'examiner 1 atau 2'
      - Alert "No results found where you are assigned as supervisor or examiner." akan muncul jika dosen belum manjadi examiners atau supervisors untuk mahasiswa manapun
      - Table "Student Seminar Hasil", akan memunculkan seluruh mahasiswa yang hasil.examiners.examiner1Uid atau hasil.examiners.examiner1Uid atau hasil.supervisors.supervisor1Uid atau hasil.supervisors.supervisor2Uid sama dengan uid dosen. 
        - Kolom Stundet:
          - Nama Mahasiswa(users.name)
          - NIM (users.student.nim)
        - Kolom Title:
          - Judul Hasil (hasil.title)
          - Bidang Penelitian (users.student.researchField)
        - Kolom Role:
          - (Supervisors1/Supervisors2/Examiner1/Examiners2)
        - Kolom Jadwal:
          - mm-dd-yy
          - jam
        - Kolom Ruangan:
          - (hasil.schedule.room)
        - Kolom Score:
          - (hasil.scores.(berdarkan prean dosen yang mengakses(supervisor1/2/examiner1/2)))
        - Kolom Status:
          - hasil.stage
        - Kolom Aksi
          - lihat hasil
          - evaluai(
            aksi untuk menampilkan modal penilaian, yang hanya tampil dan dapat di gunkan pada saat hasil.stage sama dengan "in-progress",
            Kemudian nilai yang di bserikan harus besar dari 0 dan kurang dari atau sama dengan 100, kemudain ketika di klik kirim maka, tampilkan modal konfirmasi agar dosen yakin dengan mahasiswa yang di berikan nilai oleh nya, dan jika sudah di lakukan penilain maka aksi ini akan hilang dan tidak dapat di gunkan lagi.
          )
  - Ketika peran student maka komponen UI(hanya muncul ketika(proposal.stage tidak sama dengan "completed" dan prposal.averageScore kurang dari atau sama dengan 70)):
    - Cad komponen akses di tolak
##10. UI pada rute "/sidang" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran). Tampilan akan menjadi halaman "Sidang" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent hasil:
  - Ketika peran student maka komponen UI(hanya muncul ketika(hasil.stage sama dengan "completed" dan hasil.averageScore besar dari 0)):
    - Kontainer :
      - Icon
      - Kontainer :
        - "Research Sidang Submission"
        - Upload and manage your Sidang
    - Card :
      - Icon
      - Kontainer:
        - "Mahasiswa"
        - `${users.name}`
    - Card :
      - Icon
      - Kontainer:
        - "Bidang Penelitian"
        - `${users.student.researchField}`
    - Card :
      - Icon
      - Kontainer:
        - "Bidang status"
        - `${sidang.stage}`
    - Alert "Resubmission Required" jika sidang.stage sama dengan 'rejected'
    - Sidang Progress Tracker tampil jika sidang.stage tidak sama dengan rejected
    - Previous Evaluation Sidang tampil jika sidang.stage sama dengan 'completed'
    - Smart File Upload
  - Ketika peran dosen Tampilan komponen ui:
    - Kontainer:
      - Icon 
      - "Welcome, `${users.name}, ${users.lecturer.academicTitle}`"
      - "Evaluate student sidang"
    - Kontainer:
      - Kontainer
        - Icon
        - Student Sidang Evaluation
      - Box search (by title, student name, or nim)
      - Filter select by stage ( stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed")
      - Filter select by Filed ("AES"/"NIC") muncul jika dosen adalah 'examiner 1 atau 2'
      - Alert "No sidang found where you are assigned as supervisor or examiner." akan muncul jika dosen belum manjadi examiners atau supervisors untuk mahasiswa manapun
      - Table "Student Seminar Sidang", akan memunculkan seluruh mahasiswa yang sidang.examiners.examiner1Uid atau sidang.examiners.examiner1Uid atau sidang.supervisors.supervisor1Uid atau sidang.supervisors.supervisor2Uid sama dengan uid dosen. 
        - Kolom Stundet:
          - Nama Mahasiswa(users.name)
          - NIM (users.student.nim)
        - Kolom Title:
          - Judul Sidang (sidang.title)
          - Bidang Penelitian (users.student.researchField)
        - Kolom Role:
          - (Supervisors1/Supervisors2/Examiner1/Examiners2)
        - Kolom Jadwal:
          - mm-dd-yy
          - jam
        - Kolom Ruangan:
          - (sidang.schedule.room)
        - Kolom Score:
          - (sidang.scores.(berdarkan prean dosen yang mengakses(supervisor1/2/examiner1/2)))
        - Kolom Status:
          - sidang.stage
        - Kolom Aksi
          - lihat sidang
          - evaluai(
            aksi untuk menampilkan modal penilaian, yang hanya tampil dan dapat di gunkan pada saat sidang.stage sama dengan "in-progress",
            Kemudian nilai yang di bserikan harus besar dari 0 dan kurang dari atau sama dengan 100, kemudain ketika di klik kirim maka, tampilkan modal konfirmasi agar dosen yakin dengan mahasiswa yang di berikan nilai oleh nya, dan jika sudah di lakukan penilain maka aksi ini akan hilang dan tidak dapat di gunkan lagi.
          )
    - Ketika peran student maka komponen UI(hanya muncul ketika(hasil.stage tidak sama dengan "completed" dan prposal.averageScore kurang dari 0)):
      - Cad komponen akses di tolak
##11.UI pada rute "/kelola-proposal" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran dan isAdmin `true`). Tampilan akan menjadi halaman "Kelola Proposal" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent Kelola Proposal:
  - Kontainer:
    - Incon
    - kontainer
      - "Manage Proposals"
      - "Comprehensive proposal management and oversight tools"
  - Proposal Management Overview(Berisi grafik 3d berdasakan tahaoab (stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "pending" | "revision" | "completed"))
  - Card 
    - kontainer 
      - Icon
      - "Proposal Management System"
    - Search Box (by title, student name or nim)
    - Filter select by stage ( stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "pending" | "revision" | "completed")
    - Filter select by Filed ("AES"/"NIC")
    - Kontainer (akan muncul jika koleksi proposal masih kosong('mahasiswa belum melakukan penilaian apapun))
      - Icon
      - "No Proposal Found"
      - Alert 
        - Icon
        - "Students have not submitted their proposals yet"
    - Table "Seminar Proposal Management", akan memunculkan seluruh mahasiswa yang telah memilki koleksi proposal. 
      - Kolom Stundet:
        - Nama Mahasiswa(users.name)
        - NIM (users.student.nim)
      - Kolom Title:
        - Judul Proposal (proposal.title)
        - Bidang Penelitian (users.student.researchField)
      - Kolom Supervisors:
        - S1: `{proposal.supervisors.supervisor1}
        - S2: `{proposal.supervisors.supervisor2}
      - Kolom Examiners:
        - E1: `${proposal.examainers.examiner1}`
        - E2: `${proposal.examainers.examiner2}`
      - Kolom Jadwal:
        - mm-dd-yy (dari proposal.schedule.date)
        - jam/waktu (dari proposal.schedule.time)
        - ruang (dari proposal.schedule.room)
      - Kolom Score:
        - (proposal.averageScore)
      - Kolom Status:
        - proposal.stage
      - Kolom Aksi
        - lihat proposal(under-review)(
          aksi ini selain melihat proposal, jika proposal.satge sama dengan 'submitted' akan memperbarui proposal.stage menjadi 'under-review'
        )
        - rejected(
          aksi ini hanya muncul dan dapat digunkan ketika proposal.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi dengan kolom 'pesan alasan' yang harus disi. ketika di konfirmasi maka akan mengubah proposal.stage menajdi 'rejected'
        )
        - approved(
          aksi ini hanya muncul dan dapat digunkan ketika proposal.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi untuk menyakin admin bahwa mahasiswa yang di 'approved' benar. ketika di konfirmasi maka akan mengubah proposal.stage menajdi 'approved', dan juga menambhkan users.lecturer.examinerCount sebanyak 1 kepada user dengan peran dosen yang terpilih manjadi examiner1 atau exainers2
        )
        - edit-supervisors(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input supervisor 1 dan supervisor 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam supervisor 1 dan supervisor 2 jika pada proposal.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain proposal.supervisors.superviosr1/2 maka ubah juga proposal.supervisors.superviosr1Uid/2
        )
        - edit-examiners(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input examiner 1 dan examiner 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam examiner 1 dan examiner 2 jika pada proposal.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain proposal.examiners.examiner1/2 maka ubah juga proposal.examiners.examiner1Uid/2
        )
        - edit-jadwal(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved',ketika di klik akan menampilkan modal yeng berisi inputan mm-dd-yy dan inputan waktu pm/am, jika pada proposal.schedule.date maka isi secara otomais inputan mm-dd-yy dan jika ada proposal.schedule.time maka isi inputan waktu juga. kemudian jika di konfirmasi maka akan mengubah data terakit yaitu (proposal.schedule.date dan proposal.schedule.time)
        )
        - edit-ruang(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved', ketika di klik akan menampilkan modal yang berisi selact input nama ruangan yang tersedia, jika proposal.schedule.room tersedia maka isi secara otomatis jika, nama yang tampil dalam pilahan adalah nama ruangn yang tidak di gunkan pada jadwal yang sama oleh mahasiswa lain dan mahasiswa ini. Kemudain jika di konfirmasi tentukan akan mengubah proposal.schedule.room dan proposal.schedule.roomId
        )
##12.UI pada rute "/kelola-hasil" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran dan isAdmin `true`). Tampilan akan menjadi halaman "Kelola Hasil" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent Kelola Hasil:
  - Kontainer:
    - Incon
    - kontainer
      - "Manage Hasil"
      - "Comprehensive hasil management and oversight tools"
  - Hasil Management Overview(Berisi grafik 3d berdasakan tahaoab (stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed"))
  - Card 
    - kontainer 
      - Icon
      - "Seminar Hasil Management System"
    - Search Box (by title, student name or nim)
    - Filter select by stage ( stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed")
    - Filter select by Filed ("AES"/"NIC")
    - Kontainer (akan muncul jika koleksi hasil masih kosong('mahasiswa belum melakukan penilaian apapun))
      - Icon
      - "No Hasil Found"
      - Alert 
        - Icon
        - "Students have not submitted their proposals yet"
    - Table "Hasil Management", akan memunculkan seluruh mahasiswa yang telah memilki koleksi hasil. 
      - Kolom Stundet:
        - Nama Mahasiswa(users.name)
        - NIM (users.student.nim)
      - Kolom Title:
        - Judul Hasil (hasil.title)
        - Bidang Penelitian (users.student.researchField)
      - Kolom Supervisors:
        - S1: `{hasil.supervisors.supervisor1}
        - S2: `{hasil.supervisors.supervisor2}
      - Kolom Examiners:
        - E1: `${hasil.examainers.examiner1}`
        - E2: `${hasil.examainers.examiner2}`
      - Kolom Jadwal:
        - mm-dd-yy (dari hasil.schedule.date)
        - jam/waktu (dari hasil.schedule.time)
        - ruang (dari hasil.schedule.room)
      - Kolom Score:
        - (hasil.averageScore)
      - Kolom Status:
        - hasil.stage
      - Kolom Aksi
        - lihat hasil(under-review)(
          aksi ini selain melihat hasil, jika hasil.satge sama dengan 'submitted' akan memperbarui hasil.stage menjadi 'under-review'
        )
        - rejected(
          aksi ini hanya muncul dan dapat digunkan ketika hasil.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi dengan kolom 'pesan alasan' yang harus disi. ketika di konfirmasi maka akan mengubah hasil.stage menajdi 'rejected'
        )
        - approved(
          aksi ini hanya muncul dan dapat digunkan ketika hasil.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi untuk menyakin admin bahwa mahasiswa yang di 'approved' benar. ketika di konfirmasi maka akan mengubah hasil.stage menajdi 'approved', dan juga menambhkan users.lecturer.examinerCount sebanyak 1 kepada user dengan peran dosen yang terpilih manjadi examiner1 atau exainers2
        )
        - edit-supervisors(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input supervisor 1 dan supervisor 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam supervisor 1 dan supervisor 2 jika pada hasil.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain hasil.supervisors.superviosr1/2 maka ubah juga hasil.supervisors.superviosr1Uid/2
        )
        - edit-examiners(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input examiner 1 dan examiner 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam examiner 1 dan examiner 2 jika pada hasil.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain hasil.examiners.examiner1/2 maka ubah juga hasil.examiners.examiner1Uid/2
        )
        - edit-jadwal(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved',ketika di klik akan menampilkan modal yeng berisi inputan mm-dd-yy dan inputan waktu pm/am, jika pada hasil.schedule.date maka isi secara otomais inputan mm-dd-yy dan jika ada hasil.schedule.time maka isi inputan waktu juga. kemudian jika di konfirmasi maka akan mengubah data terakit yaitu (hasil.schedule.date dan hasil.schedule.time)
        )
        - edit-ruang(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved', ketika di klik akan menampilkan modal yang berisi selact input nama ruangan yang tersedia, jika hasil.schedule.room tersedia maka isi secara otomatis jika, nama yang tampil dalam pilahan adalah nama ruangn yang tidak di gunkan pada jadwal yang sama oleh mahasiswa lain dan mahasiswa ini. Kemudain jika di konfirmasi tentukan akan mengubah hasil.schedule.room dan hasil.schedule.roomId
        )
##13.UI pada rute "/kelola-sidang" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran dan isAdmin `true`). Tampilan akan menjadi halaman "Kelola Sidang" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent Kelola Sidang:
  - Kontainer:
    - Incon
    - kontainer
      - "Manage Sidang"
      - "Comprehensive hasil management and oversight tools"
  - Sidang Management Overview(Berisi grafik 3d berdasakan tahaoab (stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed"))
  - Card 
    - kontainer 
      - Icon
      - "Seminar Sidang Management System"
    - Search Box (by title, student name or nim)
    - Filter select by stage ( stage: "submitted" | "under-review" | "approved" | "rejected" | "in-progress" | "completed")
    - Filter select by Filed ("AES"/"NIC")
    - Kontainer (akan muncul jika koleksi sidang masih kosong('mahasiswa belum melakukan penilaian apapun))
      - Icon
      - "No Sidang Found"
      - Alert 
        - Icon
        - "Students have not submitted their proposals yet"
    - Table "Sidang Management", akan memunculkan seluruh mahasiswa yang telah memilki koleksi sidang. 
      - Kolom Stundet:
        - Nama Mahasiswa(users.name)
        - NIM (users.student.nim)
      - Kolom Title:
        - Judul Sidang (sidang.title)
        - Bidang Penelitian (users.student.researchField)
      - Kolom Supervisors:
        - S1: `{sidang.supervisors.supervisor1}
        - S2: `{sidang.supervisors.supervisor2}
      - Kolom Examiners:
        - E1: `${sidang.examainers.examiner1}`
        - E2: `${sidang.examainers.examiner2}`
      - Kolom Jadwal:
        - mm-dd-yy (dari sidang.schedule.date)
        - jam/waktu (dari sidang.schedule.time)
        - ruang (dari sidang.schedule.room)
      - Kolom Score:
        - (sidang.averageScore)
      - Kolom Status:
        - sidang.stage
      - Kolom Aksi
        - lihat sidang(under-review)(
          aksi ini selain melihat sidang, jika sidang.satge sama dengan 'submitted' akan memperbarui sidang.stage menjadi 'under-review'
        )
        - rejected(
          aksi ini hanya muncul dan dapat digunkan ketika sidang.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi dengan kolom 'pesan alasan' yang harus disi. ketika di konfirmasi maka akan mengubah sidang.stage menajdi 'rejected'
        )
        - approved(
          aksi ini hanya muncul dan dapat digunkan ketika sidang.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi untuk menyakin admin bahwa mahasiswa yang di 'approved' benar. ketika di konfirmasi maka akan mengubah sidang.stage menajdi 'approved', dan juga menambhkan users.lecturer.examinerCount sebanyak 1 kepada user dengan peran dosen yang terpilih manjadi examiner1 atau exainers2
        )
        - edit-supervisors(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input supervisor 1 dan supervisor 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam supervisor 1 dan supervisor 2 jika pada sidang.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain sidang.supervisors.superviosr1/2 maka ubah juga sidang.supervisors.superviosr1Uid/2
        )
        - edit-examiners(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input examiner 1 dan examiner 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam examiner 1 dan examiner 2 jika pada sidang.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain sidang.examiners.examiner1/2 maka ubah juga sidang.examiners.examiner1Uid/2
        )
        - edit-jadwal(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved',ketika di klik akan menampilkan modal yeng berisi inputan mm-dd-yy dan inputan waktu pm/am, jika pada sidang.schedule.date maka isi secara otomais inputan mm-dd-yy dan jika ada sidang.schedule.time maka isi inputan waktu juga. kemudian jika di konfirmasi maka akan mengubah data terakit yaitu (sidang.schedule.date dan sidang.schedule.time)
        )
        - edit-ruang(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved', ketika di klik akan menampilkan modal yang berisi selact input nama ruangan yang tersedia, jika sidang.schedule.room tersedia maka isi secara otomatis jika, nama yang tampil dalam pilahan adalah nama ruangn yang tidak di gunkan pada jadwal yang sama oleh mahasiswa lain dan mahasiswa ini. Kemudain jika di konfirmasi tentukan akan mengubah sidang.schedule.room dan sidang.schedule.roomId
        )
##14.UI pada rute "/kelola-ruang" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran dan isAdmin `true`). Tampilan akan menjadi halaman "Kelola ruang" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent Kelola Ruang:
  - Kontainer:
    - Kontainer
      - Kontainer
        - Icon
        -"Kelola Ruang"
      - "Manage academic spaces and facilities"
      - Tombol aksi "Tambah Ruang"(
        Katika di klik akan menampilakn modal dengan inputan(mengisi data yang ada di tipe ruang)
          - Nama druang
          - Seclect input tipe (    type: "Classroom" | "Laboratory" | "Auditorium" | "Meeting Room" | "Other")
          - Kapsitas
          - Availability Status cehcek box
          - Building (e.t., Main Building)
          - Floor (e.t., 2nd Floor)
          - Specific Location (e.t. Room 201)
          - Available Facilities (banyak piliah untuk mengisi  facilities: [], sperti(wi-fi, ac, camera, proyektor dan lainya tolong kamu sesuaikan))
          - deskripsi (optiaol)
      )
    - Card
      - Search box(by nama ruang)
      - Filter select (dengan piliah filter     type: "Classroom" | "Laboratory" | "Auditorium" | "Meeting Room" | "Other")
      - Filter Select ("Availabe" | "Unavailabe")
      - Jumlah informasi ruang.
    - Cards (
      Untuk manampulkan informasi secara ringkas dan spesifik dengan aksi edit dan hapus, untuk aksi edit sama menampilkan modal seperti tambah runag namum inputan sudah terisi dan terpilih berdasakan ruang yang di edit
    )

##15.UI pada rute "/kelola-nilai" (hanya bisa di akses oleh user yang sudah berhasil login, dengan data diri lengkap berdasarkan peran dan isAdmin `true`). Tampilan akan menjadi halaman "Kelola Niali" dengan Header dan Sidebar(Hanya muncul secara otomatis jika di buka pada desktop, selain itu sidebar akan muncul jika tombol open sidebar pada header di kilik), Kontent Kelola Niali:
 - Tolong rancang secara dinamis dan modren(
  Dimana di dalamnya terdapat tabel data nilai Seminar Proposal, Seminar Hasil dan Sidang Skripsi setiap STUDENT
 )

##16. Sitem pada firebase, disini saya belum tau apakah bisa di terpkan seperti yang kita tau firebase memiliki izin yang ketet sehingga saya ingin sistem ini bisa berjalan di firebase agaer memiliki kontrol penuh terhapat koleksi:
  - Jika proposal.stage sama dengan 'approved' maka lakukan pengecekan jika jadwal sudah tepat waktu maka lakukan pengecekan lagi apakah proposal.examainers dan proposal.supervisors sudah lengkap jiak sudah ubah proposal.satge menajdi "in-progress" jika tidak ubah menjadi "pending"
  - untuk hasil.satge dan sidang.sateg jika jadwal sudah tepat waktu ubah stagenya menjadi "inprogress"
  - Lalu periksa pada proposal, hasil, sidang pada ".secores" jika ke-4 nilai sudah ada lengkap maka lakukan kalkulasi untuk mendapatkan nilai rata-rata untuk mengisi averageScore di koleksi terkait.
  - Lalu jika sudah lewat dari 24 jam tapi examiners atau superviors tidak membarikan nilai maka sistem akan meberika setiap nilai examiners atau supervisors yang tdaik memberikan nilai sebanyak 35 dan feedback.{examiner1/2/supervisor1/2 yang tidak memberikan nilai}
  - "untuk setiap perubuahan data terkait harus di lakukan pengecekan agar sistem dapat memperbarui data secara cepat."


##17. Berikut adalah isi .env saya
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUEREMENT_ID

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_UPLOAD_PRESET_PROFILES
NEXT_PUBLIC_UPLOAD_PRESET_PROPOSALS
NEXT_PUBLIC_UPLOAD_PRESET_RESULTS
NEXT_PUBLIC_UPLOAD_PRESET_DEFENSES

# server-only
CLOUDINARY_CLOUD_API_KEY
CLOUDINARY_CLOUD_API_SECRET


```
- Buatkan juga file firesotre.rules(untuk rules pada firebase store) dan penganturan konfigurasi cloudinary dalam benatuk .md
- Kemudain untuk opsi 16 jika tidak memungkiankan berikan opsi penerapan backend sistem cerdas yang lebih baik
- jika ada intuksi pembuatna model 3d berikan saya prompt untuk membuatnya pada mashy ai berserta format model 3d nya.

"""
Buat menggunkan NextJs, Firebase, Cluoudinary, Tailwind, shadcn dan pendukung lainya, 
Jika ada yang kamu bingungkan tentang sistem, ui atau apapun itu tanyakn kepada saya sebelum kamu mengerjakan proyek ini,
Setelah yang kamu bingunkan jelas baru kerjakan proyek ini
""""

============== PROMPT 2 ==============

Oke bagus sekarang tolong kamu sesuaikan pada dashboard ini ketika isAdmin true tampilan defaulut adalah AdminDashboard di bagian header terdapt toggle untuk merubah AdminDashboardView menjadi StudentDashboardView jika role adalah 'student' dan LecturerDashboardView jika peran adalah 'lectuerer'.

Untuk refesensi UI AdminDashboard ini bisa kamu tinjau pada gambar yang saya kirim ini. Nah agar tidak perlu banyak halaman di seperti refersni desain maka saya ingin kamu menggunkuan komponen Tabs dari sahdcn, dimana ada beberapa tabs yaitu:
1. Tab Proposal berisi: 
    Table "Seminar Proposal Management", akan memunculkan seluruh mahasiswa yang telah memilki koleksi proposal. 
      - Kolom Stundet:
        - Nama Mahasiswa(users.name)
        - NIM (users.student.nim)
      - Kolom Title:
        - Judul Proposal (proposal.title)
        - Bidang Penelitian (users.student.researchField)
      - Kolom Supervisors:
        - S1: `{proposal.supervisors.supervisor1}
        - S2: `{proposal.supervisors.supervisor2}
      - Kolom Examiners:
        - E1: `${proposal.examainers.examiner1}`
        - E2: `${proposal.examainers.examiner2}`
      - Kolom Jadwal:
        - mm-dd-yy (dari proposal.schedule.date)
        - jam/waktu (dari proposal.schedule.time)
        - ruang (dari proposal.schedule.room)
      - Kolom Score:
        - (proposal.averageScore)
      - Kolom Status:
        - proposal.stage
      - Kolom Aksi
        - lihat proposal(under-review)(
          aksi ini selain melihat proposal, jika proposal.satge sama dengan 'submitted' akan memperbarui proposal.stage menjadi 'under-review'
        )
        - rejected(
          aksi ini hanya muncul dan dapat digunkan ketika proposal.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi dengan kolom 'pesan alasan' yang harus disi. ketika di konfirmasi maka akan mengubah proposal.stage menajdi 'rejected'
        )
        - approved(
          aksi ini hanya muncul dan dapat digunkan ketika proposal.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi untuk menyakin admin bahwa mahasiswa yang di 'approved' benar. ketika di konfirmasi maka akan mengubah proposal.stage menajdi 'approved', dan juga menambhkan users.lecturer.examinerCount sebanyak 1 kepada user dengan peran dosen yang terpilih manjadi examiner1 atau exainers2
        )
        - edit-supervisors(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input supervisor 1 dan supervisor 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam supervisor 1 dan supervisor 2 jika pada proposal.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain proposal.supervisors.superviosr1/2 maka ubah juga proposal.supervisors.superviosr1Uid/2
        )
        - edit-examiners(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input examiner 1 dan examiner 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam examiner 1 dan examiner 2 jika pada proposal.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain proposal.examiners.examiner1/2 maka ubah juga proposal.examiners.examiner1Uid/2
        )
        - edit-jadwal(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved',ketika di klik akan menampilkan modal yeng berisi inputan mm-dd-yy dan inputan waktu pm/am, jika pada proposal.schedule.date maka isi secara otomais inputan mm-dd-yy dan jika ada proposal.schedule.time maka isi inputan waktu juga. kemudian jika di konfirmasi maka akan mengubah data terakit yaitu (proposal.schedule.date dan proposal.schedule.time)
        )
        - edit-ruang(
          aksi ini hanya muncul dan dapat di gunakan ketika proposal.stage sama dengan 'approved', ketika di klik akan menampilkan modal yang berisi selact input nama ruangan yang tersedia, jika proposal.schedule.room tersedia maka isi secara otomatis jika, nama yang tampil dalam pilahan adalah nama ruangn yang tidak di gunkan pada jadwal yang sama oleh mahasiswa lain dan mahasiswa ini. Kemudain jika di konfirmasi tentukan akan mengubah proposal.schedule.room dan proposal.schedule.roomId
        )
2. Tab Hasil berisi:
    Table "Seminar Hasil Management", akan memunculkan seluruh mahasiswa yang telah memilki koleksi hasil. 
      - Kolom Stundet:
        - Nama Mahasiswa(users.name)
        - NIM (users.student.nim)
      - Kolom Title:
        - Judul Hasil (hasil.title)
        - Bidang Penelitian (users.student.researchField)
      - Kolom Supervisors:
        - S1: `{hasil.supervisors.supervisor1}
        - S2: `{hasil.supervisors.supervisor2}
      - Kolom Examiners:
        - E1: `${hasil.examainers.examiner1}`
        - E2: `${hasil.examainers.examiner2}`
      - Kolom Jadwal:
        - mm-dd-yy (dari hasil.schedule.date)
        - jam/waktu (dari hasil.schedule.time)
        - ruang (dari hasil.schedule.room)
      - Kolom Score:
        - (hasil.averageScore)
      - Kolom Status:
        - hasil.stage
      - Kolom Aksi
        - lihat hasil(under-review)(
          aksi ini selain melihat hasil, jika hasil.satge sama dengan 'submitted' akan memperbarui hasil.stage menjadi 'under-review'
        )
        - rejected(
          aksi ini hanya muncul dan dapat digunkan ketika hasil.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi dengan kolom 'pesan alasan' yang harus disi. ketika di konfirmasi maka akan mengubah hasil.stage menajdi 'rejected'
        )
        - approved(
          aksi ini hanya muncul dan dapat digunkan ketika hasil.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi untuk menyakin admin bahwa mahasiswa yang di 'approved' benar. ketika di konfirmasi maka akan mengubah hasil.stage menajdi 'approved', dan juga menambhkan users.lecturer.examinerCount sebanyak 1 kepada user dengan peran dosen yang terpilih manjadi examiner1 atau exainers2
        )
        - edit-supervisors(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input supervisor 1 dan supervisor 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam supervisor 1 dan supervisor 2 jika pada hasil.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain hasil.supervisors.superviosr1/2 maka ubah juga hasil.supervisors.superviosr1Uid/2
        )
        - edit-examiners(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input examiner 1 dan examiner 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam examiner 1 dan examiner 2 jika pada hasil.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain hasil.examiners.examiner1/2 maka ubah juga hasil.examiners.examiner1Uid/2
        )
        - edit-jadwal(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved',ketika di klik akan menampilkan modal yeng berisi inputan mm-dd-yy dan inputan waktu pm/am, jika pada hasil.schedule.date maka isi secara otomais inputan mm-dd-yy dan jika ada hasil.schedule.time maka isi inputan waktu juga. kemudian jika di konfirmasi maka akan mengubah data terakit yaitu (hasil.schedule.date dan hasil.schedule.time)
        )
        - edit-ruang(
          aksi ini hanya muncul dan dapat di gunakan ketika hasil.stage sama dengan 'approved', ketika di klik akan menampilkan modal yang berisi selact input nama ruangan yang tersedia, jika hasil.schedule.room tersedia maka isi secara otomatis jika, nama yang tampil dalam pilahan adalah nama ruangn yang tidak di gunkan pada jadwal yang sama oleh mahasiswa lain dan mahasiswa ini. Kemudain jika di konfirmasi tentukan akan mengubah hasil.schedule.room dan hasil.schedule.roomId
        )
3. Tab Sidang
    Table "Sidang Skripsi Management", akan memunculkan seluruh mahasiswa yang telah memilki koleksi sidang. 
      - Kolom Stundet:
        - Nama Mahasiswa(users.name)
        - NIM (users.student.nim)
      - Kolom Title:
        - Judul Sidang (sidang.title)
        - Bidang Penelitian (users.student.researchField)
      - Kolom Supervisors:
        - S1: `{sidang.supervisors.supervisor1}
        - S2: `{sidang.supervisors.supervisor2}
      - Kolom Examiners:
        - E1: `${sidang.examainers.examiner1}`
        - E2: `${sidang.examainers.examiner2}`
      - Kolom Jadwal:
        - mm-dd-yy (dari sidang.schedule.date)
        - jam/waktu (dari sidang.schedule.time)
        - ruang (dari sidang.schedule.room)
      - Kolom Score:
        - (sidang.averageScore)
      - Kolom Status:
        - sidang.stage
      - Kolom Aksi
        - lihat sidang(under-review)(
          aksi ini selain melihat sidang, jika sidang.satge sama dengan 'submitted' akan memperbarui sidang.stage menjadi 'under-review'
        )
        - rejected(
          aksi ini hanya muncul dan dapat digunkan ketika sidang.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi dengan kolom 'pesan alasan' yang harus disi. ketika di konfirmasi maka akan mengubah sidang.stage menajdi 'rejected'
        )
        - approved(
          aksi ini hanya muncul dan dapat digunkan ketika sidang.satge sama dengan 'under-review', ketika di klik aksi ini akan menampilkan modal konfirmasi untuk menyakin admin bahwa mahasiswa yang di 'approved' benar. ketika di konfirmasi maka akan mengubah sidang.stage menajdi 'approved', dan juga menambhkan users.lecturer.examinerCount sebanyak 1 kepada user dengan peran dosen yang terpilih manjadi examiner1 atau exainers2
        )
        - edit-supervisors(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input supervisor 1 dan supervisor 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam supervisor 1 dan supervisor 2 jika pada sidang.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain sidang.supervisors.superviosr1/2 maka ubah juga sidang.supervisors.superviosr1Uid/2
        )
        - edit-examiners(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved', ketika di klik maka akan menampilkan modal yang berisi select input examiner 1 dan examiner 2, dengan format pilihan `${users.name}, ${users.lecturer.academicTitle}`, nama dosen yang tampil hanya dosen yang tidak sedang menajdi supervisor 1 dan supervisor 2 dan examiner 1 dan examiner 2 dimahasiswa yang sama dan di jadwal yang sama di mahasiswa yang berbeda. Pilih juga secra otomatis untuk koloam examiner 1 dan examiner 2 jika pada sidang.supervisors.superviosr1/2 sudah ada, kemudian jika di konfirmasi maka akan mengubah selain sidang.examiners.examiner1/2 maka ubah juga sidang.examiners.examiner1Uid/2
        )
        - edit-jadwal(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved',ketika di klik akan menampilkan modal yeng berisi inputan mm-dd-yy dan inputan waktu pm/am, jika pada sidang.schedule.date maka isi secara otomais inputan mm-dd-yy dan jika ada sidang.schedule.time maka isi inputan waktu juga. kemudian jika di konfirmasi maka akan mengubah data terakit yaitu (sidang.schedule.date dan sidang.schedule.time)
        )
        - edit-ruang(
          aksi ini hanya muncul dan dapat di gunakan ketika sidang.stage sama dengan 'approved', ketika di klik akan menampilkan modal yang berisi selact input nama ruangan yang tersedia, jika sidang.schedule.room tersedia maka isi secara otomatis jika, nama yang tampil dalam pilahan adalah nama ruangn yang tidak di gunkan pada jadwal yang sama oleh mahasiswa lain dan mahasiswa ini. Kemudain jika di konfirmasi tentukan akan mengubah sidang.schedule.room dan sidang.schedule.roomId
        )
4. Tab Kelola Nila berisi: Dimana di dalamnya terdapat tabel data nilai Seminar Proposal(proposal), Seminar Hasil(hasil) dan Sidang Skripsi(sidang) setiap STUDENT

5. Tab Kelola Ruang berisi:
- Kontainer:
    - Kontainer
      - Kontainer
        - Icon
        -"Kelola Ruang"
      - "Manage academic spaces and facilities"
      - Tombol aksi "Tambah Ruang"(
        Katika di klik akan menampilakn modal dengan inputan(mengisi data yang ada di tipe ruang)
          - Nama druang
          - Seclect input tipe (    type: "Classroom" | "Laboratory" | "Auditorium" | "Meeting Room" | "Other")
          - Kapsitas
          - Availability Status cehcek box
          - Building (e.t., Main Building)
          - Floor (e.t., 2nd Floor)
          - Specific Location (e.t. Room 201)
          - Available Facilities (banyak piliah untuk mengisi  facilities: [], sperti(wi-fi, ac, camera, proyektor dan lainya tolong kamu sesuaikan))
          - deskripsi (optiaol)
      )
    - Card
      - Search box(by nama ruang)
      - Filter select (dengan piliah filter     type: "Classroom" | "Laboratory" | "Auditorium" | "Meeting Room" | "Other")
      - Filter Select ("Availabe" | "Unavailabe")
      - Jumlah informasi ruang.
    - Cards (
      Untuk manampulkan informasi secara ringkas dan spesifik dengan aksi edit dan hapus, untuk aksi edit sama menampilkan modal seperti tambah runag namum inputan sudah terisi dan terpilih berdasakan ruang yang di edit
    )

Dan untuk 3d model nya juga sudah ada dalam proyek nexjs saya dalam 'public/models/klip.glb' dan juga sudah ada kompoen ThreeScene.tsx yang sudah siap di gunkan ntuk mengatur 3d model itu berikut komponennya:
```tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ThreeSceneProps {
  modelPath: string;
  scale: number;
  position?: [number, number, number];
  onLoad?: () => void;
}

const disposeModel = (model: THREE.Object3D) => {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
};

export const ThreeScene = ({ modelPath, scale, position = [0, -1, 0], onLoad }: ThreeSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    model?: THREE.Object3D;
  } | null>(null);
  const animationFrameIdRef = useRef<number>();
  const basePosition = useRef(position);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Inisialisasi hanya jika belum ada
    if (!sceneRef.current) {
      const scene = new THREE.Scene();
      scene.background = null;
      const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
      camera.position.set(0, 1, 8);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      currentMount.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
      hemisphereLight.position.set(0, 20, 0);
      scene.add(hemisphereLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
      directionalLight.position.set(5, 10, 7.5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.maxPolarAngle = Math.PI / 2;
      controls.minPolarAngle = Math.PI / 3;

      sceneRef.current = { scene, camera, renderer, controls };
    }

    const { scene, camera, renderer, controls } = sceneRef.current;

    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      controls.update();
      if (sceneRef.current?.model) {
        sceneRef.current.model.rotation.y += 0.002;
        sceneRef.current.model.position.y = basePosition.current[1] + Math.sin(Date.now() * 0.001) * 0.1;
      }
      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Fungsi cleanup utama
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (sceneRef.current) {
        if (sceneRef.current.model) {
          disposeModel(sceneRef.current.model);
          scene.remove(sceneRef.current.model);
        }
        renderer.dispose();
        controls.dispose();
        if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
        }
        sceneRef.current = null;
      }
    };
  }, []);

  // Efek untuk memuat model
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;

    if (sceneRef.current.model) {
      disposeModel(sceneRef.current.model);
      scene.remove(sceneRef.current.model);
    }

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(model);
        sceneRef.current!.model = model;

        model.scale.set(scale, scale, scale);
        model.position.set(...position);
        basePosition.current = position;

        if (onLoad) onLoad();
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );
  }, [modelPath, onLoad]);

  // Efek untuk memperbarui properti
  useEffect(() => {
    if (sceneRef.current?.model) {
      sceneRef.current.model.scale.set(scale, scale, scale);
      sceneRef.current.model.position.set(...position);
      basePosition.current = position;
    }
  }, [scale, position]);

  return <div ref={mountRef} className="w-full h-full" />;
};
```


=================== Prompt 3 =============================
Baik saya telah memperbaiki Admin Dashboard Component, Room ManagementTab dan OverviewCard serkang  Halamn Admin Dashboard telah sesuai.

Sekrang saya ingin kamu membuat LecturerDshboard diaman komponen LecturerDashboard ini hampir mirip dengan AdminDashboard, untuk referensi UI dan layout bisa kamu lihat pada gambar yang saya kirim, dan berikut adalah ketentuan LecturerDashboard :
-> Komponen Kartu/Kontainer sebelah Kiri:
    -> 0. Komponen Filter
    -> 1. Tbas Proposal dengan Tbas Content:
        -> Table "Seminar Proposal", akan memunculkan seluruh mahasiswa yang proposal.examiners.examiner1Uid atau proposal.examiners.examiner2Uid atau proposal.supervisors.supervisor1Uid atau proposal.supervisors.supervisor2Uid sama dengan uid dosen(Memunculkan semua mahasiswa yang diuji atau di bimbingnya). 
              - Kolom Stundet:
                - Nama Mahasiswa(users.name)
                - NIM (users.student.nim)
              - Kolom Title:
                - Judul Proposal (proposal.title)
                - Bidang Penelitian (users.student.researchField)
              - Kolom Role:
                - (Supervisors1/Supervisors2/Examiner1/Examiners2)
              - Kolom Jadwal:
                - mm-dd-yy
                - jam
              - Kolom Ruangan:
                - (proposal.schedule.room)
              - Kolom Score:
                - (proposal.scores.(berdarkan prean dosen yang mengakses(supervisor1/2/examiner1/2)))
              - Kolom Status:
                - proposal.stage
              - Kolom Aksi
                - lihat proposal
                - evaluai(
                  aksi untuk mengubah inputan dan konten atau komponen yang ada pada 'Kartu/Kontinar -> Komponen Penilaian' sebalah kanan berdarkan Mahasiswa yang di Nilai, aksi/tombol hanya tampil dan dapat di gunkan pada saat proposal.stage sama dengan "in-progress",
                  Kemudian nilai yang di bserikan harus besar dari 0 dan kurang dari atau sama dengan 100, kemudain ketika di klik kirim maka, tampilkan modal konfirmasi agar dosen yakin dengan mahasiswa yang di berikan nilai oleh nya, dan jika sudah di lakukan penilain maka aksi ini akan hilang dan tidak dapat di gunkan lagi.
                )
    -> 2. Tbas Hasil dengan Tbas Content:
        -> Table "Seminar Hasil", akan memunculkan seluruh mahasiswa yang hasil.examiners.examiner1Uid atau hasil.examiners.examiner2Uid atau hasil.supervisors.supervisor1Uid atau hasil.supervisors.supervisor2Uid sama dengan uid dosen(Memunculkan semua mahasiswa yang diuji atau di bimbingnya). 
              - Kolom Stundet:
                - Nama Mahasiswa(users.name)
                - NIM (users.student.nim)
              - Kolom Title:
                - Judul Proposal (hasil.title)
                - Bidang Penelitian (users.student.researchField)
              - Kolom Role:
                - (Supervisors1/Supervisors2/Examiner1/Examiners2)
              - Kolom Jadwal:
                - mm-dd-yy
                - jam
              - Kolom Ruangan:
                - (hasil.schedule.room)
              - Kolom Score:
                - (hasil.scores.(berdarkan prean dosen yang mengakses(supervisor1/2/examiner1/2)))
              - Kolom Status:
                - hasil.stage
              - Kolom Aksi
                - lihat hasil
                - evaluai(
                  aksi untuk mengubah inputan dan konten atau komponen yang ada pada 'Kartu/Kontinar -> Komponen Penilaian' sebalah kanan berdarkan Mahasiswa yang di Nilai, aksi/tombol hanya tampil dan dapat di gunkan pada saat hasil.stage sama dengan "in-progress",
                  Kemudian nilai yang di bserikan harus besar dari 0 dan kurang dari atau sama dengan 100, kemudain ketika di klik kirim maka, tampilkan modal konfirmasi agar dosen yakin dengan mahasiswa yang di berikan nilai oleh nya, dan jika sudah di lakukan penilain maka aksi ini akan hilang dan tidak dapat di gunkan lagi.
                )
    -> 3. Tbas Sidang dengan Tbas Content:
        -> Table "Sidang Akhir", akan memunculkan seluruh mahasiswa yang sidang.examiners.examiner1Uid atau sidang.examiners.examiner2Uid atau sidang.supervisors.supervisor1Uid atau sidang.supervisors.supervisor2Uid sama dengan uid dosen(Memunculkan semua mahasiswa yang diuji atau di bimbingnya). 
              - Kolom Stundet:
                - Nama Mahasiswa(users.name)
                - NIM (users.student.nim)
              - Kolom Title:
                - Judul Proposal (sidang.title)
                - Bidang Penelitian (users.student.researchField)
              - Kolom Role:
                - (Supervisors1/Supervisors2/Examiner1/Examiners2)
              - Kolom Jadwal:
                - mm-dd-yy
                - jam
              - Kolom Ruangan:
                - (sidang.schedule.room)
              - Kolom Score:
                - (sidang.scores.(berdarkan prean dosen yang mengakses(supervisor1/2/examiner1/2)))
              - Kolom Status:
                - sidang.stage
              - Kolom Aksi
                - lihat sidang
                - evaluai(
                  aksi untuk mengubah inputan dan konten atau komponen yang ada pada 'Kartu/Kontinar -> Komponen Penilaian' sebalah kanan berdarkan Mahasiswa yang di Nilai, aksi/tombol hanya tampil dan dapat di gunkan pada saat sidang.stage sama dengan "in-progress",
                  Kemudian nilai yang di bserikan harus besar dari 0 dan kurang dari atau sama dengan 100, kemudain ketika di klik kirim maka, tampilkan modal konfirmasi agar dosen yakin dengan mahasiswa yang di berikan nilai oleh nya, dan jika sudah di lakukan penilain maka aksi ini akan hilang dan tidak dapat di gunkan lagi.
                )
-> Komponen Kartu/Kontainer sebelah Kanan:
  -> 0. Komponen jadwal yang menampilkan 3 jadwal berdarkan waktu/jadwal yang akan segera di lakukan, buat agar bisa di swap.
  -> Komponen penilaian utuk input nilai.
  -> Jika Masih ada sapce kosng dalam komponen kartu sebelah kanan ini gunakan 3d model 'public/models/eval.glb' 

Seperi hal nya komonen AdminDashboard untuk Kartu/kontainer untma Kana dan Kiri buat ukuranya konsisten sehingga jika ada konten yang berlbih Tabs Content lah sebagi induk scollnya.




=====================================
Dashboard -> StudeStudentDashboard -> Cari komponen Pencapaian(AchievementCard). Saya ingin kamu membuat komponen ini menjadi dinamis:
-> Ketika mahasiswa belum mengirmkan proposal maka:
  -> Tampilan akan berisi ajakan menarik dan dengan tombol "Kirim Proposal". Ketika di klik akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'proposal.stage' sama dengan 'submitted'
  -> Tampilan akan berisi pemberitahuan proposal berhasil terkirim menunggu peninjauan oleh admin.
-> Kemudian ketika 'proposal.stage' sama dengan 'under-review'
  -> Tampilan akan berisi pemberitahuan proposal berhasil terkirim menunggu persetujuan oleh admin.
-> Kemudian ketika 'proposal.stage' sama dengan 'approved'
  -> Tampilan akan berisi judul proposal, jadwal(waktu dan ruang), Pembimbing 1 dan 2 serta Penguji 1 dan 2
-> Kemudian ketika 'proposal.stage' sama dengan 'rejected'
  -> Tampilan akan berisi pemberitahuan kenapa proposal di reject 'proposal.rejectionReason', dengan tombol 'Kirim Ulang Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'proposal.stage' sama dengan 'revision'
  -> Tampilam akan berisi :
      -> nama Pembimbing 1 'proposal.supervisors.supervisors1' dan menampilkan nilai yang  di berikan Pembimbing 1'proposal.scores.supervisor1'
      -> nama Pembimbing 2 'proposal.supervisors.supervisor2' dan menampilkan nilai yang  di berikan Pembimbing 2'proposal.scores.supervisor2'
      -> nama Penguji 1 'proposal.examiners.examiner1' dan menampilkan nilai yang  di berikan Penguji 1'proposal.scores.examiner1'
      -> nama Penguji 2 'proposal.examiners.examiner2' dan menampilkan nilai yang  di berikan Penguji 2'proposal.scores.examiner2'
      -> nilai rata-rata 'hasil.averageScore' dan proposal.grade
      -> dengan tombol 'Kirim Revisi Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'proposal.stage' sama dengan 'complete'
  -> Tampilam akan berisi :
      -> nama Pembimbing 1 'proposal.supervisors.supervisors1' dan menampilkan nilai yang  di berikan Pembimbing 1'proposal.scores.supervisor1'
      -> nama Pembimbing 2 'proposal.supervisors.supervisor2' dan menampilkan nilai yang  di berikan Pembimbing 2'proposal.scores.supervisor2'
      -> nama Penguji 1 'proposal.examiners.examiner1' dan menampilkan nilai yang  di berikan Penguji 1'proposal.scores.examiner1'
      -> nama Penguji 2 'proposal.examiners.examiner2' dan menampilkan nilai yang  di berikan Penguji 2'proposal.scores.examiner2'
      -> nilai rata-rata 'hasil.averageScore' dan proposal.grade
      -> Pesan penyemangat untuk melanjutkan ke tahap seminar hasil" dengan tombol 'Kirim Hasil' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'hasil.stage' sama dengan 'submitted'
  -> Tampilan akan berisi pemberitahuan hasil berhasil terkirim menunggu peninjauan oleh admin.
-> Kemudian ketika 'hasil.stage' sama dengan 'under-review'
  -> Tampilan akan berisi pemberitahuan hasil berhasil terkirim menunggu persetujuan oleh admin.
-> Kemudian ketika 'hasil.stage' sama dengan 'approved'
  -> Tampilan akan berisi judul hasil, jadwal(waktu dan ruang), Pembimbing 1 dan 2 serta Penguji 1 dan 2
-> Kemudian ketika 'hasil.stage' sama dengan 'rejected'
  -> Tampilan akan berisi pemberitahuan kenapa hasil di reject 'hasil.rejectionReason', dengan tombol 'Kirim Ulang Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'hasil.stage' sama dengan 'complete'
  -> Tampilam akan berisi :
      -> nama Pembimbing 1 'hasil.supervisors.supervisors1' dan menampilkan nilai yang  di berikan Pembimbing 1'hasil.scores.supervisor1'
      -> nama Pembimbing 2 'hasil.supervisors.supervisor2' dan menampilkan nilai yang  di berikan Pembimbing 2'hasil.scores.supervisor2'
      -> nama Penguji 1 'hasil.examiners.examiner1' dan menampilkan nilai yang  di berikan Penguji 1'hasil.scores.examiner1'
      -> nama Penguji 2 'hasil.examiners.examiner2' dan menampilkan nilai yang  di berikan Penguji 2'hasil.scores.examiner2'
      -> nilai rata-rata 'hasil.averageScore' dan hasil.grade
      -> Pesan penyemangat untuk melanjutkan ke tahap seminar hasil" dengan tombol 'Kirim Hasil' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'sidang.stage' sama dengan 'submitted'
  -> Tampilan akan berisi pemberitahuan sidang berhasil terkirim menunggu peninjauan oleh admin.
-> Kemudian ketika 'sidang.stage' sama dengan 'under-review'
  -> Tampilan akan berisi pemberitahuan sidang berhasil terkirim menunggu persetujuan oleh admin.
-> Kemudian ketika 'sidang.stage' sama dengan 'approved'
  -> Tampilan akan berisi judul sidang, jadwal(waktu dan ruang), Pembimbing 1 dan 2 serta Penguji 1 dan 2
-> Kemudian ketika 'sidang.stage' sama dengan 'rejected'
  -> Tampilan akan berisi pemberitahuan kenapa sidang di reject 'sidang.rejectionReason', dengan tombol 'Kirim Ulang Proposal' yang memicu akan memicu 'Doalog Modal Samart File Upload'
-> Kemudian ketika 'sidang.stage' sama dengan 'complete'
  -> Tampilam akan berisi :
      -> Pesan selamat telah menyelesaikan semua tahaapan
      -> nilai rata-rata 'proposal.averageScore' dan proposal.grade
      -> nilai rata-rata 'hasil.averageScore' dan hasil.grade
      -> nilai rata-rata 'sidang.averageScore' dan sidang.grade
      -> 'sidang.finalScore

Kemudian berikut adalah ranjagan 'Dialog Modal Smart File Upload':
Ketika file di upload maka, akan melakukan pengecekan:
    -> file harus pdf dan ukuran maxsimal adalah 5MB
  Kemudian setelah valid maka sistem akan membaca file menggunkan pdfjs-dist, setelah isi file di perolah dan di normalisasi, maka isi yang sudah normal ini di akan di gunkan:
    -> fitur yang cerdas untuk mencari :
        - Judul
        - Bidang Penelitan
        - Pembimbing 1 dan 2
        - File
      Format yang ada di dalam file untuk memudahkan pencarin seperti ini:
      Judul Penelitian : Rahasia AI Mambuat Dewa AKU.
      Bidang Penenelitian: NIC
      Dosen Pembimbing 1: Rahmi Hidayati , S.Kom., M.Cs.
      Dosen Pembimbing 2: Sukar Sego, S.Kom., M.Cs.
      Mata Kuliah Pilihan :
      Catatan Ketika mencari Judul cari "Judul Penelitian : Rahasia AI Mambuat Dewa AKU.
      Bidang Penenelitian:" hilangkan Judul Penelitan : dan Juga Bidang Penelitan: maka akan mendapatkan Judul Penelitan begitun untuk data lainya. dan juga terdapat fitur pengecekan:
        -> Jika 'Dialog Modal Smart File Upload' di gunkan pada koleksi 'proposal'(Seminar Proposal) maka sistem akan mengecek:
          -> Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField))
          -> Dosen Pembimbing 1 dan 2 harus sama dengan `${uses.name}, {users.lecturer.academicTitle}
        -> Jika 'Dialog Modal Smart File Upload' di gunkan pada koleksi 'hasil' maka sistem akan mengecek:
          - Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField)),
          - Dosen Pembimbing 1 dan 2 harus sama dengan `${proposal.superviors.supervisor1/2}`
          - Tentukan examiner 1 dan 2 secara otomatis dengan:
              - mengambil examiner 1 da 2 dari koleksi 'proposal'(copy proposal.examiners ke hasil.examiners ) dengan 'uid' mahasiswa yang bersangkutan
        -> Jika 'Dialog Modal Smart File Upload' di gunkan pada koleksi 'sidang' maka sistem akan mengecek:
          - Bidang Penelitan (yang di file harus sama dengan yang sudah di lenglapi di profile(dalam koleksi users.student.researchField)),
          - Dosen Pembimbing 1 dan 2 harus sama dengan `${hasil.superviors.supervisor1/2}`
          - Tentukan examiner 1 dan 2 secara otomatis dengan:
            - mengambil examiner 1 da 2 dari koleksi 'proposal'(copy proposal.examiners ke sidang.examiners ) dengan 'uid' mahasiswa yang bersangkutan
        -> Kemudian saat di submit sediaakan API untuk menangangi:
            -> Ketika sumbit pada koleksi 'proposal':
              -> Tentukan examiner 1 dan 2 secara otomtis dan adil dengan:
                - `${users.lecturer.expertiseField}` sama dengan `${users.student.researchField}`
                - prioritaskan `${users.lecturer.examinerCount}` yang paling rendah
                - pastikan dosen yang menjadi examiner 1 atau examiner 2 tidak sama dengan dosen yang telah menjadi supervisor 1 atau supervisor 2 yang ada di dalam file.
                - Dan ambil juga uid dosen yang menjadi 'examiner 1 dan 2' sehingga data sesuai dengan tipe data koleksi 'proposal.examiners'
              -> Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
              -> Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
            -> Ketika sumbit pada koleksi 'hasil':
              -> Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
              -> Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
            -> Ketika sumbit pada koleksi 'sidang':
              -> Tentaukan jadwal otoamtis 7 hari kedapan setalah submit
              -> Tentukan ruangan dengan `${ruang.usageCount}` paling sedikit dan runagan tidak di gunakan pada waktu yang sama dengan mahasiswa lain.
