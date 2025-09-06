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
  supervisor1: string // format `${users.name}, ${user.lecturer.academicTitle}`
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

export type CombinedData = (Proposal | Hasil | Sidang) & {
  studentName?: string;
  studentNim?: string;
  studentResearchField?: string;
};