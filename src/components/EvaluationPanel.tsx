'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import type { LecturerTask } from '@/hooks/useLecturerData';
import { Check, Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ThreeScene } from './ThreeScene';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

type EvaluationPanelProps = {
  selectedTask: LecturerTask | null;
  onEvaluationSubmit: () => void;
};

export function EvaluationPanel({ selectedTask, onEvaluationSubmit }: EvaluationPanelProps) {
  const { user } = useAuth();
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setScore('');
    setFeedback('');
  }, [selectedTask]);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setScore('');
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setScore(numValue);
    }
  };

  const handleSubmitClick = () => {
    if (score === '' || score < 0 || score > 100) {
      toast.error("Nilai harus di antara 0 dan 100.");
      return;
    }
    setIsConfirmModalOpen(true);
  }

  const handleConfirmSubmit = async () => {
    if (!selectedTask || !user || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      docId: selectedTask.id,
      collectionName: selectedTask.type, // [PERBAIKAN] Nama koleksi singular
      score: Number(score),
      feedback: feedback,
    };

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/lecturer/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'SUBMIT_EVALUATION', payload }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast.success("Penilaian berhasil dikirim!");
      setIsConfirmModalOpen(false);
      onEvaluationSubmit();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasEvaluated = selectedTask && selectedTask.scores?.[selectedTask.lecturerRoleKey] != null;
  const canEvaluate = selectedTask && selectedTask.stage === 'in-progress' && !hasEvaluated;

  if (!selectedTask) {
    return (
      <Card className="h-full flex flex-col justify-between shadow-lg">
        <CardHeader>
          <CardTitle>Panel Penilaian</CardTitle>
          <CardDescription>Pilih mahasiswa dari tabel untuk memulai penilaian.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <ThreeScene modelPath="/models/eval.glb" scale={4} position={[0, -1.5, 0]} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle>Penilaian: {selectedTask.studentName}</CardTitle>
        <CardDescription>
          {selectedTask.type.charAt(0).toUpperCase() + selectedTask.type.slice(1)} - Peran Anda: <strong>{selectedTask.lecturerRole}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <Label htmlFor="score">Nilai (0-100)</Label>
          <Input id="score" type="number" placeholder="Masukkan nilai" value={score} onChange={handleScoreChange} disabled={!canEvaluate} />
        </div>
        <div>
          <Label htmlFor="feedback">Catatan / Feedback (Opsional)</Label>
          <Textarea id="feedback" placeholder="Tuliskan catatan untuk mahasiswa..." value={feedback} onChange={(e) => setFeedback(e.target.value)} disabled={!canEvaluate} rows={8} />
        </div>
        {hasEvaluated && (
          <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm flex items-center gap-2">
            <Check size={16} /> Anda telah memberikan penilaian untuk tahap ini.
          </div>
        )}
        {selectedTask.stage !== 'in-progress' && !hasEvaluated && (
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm flex items-center gap-2">
            <Check size={16} /> Penilaian hanya bisa dilakukan saat status "In Progress".
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmitClick} disabled={!canEvaluate || score === ''}>
          <Send className="mr-2 h-4 w-4" /> Kirim Nilai
        </Button>
      </CardFooter>
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penilaian</DialogTitle>
            <DialogDescription>
              Anda akan memberikan nilai <strong>{score}</strong> untuk <strong>{selectedTask?.studentName}</strong>. Aksi ini tidak dapat diubah. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsConfirmModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Kirim Nilai'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}