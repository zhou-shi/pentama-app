import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Hasil, Proposal, Sidang } from '@/types/user';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

/**
 * Hook kustom untuk mengambil data kemajuan tugas akhir mahasiswa secara real-time.
 * Mengambil dokumen terbaru dari koleksi proposal, hasil, dan sidang.
 */
export const useStudentProgress = () => {
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [sidang, setSidang] = useState<Sidang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Jangan lakukan apa pun jika user belum terautentikasi atau UID tidak ada
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Array untuk menyimpan fungsi unsubscribe dari setiap listener
    const unsubscribes: (() => void)[] = [];

    const collections: { name: 'proposal' | 'hasil' | 'sidang'; setter: Function }[] = [
      { name: 'proposal', setter: setProposal },
      { name: 'hasil', setter: setHasil },
      { name: 'sidang', setter: setSidang },
    ];

    setLoading(true);
    setError(null); // Reset error setiap kali query dijalankan ulang
    let initialLoads = collections.length;

    collections.forEach(({ name, setter }) => {
      try {
        const q = query(
          collection(db, name),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data() as any;
            setter({ id: querySnapshot.docs[0].id, ...docData });
          } else {
            setter(null);
          }

          initialLoads--;
          if (initialLoads === 0) {
            setLoading(false);
          }
        }, (err) => {
          console.error(`Error fetching ${name}:`, err);
          setError(err); // Set error state jika terjadi masalah
          initialLoads--;
          if (initialLoads === 0) {
            setLoading(false);
          }
        });

        unsubscribes.push(unsubscribe);
      } catch (err) {
        console.error(`Error creating query for ${name}:`, err);
        setError(err as Error);
        initialLoads--;
        if (initialLoads === 0) {
          setLoading(false);
        }
      }
    });

    // Fungsi cleanup yang akan dijalankan saat komponen di-unmount atau user berubah
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user?.uid]); // Jalankan ulang effect ini hanya jika user.uid berubah

  return { proposal, hasil, sidang, loading, error };
};
