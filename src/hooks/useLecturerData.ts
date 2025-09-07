'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import type { Hasil, Proposal, Scores, Sidang, User } from '@/types/user';
import { collection, getDocs, onSnapshot, or, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export type LecturerTask = (Proposal | Hasil | Sidang) & {
  studentName?: string;
  studentNim?: string;
  studentResearchField?: string;
  lecturerRole: 'Pembimbing 1' | 'Pembimbing 2' | 'Penguji 1' | 'Penguji 2';
  lecturerRoleKey: keyof Scores; // Untuk akses skor yg lebih mudah
  type: 'proposal' | 'hasil' | 'sidang';
};

export function useLecturerData() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<LecturerTask[]>([]);
  const [students, setStudents] = useState<Map<string, User>>(new Map()); // Gunakan Map untuk performa
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const snapshot = await getDocs(studentsQuery);
        const studentMap = new Map<string, User>();
        snapshot.docs.forEach(doc => {
          const data = doc.data() as User;
          studentMap.set(data.uid, { ...data });
        });
        setStudents(studentMap);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err as Error);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!user || students.size === 0) {
      if (!user) setLoading(false);
      return;
    }

    const uid = user.uid;
    // [PERBAIKAN] Nama koleksi diubah ke singular
    const collectionsToQuery: Array<'proposal' | 'hasil' | 'sidang'> = ['proposal', 'hasil', 'sidang'];

    const unsubscribes = collectionsToQuery.map((collectionName) => {
      const q = query(
        collection(db, collectionName),
        or(
          where('supervisors.supervisor1Uid', '==', uid),
          where('supervisors.supervisor2Uid', '==', uid),
          where('examiners.examiner1Uid', '==', uid),
          where('examiners.examiner2Uid', '==', uid)
        )
      );

      return onSnapshot(q, (snapshot) => {
        const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as (Proposal | Hasil | Sidang)));
        setTasks(prevTasks => {
          const otherTasks = prevTasks.filter(task => task.type !== collectionName);
          const newTasks = docsData.map(doc => {
            let lecturerRole: LecturerTask['lecturerRole'] = 'Penguji 1';
            let lecturerRoleKey: LecturerTask['lecturerRoleKey'] = 'examiner1';
            if (doc.supervisors?.supervisor1Uid === uid) { lecturerRole = 'Pembimbing 1'; lecturerRoleKey = 'supervisor1'; }
            else if (doc.supervisors?.supervisor2Uid === uid) { lecturerRole = 'Pembimbing 2'; lecturerRoleKey = 'supervisor2'; }
            else if (doc.examiners?.examiner1Uid === uid) { lecturerRole = 'Penguji 1'; lecturerRoleKey = 'examiner1'; }
            else if (doc.examiners?.examiner2Uid === uid) { lecturerRole = 'Penguji 2'; lecturerRoleKey = 'examiner2'; }

            const student = students.get(doc.uid);

            return {
              ...doc,
              studentName: student?.name,
              studentNim: student?.student?.nim,
              studentResearchField: student?.student?.researchField,
              lecturerRole,
              lecturerRoleKey,
              type: collectionName,
            };
          });
          return [...otherTasks, ...newTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        });
        setLoading(false);
      }, (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, students]);

  return { tasks, loading, error };
}