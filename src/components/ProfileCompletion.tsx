'use client'

import { useAuth } from '@/contexts/AuthContext'
import { generateUniquePublicId, uploadToCloudinaryClient } from '@/lib/cloudinary-client'
import { db } from '@/lib/firebase'
import { Gender, NIMInfo, ProfileFormData, ResearchField, User, UserRole } from '@/types/user'
import { parseNIM, validateNIM } from '@/utils/nimParser'
import { collection, doc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore'
import { ChevronRight, Mail, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ThreeScene } from './ThreeScene'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'

interface ProfileCompletionProps {
  onComplete: () => void
}

// Reusable Header Component
function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">P</div>
            <span className="ml-3 text-2xl font-bold text-gray-900">PENTAMA</span>
          </div>
        </div>
      </div>
    </header>
  )
}


export default function ProfileCompletion({ onComplete }: ProfileCompletionProps) {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [nimInfo, setNimInfo] = useState<NIMInfo | null>(null)
  const [showOptionalBio, setShowOptionalBio] = useState(false)
  const [model3DLoaded, setModel3DLoaded] = useState(false)

  // [FIX] Initialize state as empty first
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    gender: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    bio: '',
    role: ''
  })

  // [FIX] useEffect to reliably populate form data and photo preview when user context is ready
  useEffect(() => {
    if (user || userProfile) {
      // Set form data based on available user profile or auth user
      setFormData(prev => ({
        ...prev,
        name: userProfile?.name || user?.displayName || '',
        email: userProfile?.email || user?.email || '',
        // You can populate other fields here if they exist in userProfile
      }));

      // Set photo preview, prioritizing DB photo over auth photo.
      // Do not overwrite if a photo has been manually staged for upload (formData.profilePhoto exists)
      if (!formData.profilePhoto) {
        setPhotoPreview(userProfile?.profilePhotoUrl || user?.photoURL || '');
      }
    }
  }, [user, userProfile, formData.profilePhoto]);


  const handleInputChange = (field: keyof ProfileFormData, value: string | File) => {
    if (field === 'profilePhoto' && value instanceof File) {
      setFormData(prev => ({ ...prev, [field]: value }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(value)
    } else if (field === 'nim' && typeof value === 'string') {
      setFormData(prev => ({ ...prev, [field]: value }))

      if (value.length === 10) {
        const validation = validateNIM(value)
        if (validation.isValid) {
          const parsedInfo = parseNIM(value)
          setNimInfo(parsedInfo)
          setErrors(prev => ({ ...prev, nim: '' }))
        } else {
          setErrors(prev => ({ ...prev, nim: validation.message || '' }))
          setNimInfo(null)
        }
      } else {
        setNimInfo(null)
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value as string }))
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi'
    if (!formData.gender) newErrors.gender = 'Jenis kelamin harus dipilih'
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon harus diisi'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Tanggal lahir harus diisi'
    if (!formData.address.trim()) newErrors.address = 'Alamat harus diisi'
    if (!formData.role) newErrors.role = 'Peran harus dipilih'

    // Phone validation
    if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Nomor telepon tidak valid'
    }

    // Role-specific validation
    if (formData.role === 'student') {
      if (!formData.nim?.trim()) {
        newErrors.nim = 'NIM harus diisi'
      } else {
        const nimValidation = validateNIM(formData.nim)
        if (!nimValidation.isValid) {
          newErrors.nim = nimValidation.message || ''
        } else {
          // Check if NIM is unique
          const nimQuery = query(
            collection(db, 'users'),
            where('student.nim', '==', formData.nim)
          )
          const nimSnapshot = await getDocs(nimQuery)
          if (!nimSnapshot.empty) {
            newErrors.nim = 'NIM sudah digunakan'
          }
        }
      }
      if (!formData.researchField) {
        newErrors.researchField = 'Bidang penelitian harus dipilih'
      }
    }

    if (formData.role === 'lecturer') {
      if (formData.nidn && formData.nidn.trim()) {
        // Check if NIDN is unique
        const nidnQuery = query(
          collection(db, 'users'),
          where('lecturer.nidn', '==', formData.nidn)
        )
        const nidnSnapshot = await getDocs(nidnQuery)
        if (!nidnSnapshot.empty) {
          newErrors.nidn = 'NIDN sudah digunakan'
        }
      }
      if (!formData.expertiseField) {
        newErrors.expertiseField = 'Bidang keahlian harus dipilih'
      }
      if (!formData.position?.trim()) {
        newErrors.position = 'Posisi harus dipilih'
      }
      if (!formData.academicTitle?.trim()) {
        newErrors.academicTitle = 'Gelar akademik harus diisi'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const isValid = await validateForm()
    if (!isValid) return

    setLoading(true)
    try {
      let profilePhotoUrl = userProfile?.profilePhotoUrl || user.photoURL || ''
      let cloudinaryPublicId: string | null = userProfile?.cloudinaryPublicId || null

      // Handle profile photo upload
      if (formData.profilePhoto) {
        console.log('Should delete old photo if exists:', cloudinaryPublicId)

        // Upload new photo
        const newPublicId = generateUniquePublicId(user.uid)
        const uploadResult = await uploadToCloudinaryClient(
          formData.profilePhoto,
          process.env.NEXT_PUBLIC_UPLOAD_PRESET_PROFILES!,
          'image',
          newPublicId
        )
        profilePhotoUrl = uploadResult.secure_url
        cloudinaryPublicId = uploadResult.public_id
      }

      // Prepare user data
      const userData: Partial<User> = {
        id: user.uid,
        uid: user.uid,
        email: user.email!,
        name: formData.name,
        gender: formData.gender as Gender,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio || '',
        role: formData.role as UserRole,
        isAdmin: false,
        profilePhotoUrl,
        completedAt: Timestamp.now().toDate().toISOString(),
        createdAt: userProfile?.createdAt || Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString()
      }

      if (cloudinaryPublicId) {
        userData.cloudinaryPublicId = cloudinaryPublicId
      }

      // Add role-specific data
      if (formData.role === 'student' && formData.nim && nimInfo) {
        userData.student = {
          nim: formData.nim,
          researchField: formData.researchField as ResearchField,
          faculty: nimInfo.faculty,
          educationLevel: nimInfo.educationLevel,
          studyProgram: nimInfo.studyProgram,
          programType: nimInfo.programType,
          enrollmentYear: nimInfo.enrollmentYear,
          semester: nimInfo.semester
        }
      }

      if (formData.role === 'lecturer') {
        userData.lecturer = {
          nidn: formData.nidn || '',
          expertiseField: formData.expertiseField as ResearchField,
          position: formData.position!,
          academicTitle: formData.academicTitle!,
          examinerCount: 0
        }
      }

      await setDoc(doc(db, 'users', user.uid), userData, { merge: true })

      updateUserProfile(userData as User)

      onComplete()
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrors({ submit: 'Gagal menyimpan profil. Silakan coba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0]
    }
    return name[0]
  }

  return (
    // [FIX] Layout diubah menjadi flexbox full-height
    <div className="h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      {/* [FIX] Kontainer utama sekarang akan mengisi sisa ruang dan mengelola overflow */}
      <main className="flex-grow flex flex-col lg:flex-row gap-8 max-w-7xl w-full mx-auto p-4 lg:p-8 min-h-0 max-h-screen overflow-y-hidden">
        {/* Left Column - Form */}
        {/* [FIX] Kolom ini sekarang akan meneruskan batasan tinggi ke kartu */}
        <div className="lg:w-3/5 flex flex-col min-h-1/2">
          {/* [FIX] Kartu diubah menjadi kontainer flexbox, properti tinggi eksplisit dihapus untuk membiarkan flexbox mengaturnya */}
          <Card className="shadow-lg rounded-2xl flex-grow flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-2xl font-bold text-center">Lengkapi Profil</CardTitle>
            </CardHeader>
            {/* [FIX] Konten kartu sekarang menjadi area yang bisa di-scroll */}
            <CardContent className="flex-grow overflow-y-auto p-6 scrollbar-hide">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nama */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nama lengkap"
                      />
                      {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Jenis Kelamin */}
                    <div className="space-y-2">
                      <Label htmlFor="gender">Jenis Kelamin</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                          <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
                    </div>

                    {/* Nomor Telepon */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="08123456789"
                      />
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>}
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Alamat lengkap"
                    />
                    {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                  </div>

                  {/* Biodata */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biodata (Opsional)</Label>
                    <Select
                      value={showOptionalBio ? 'custom' : 'hide_bio'}
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setShowOptionalBio(true)
                        } else {
                          setShowOptionalBio(false)
                          handleInputChange('bio', '')
                        }
                      }}
                    >
                      <SelectTrigger id="bio">
                        <SelectValue placeholder="Pilih untuk menambahkan biodata" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hide_bio">Tidak mengisi biodata</SelectItem>
                        <SelectItem value="custom">Tambah Biodata</SelectItem>
                      </SelectContent>
                    </Select>
                    {showOptionalBio && (
                      <Textarea
                        value={formData.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Ceritakan tentang diri Anda..."
                        rows={3}
                      />
                    )}
                  </div>
                </div>

                {/* Peran Section */}
                <div className="border-t pt-4 space-y-4">
                  <Label>Peran</Label>

                  <RadioGroup value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="student" id="student" />
                      <label htmlFor="student" className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="font-medium">Mahasiswa</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="lecturer" id="lecturer" />
                      <label htmlFor="lecturer" className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">Dosen</span>
                      </label>
                    </div>
                  </RadioGroup>
                  {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}

                  {/* Student Fields */}
                  {formData.role === 'student' && (
                    <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="nim">NIM</Label>
                        <Input
                          id="nim"
                          value={formData.nim || ''}
                          onChange={(e) => handleInputChange('nim', e.target.value.toUpperCase())}
                          placeholder="H1051211028"
                          maxLength={10}
                        />
                        {errors.nim && <p className="text-red-500 text-xs">{errors.nim}</p>}

                        {nimInfo && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                            <div className="grid grid-cols-2 gap-1">
                              <span>Fakultas: {nimInfo.faculty}</span>
                              <span>Jenjang: {nimInfo.educationLevel}</span>
                              <span>Prodi: {nimInfo.studyProgram}</span>
                              <span>Tahun: {nimInfo.enrollmentYear}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="researchField">Bidang Keahlian</Label>
                        <Select value={formData.researchField || ''} onValueChange={(value) => handleInputChange('researchField', value)}>
                          <SelectTrigger id="researchField">
                            <SelectValue placeholder="Pilih bidang keahlian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NIC">NIC</SelectItem>
                            <SelectItem value="AES">AES</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.researchField && <p className="text-red-500 text-xs">{errors.researchField}</p>}
                      </div>
                    </div>
                  )}

                  {/* Lecturer Fields */}
                  {formData.role === 'lecturer' && (
                    <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="nidn">NID (Opsional)</Label>
                        <Input
                          id="nidn"
                          value={formData.nidn || ''}
                          onChange={(e) => handleInputChange('nidn', e.target.value)}
                          placeholder="NID (Opsional)"
                        />
                        {errors.nidn && <p className="text-red-500 text-xs">{errors.nidn}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expertiseField">Bidang Keahlian</Label>
                        <Select value={formData.expertiseField || ''} onValueChange={(value) => handleInputChange('expertiseField', value)}>
                          <SelectTrigger id="expertiseField">
                            <SelectValue placeholder="Pilih bidang keahlian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NIC">NIC</SelectItem>
                            <SelectItem value="AES">AES</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.expertiseField && <p className="text-red-500 text-xs">{errors.expertiseField}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Posisi</Label>
                        <Select value={formData.position || ''} onValueChange={(value) => handleInputChange('position', value)}>
                          <SelectTrigger id="position">
                            <SelectValue placeholder="Pilih posisi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tenaga Pengajar">Tenaga Pengajar</SelectItem>
                            <SelectItem value="Lektor">Lektor</SelectItem>
                            <SelectItem value="Asisten Ahli">Asisten Ahli</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="academicTitle">Gelar Akademik</Label>
                        <Input
                          id="academicTitle"
                          value={formData.academicTitle || ''}
                          onChange={(e) => handleInputChange('academicTitle', e.target.value)}
                          placeholder="e.g., S.H., LL.M., Ph.D."
                        />
                        {errors.academicTitle && <p className="text-red-500 text-xs">{errors.academicTitle}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan & Lanjut</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Foto Profil Card */}
        <div className="lg:w-2/5">
          <div className="sticky top-24">
            <Card className="bg-orange-50 relative overflow-hidden rounded-2xl shadow-lg min-h-[5vh] max-h-[35vh] md:max-h-screen">
              {/* 3D Model as background */}
              <div className="absolute -bottom-16 -right-20 w-80 h-80 opacity-80">
                {!model3DLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading 3D Model...</p>
                    </div>
                  </div>
                )}
                <ThreeScene
                  modelPath="/models/complete-profile.glb"
                  scale={3.5}
                  position={[0, -1.3, 0]}
                  onLoad={() => setModel3DLoaded(true)}
                />
              </div>

              {/* Content on top of 3D model */}
              <CardHeader className="relative z-10">
                <CardTitle>Foto Profil</CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4 overflow-y-auto scrollbar-hide">
                {/* Avatar and Upload Button */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white shadow-lg">
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <span className="text-2xl font-bold">
                          {formData.name ? getInitials(formData.name).toUpperCase() : 'Z'}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white"
                    asChild
                  >
                    <label className="cursor-pointer">
                      <span>Unggah Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleInputChange('profilePhoto', file)
                        }}
                      />
                    </label>
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-800 font-medium">
                    Gunakan foto Google jika tidak diisi.
                  </p>
                  <p className="text-xs text-gray-500">• jpg/png, max 2MB</p>
                </div>

                {/* User Name and Title */}
                <div className="pt-4">
                  <p className="font-bold text-lg">
                    {formData.role === 'lecturer' && formData.academicTitle
                      ? `${formData.name}, ${formData.academicTitle}`
                      : formData.name}
                  </p>
                </div>


                {/* Role-specific Info Section */}
                {formData.role === 'lecturer' && (
                  <div className="pt-6 border-t border-orange-100">
                    <h4 className="font-semibold mb-3">Dosen</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">NID (Opsional)</p>
                        <p className="font-medium">{formData.nidn || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Posisi</p>
                        <p className="font-medium">{formData.position || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Bidang Keahlian</p>
                        <p className="font-medium">
                          {formData.expertiseField || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'student' && nimInfo && (
                  <div className="pt-6 border-t border-orange-100">
                    <h4 className="font-semibold mb-3">Mahasiswa</h4>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-gray-500 text-xs">Fakultas</p>
                          <p className="font-medium">{nimInfo.faculty}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Jenjang</p>
                          <p className="font-medium">{nimInfo.educationLevel}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Prodi</p>
                          <p className="font-medium text-xs">{nimInfo.studyProgram}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Tahun</p>
                          <p className="font-medium">{nimInfo.enrollmentYear}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Semester</p>
                          <p className="font-medium">{nimInfo.semester}</p>
                        </div>
                      </div>
                      {formData.researchField && (
                        <div>
                          <p className="text-gray-500 text-xs">Bidang Penelitian</p>
                          <p className="font-medium">
                            {formData.researchField === 'NIC' ? 'Network and Internet Computing' : 'Advanced Engineering and Sciences'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

