import { NIMInfo } from '@/types/user'

export const academicData = {
  facultyCode: { "H": "FMIPA" },
  levelCode: {
    "0": "Diploma",
    "1": "S1",
    "2": "S2",
    "3": "S3"
  },
  programType: {
    "1": "Reguler",
    "2": "Non-Reguler"
  },
  semesterCode: {
    "1": "Ganjil",
    "2": "Genap"
  },
  fmipaProdi: {
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

export const parseNIM = (nim: string): NIMInfo | null => {
  if (!nim || nim.length !== 10) {
    return null
  }

  const facultyCode = nim.charAt(0)
  const levelCode = nim.charAt(1)
  const prodiCode = nim.substring(2, 4)
  const programTypeCode = nim.charAt(4)
  const yearCode = nim.substring(5, 7)
  const semesterCode = nim.charAt(7)

  // Validate faculty code (only H for FMIPA supported)
  if (!academicData.facultyCode[facultyCode as keyof typeof academicData.facultyCode]) {
    return null
  }

  // Validate other codes
  if (!academicData.levelCode[levelCode as keyof typeof academicData.levelCode] ||
    !academicData.fmipaProdi[prodiCode as keyof typeof academicData.fmipaProdi] ||
    !academicData.programType[programTypeCode as keyof typeof academicData.programType] ||
    !academicData.semesterCode[semesterCode as keyof typeof academicData.semesterCode]) {
    return null
  }

  const currentYear = new Date().getFullYear()
  const enrollmentYear = parseInt(yearCode) + 2000

  // Calculate current semester based on enrollment year and current date
  const yearDifference = currentYear - enrollmentYear
  const currentMonth = new Date().getMonth() + 1 // 1-12

  // Assume odd semester starts in August (month 8) and even semester starts in February (month 2)
  let currentSemesterNumber: number
  if (currentMonth >= 8) {
    // Odd semester of academic year
    currentSemesterNumber = (yearDifference * 2) + 1
  } else if (currentMonth >= 2) {
    // Even semester of academic year
    currentSemesterNumber = (yearDifference * 2) + 2
  } else {
    // January, still in odd semester of previous academic year
    currentSemesterNumber = ((yearDifference - 1) * 2) + 1
  }

  return {
    faculty: academicData.facultyCode[facultyCode as keyof typeof academicData.facultyCode],
    educationLevel: academicData.levelCode[levelCode as keyof typeof academicData.levelCode],
    studyProgram: academicData.fmipaProdi[prodiCode as keyof typeof academicData.fmipaProdi],
    programType: academicData.programType[programTypeCode as keyof typeof academicData.programType],
    enrollmentYear: enrollmentYear.toString(),
    semester: Math.max(1, currentSemesterNumber).toString()
  }
}

export const validateNIM = (nim: string): { isValid: boolean; message?: string } => {
  if (!nim) {
    return { isValid: false, message: "NIM tidak boleh kosong" }
  }

  if (nim.length !== 10) {
    return { isValid: false, message: "NIM harus terdiri dari 10 karakter" }
  }

  const facultyCode = nim.charAt(0)
  if (facultyCode !== 'H') {
    return { isValid: false, message: "Saat ini hanya mendukung fakultas FMIPA (kode H)" }
  }

  const parsedNIM = parseNIM(nim)
  if (!parsedNIM) {
    return { isValid: false, message: "Format NIM tidak valid" }
  }

  return { isValid: true }
}
