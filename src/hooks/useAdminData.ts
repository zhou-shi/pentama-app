import { db } from '@/lib/firebase';
import type { Hasil, Proposal, Ruang, Sidang, User } from '@/types/user';
import { collection, onSnapshot, query, Unsubscribe, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

// Tipe data gabungan tetap sama
export type CombinedData = (Proposal | Hasil | Sidang) & {
  studentName?: string;
  studentNim?: string;
  studentResearchField?: string;
};

export function useAdminData() {
  // State untuk menyimpan data mentah dari Firestore
  const [rawProposals, setRawProposals] = useState<(Proposal & { id: string })[]>([]);
  const [rawResults, setRawResults] = useState<(Hasil & { id: string })[]>([]);
  const [rawDefenses, setRawDefenses] = useState<(Sidang & { id: string })[]>([]);
  const [rooms, setRooms] = useState<Ruang[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // [OPTIMASI] Buat 'peta' mahasiswa menggunakan useMemo.
  // Ini akan otomatis dibuat ulang hanya jika data 'students' berubah.
  const studentMap = useMemo(() => new Map(students.map(s => [s.uid, s])), [students]);

  // [OPTIMASI] Gabungkan data submission dengan info mahasiswa menggunakan useMemo.
  // Proses penggabungan hanya akan berjalan jika data mentah submission atau data students berubah.
  const proposals = useMemo(() => rawProposals.map(doc => {
    const student = studentMap.get(doc.uid);
    return { ...doc, studentName: student?.name || 'Unknown User', studentNim: student?.student?.nim || 'No NIM', studentResearchField: student?.student?.researchField || 'N/A' };
  }), [rawProposals, studentMap]);

  const results = useMemo(() => rawResults.map(doc => {
    const student = studentMap.get(doc.uid);
    return { ...doc, studentName: student?.name || 'Unknown User', studentNim: student?.student?.nim || 'No NIM', studentResearchField: student?.student?.researchField || 'N/A' };
  }), [rawResults, studentMap]);

  const defenses = useMemo(() => rawDefenses.map(doc => {
    const student = studentMap.get(doc.uid);
    return { ...doc, studentName: student?.name || 'Unknown User', studentNim: student?.student?.nim || 'No NIM', studentResearchField: student?.student?.researchField || 'N/A' };
  }), [rawDefenses, studentMap]);

  useEffect(() => {
    const unsubscribes: Unsubscribe[] = [];

    try {
      // [OPTIMASI] Semua pengambilan data sekarang menggunakan onSnapshot untuk konsistensi real-time
      const collectionsToWatch = [
        { path: 'users', whereClause: where('role', '==', 'student'), setState: setStudents },
        { path: 'users', whereClause: where('role', '==', 'lecturer'), setState: setLecturers },
        { path: 'proposal', setState: setRawProposals },
        { path: 'hasil', setState: setRawResults },
        { path: 'sidang', setState: setRawDefenses },
        { path: 'ruang', setState: setRooms },
      ];

      collectionsToWatch.forEach(c => {
        const q = c.whereClause ? query(collection(db, c.path), c.whereClause) : query(collection(db, c.path));
        const unsubscribe = onSnapshot(q,
          (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any;
            c.setState(data);
          },
          (err) => {
            console.error(`Error fetching ${c.path}:`, err);
            setError(err);
          }
        );
        unsubscribes.push(unsubscribe);
      });

      setLoading(false);
    } catch (err) {
      console.error("Error setting up listeners:", err);
      setError(err as Error);
      setLoading(false);
    }

    // [OPTIMASI] Logika cleanup yang lebih bersih dan standar
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []); // Bergantung pada array kosong agar hanya berjalan sekali saat mount

  return { proposals, results, defenses, rooms, lecturers, students, loading, error };
}







// import { db } from '@/lib/firebase';
// import type { Hasil, Proposal, Ruang, Sidang, User } from '@/types/user';
// import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
// import { useEffect, useState } from 'react';

// // Tipe data gabungan yang menyertakan info mahasiswa di setiap data submission
// export type CombinedData = (Proposal | Hasil | Sidang) & {
//   studentName?: string;
//   studentNim?: string;
//   studentResearchField?: string;
// };

// export function useAdminData() {
//   const [proposals, setProposals] = useState<CombinedData[]>([]);
//   const [results, setResults] = useState<CombinedData[]>([]);
//   const [defenses, setDefenses] = useState<CombinedData[]>([]);
//   const [rooms, setRooms] = useState<Ruang[]>([]);
//   const [lecturers, setLecturers] = useState<User[]>([]);
//   const [students, setStudents] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         // 1. Ambil data users (students & lecturers) sekali saja karena jarang berubah
//         const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
//         const lecturersQuery = query(collection(db, 'users'), where('role', '==', 'lecturer'));

//         const [studentsSnapshot, lecturersSnapshot] = await Promise.all([
//           getDocs(studentsQuery),
//           getDocs(lecturersQuery)
//         ]);

//         const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
//         const lecturersData = lecturersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];

//         setStudents(studentsData);
//         setLecturers(lecturersData);

//         // Buat 'peta' mahasiswa untuk pencarian data yang cepat
//         const studentMap = new Map(studentsData.map(s => [s.uid, s]));

//         // 2. Fungsi helper untuk menggabungkan data submission dengan info mahasiswa
//         const combineWithStudentInfo = (docs: any[]): CombinedData[] => {
//           return docs.map(doc => {
//             const student = studentMap.get(doc.uid);
//             return {
//               ...doc,
//               studentName: student?.name || 'Unknown User',
//               studentNim: student?.student?.nim || 'No NIM',
//               studentResearchField: student?.student?.researchField || 'N/A',
//             };
//           });
//         };

//         // 3. Setup listener real-time untuk data yang sering berubah (submission & ruangan)
//         const unsubscribes = [
//           onSnapshot(query(collection(db, 'proposal')), snapshot => setProposals(combineWithStudentInfo(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))),
//           onSnapshot(query(collection(db, 'hasil')), snapshot => setResults(combineWithStudentInfo(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))),
//           onSnapshot(query(collection(db, 'sidang')), snapshot => setDefenses(combineWithStudentInfo(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))),
//           onSnapshot(query(collection(db, 'ruang')), snapshot => setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ruang[])),
//         ];

//         setLoading(false);
//         // Fungsi cleanup untuk berhenti mendengarkan perubahan saat komponen tidak lagi digunakan
//         return () => unsubscribes.forEach(unsub => unsub());

//       } catch (err) {
//         console.error("Error fetching admin data:", err);
//         setError(err as Error);
//         setLoading(false);
//       }
//     };

//     const unsubscribePromise = fetchAllData();

//     return () => {
//       unsubscribePromise.then(cleanup => {
//         if (cleanup) cleanup();
//       });
//     };
//   }, []);

//   return { proposals, results, defenses, rooms, lecturers, students, loading, error };
// }