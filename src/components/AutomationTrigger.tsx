'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { Loader2, Lock, Zap, ZapOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const AUTOMATION_STATUS_DOC = doc(db, 'sistem', 'status_otomatisasi');

export function AutomationTrigger() {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activatedBy, setActivatedBy] = useState('');

  // Ref untuk menyimpan ID interval agar bisa di-clear
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fungsi untuk memanggil API
  const runAutomation = async () => {
    if (!auth.currentUser) {
      toast.error("Sesi Anda berakhir, harap login kembali.");
      handleDeactivate();
      return;
    }

    console.log("Running automation task...");
    const token = await auth.currentUser.getIdToken();
    try {
      const response = await fetch('/api/admin/run-automation', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      toast.info(result.message);
    } catch (error) {
      toast.error(`Gagal menjalankan otomatisasi: ${(error as Error).message}`);
    }
  };

  // Efek untuk mendengarkan status dari Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(AUTOMATION_STATUS_DOC, (doc) => {
      setIsLoading(false);
      if (doc.exists()) {
        const data = doc.data();
        const isCurrentlyActive = data.isActive;
        const activator = data.activatedBy;

        // Cek apakah terkunci oleh admin lain
        if (isCurrentlyActive && activator !== userProfile?.name) {
          setIsLocked(true);
          setActivatedBy(activator);
          setIsActive(false); // Pastikan sesi ini tidak aktif
        } else {
          setIsLocked(false);
          setActivatedBy(isCurrentlyActive ? activator : '');
          setIsActive(isCurrentlyActive);
        }
      } else {
        setIsLoading(false);
        setIsLocked(false);
        setIsActive(false);
      }
    });
    return () => unsubscribe();
  }, [userProfile?.name]);

  // Efek untuk mengelola interval
  useEffect(() => {
    if (isActive && !isLocked) {
      // Jalankan sekali saat diaktifkan
      runAutomation();
      // Set interval untuk berjalan setiap 2 menit
      intervalRef.current = setInterval(runAutomation, 120000); // 120000 ms = 2 menit
    }

    // Fungsi cleanup untuk membersihkan interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isLocked]);

  const handleActivate = async () => {
    if (!userProfile?.name) return;
    await setDoc(AUTOMATION_STATUS_DOC, {
      isActive: true,
      activatedBy: userProfile.name,
      lastUpdate: serverTimestamp()
    });
  };

  const handleDeactivate = async () => {
    await setDoc(AUTOMATION_STATUS_DOC, {
      isActive: false,
      activatedBy: null,
      lastUpdate: serverTimestamp()
    });
  };

  if (isLoading) {
    return <Button variant="outline" size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memuat Status</Button>;
  }

  if (isLocked) {
    return <Button variant="outline" size="sm" disabled><Lock className="mr-2 h-4 w-4" />Aktif oleh {activatedBy}</Button>;
  }

  if (isActive) {
    return <Button variant="destructive" size="sm" onClick={handleDeactivate}><ZapOff className="mr-2 h-4 w-4" />Nonaktifkan</Button>;
  }

  return <Button variant="outline" size="sm" onClick={handleActivate}><Zap className="mr-2 h-4 w-4" />Aktifkan</Button>;
}