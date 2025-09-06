'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ExtractedPdfData } from '@/lib/pdfUtils';
import { Hasil, Proposal, Sidang } from '@/types/user';
import { AlertTriangle, FileCheck2, Loader2, UploadCloud, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface SmartFileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submissionType: 'proposal' | 'hasil' | 'sidang';
  proposalData?: Proposal | null;
  hasilData?: Hasil | null;
  sidangData?: Sidang | null;
}

export const SmartFileUploadDialog = ({ isOpen, onClose, submissionType, proposalData, hasilData, sidangData }: SmartFileUploadDialogProps) => {
  const { userProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPdfData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resetState = () => {
    setFile(null); setExtractedData(null); setIsParsing(false);
    setIsSubmitting(false); setValidationError(null); setUploadError(null);
  };
  const handleClose = () => { resetState(); onClose(); };

  const validateExtractedData = (data: ExtractedPdfData) => {
    if (!userProfile) return "Profil pengguna tidak ditemukan.";
    if (!data.title) return "Judul penelitian tidak dapat ditemukan di dalam file.";
    if (!data.researchField) return "Bidang penelitian tidak ditemukan atau tidak valid (harus NIC atau AES).";
    if (!data.supervisor1) return "Dosen Pembimbing 1 tidak dapat ditemukan.";
    if (!data.supervisor2) return "Dosen Pembimbing 2 tidak dapat ditemukan.";
    if (submissionType === 'proposal' && data.researchField !== userProfile.student?.researchField) return `Bidang penelitian di file (${data.researchField}) tidak sesuai dengan profil Anda (${userProfile.student?.researchField}).`;
    if (submissionType === 'hasil' && proposalData && data.supervisor1 !== proposalData.supervisors?.supervisor1) return `Pembimbing 1 di file tidak sesuai dengan proposal sebelumnya.`;
    if (submissionType === 'sidang' && hasilData && data.supervisor1 !== hasilData.supervisors?.supervisor1) return `Pembimbing 1 di file tidak sesuai dengan data seminar hasil.`;
    return null;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    resetState();
    setFile(selectedFile);
    if (selectedFile.type !== 'application/pdf') { setValidationError('File harus dalam format PDF.'); setFile(null); return; }
    if (selectedFile.size > 5 * 1024 * 1024) { setValidationError('Ukuran file maksimal adalah 5MB.'); setFile(null); return; }
    setIsParsing(true);
    try {
      const { processPdf } = await import('@/lib/pdfUtils');
      const data = await processPdf(selectedFile);
      setExtractedData(data);
      const error = validateExtractedData(data);
      if (error) { setValidationError(error); setExtractedData(null); }
    } catch (error) {
      console.error("PDF Parsing failed:", error);
      setValidationError('Gagal memproses file PDF. Pastikan format konten di dalam file sudah benar.');
    } finally {
      setIsParsing(false);
    }
  }, [userProfile, submissionType, proposalData, hasilData]);

  const handleSubmit = async () => {
    if (!file || !extractedData || !userProfile) return;
    setIsSubmitting(true);
    setUploadError(null); // Reset error lama sebelum submit baru
    const toastId = toast.loading("Mengirim file, mohon tunggu...");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('submissionType', submissionType);
    formData.append('uid', userProfile.uid);
    formData.append('title', extractedData.title);
    formData.append('researchField', extractedData.researchField as string);
    formData.append('supervisor1', extractedData.supervisor1);
    formData.append('supervisor2', extractedData.supervisor2);

    let isResubmission = false;
    let oldDoc: Proposal | Hasil | Sidang | null = null;
    const isRejectedOrRevision = (stage: string | undefined) => stage === 'rejected' || stage === 'revision';

    if (submissionType === 'proposal' && proposalData && isRejectedOrRevision(proposalData.stage)) { isResubmission = true; oldDoc = proposalData; }
    else if (submissionType === 'hasil' && hasilData && isRejectedOrRevision(hasilData.stage)) { isResubmission = true; oldDoc = hasilData; }
    else if (submissionType === 'sidang' && sidangData && isRejectedOrRevision(sidangData.stage)) { isResubmission = true; oldDoc = sidangData; }

    if (isResubmission && oldDoc) {
      formData.append('isResubmission', 'true');
      formData.append('oldDocId', oldDoc.id);
      if (oldDoc.cloudinaryPublicId) {
        formData.append('oldPublicId', oldDoc.cloudinaryPublicId);
      }
    }

    if (submissionType === 'hasil' && proposalData) formData.append('proposalId', proposalData.id);
    if (submissionType === 'sidang' && hasilData) formData.append('resultsId', hasilData.id);

    try {
      const response = await fetch('/api/submission', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirimkan file.');
      }
      toast.success(result.message, { id: toastId, duration: 5000 });
      handleClose();
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Submission failed:', error);
      toast.error(errorMessage, { id: toastId, duration: 5000 });
      // [PERBAIKAN] Simpan pesan error ke state agar bisa ditampilkan di UI
      setUploadError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false, disabled: isParsing || isSubmitting });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative transform transition-all">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Smart File Upload</h2>
        <p className="text-gray-500 mb-6">Untuk Seminar {submissionType.charAt(0).toUpperCase() + submissionType.slice(1)}</p>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50 hover:border-orange-400'}`}><input {...getInputProps()} /><div className="flex flex-col items-center justify-center text-gray-500"><UploadCloud size={48} className="mb-4 text-gray-400" />{isParsing ? <p>Menganalisis file...</p> : file ? <p className="font-semibold">{file.name}</p> : isDragActive ? <p>Lepaskan file di sini...</p> : <p>Seret & lepas file PDF di sini</p>}<p className="text-xs mt-2">PDF, Maksimal 5MB</p></div></div>
        {isParsing && <div className="text-center my-4 flex items-center justify-center text-orange-600"><Loader2 className="animate-spin mr-2" /><span>Membaca dan memvalidasi konten...</span></div>}
        {validationError && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start"><AlertTriangle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" /><div><p className="font-semibold">Validasi Gagal</p><p className="text-sm">{validationError}</p></div></div>}

        {/* Bagian ini tidak saya ubah karena sudah benar */}
        {extractedData && !validationError && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
            <div className="flex items-center mb-3">
              <FileCheck2 className="w-5 h-5 mr-3" />
              <p className="font-semibold">File berhasil divalidasi!</p>
            </div>
            <div className="space-y-2 text-sm pl-8 border-l-2 border-green-200 ml-2.5">
              <p><strong>Judul:</strong> {extractedData.title}</p>
              <p><strong>Bidang:</strong> {extractedData.researchField}</p>
              <p><strong>Pembimbing 1:</strong> {extractedData.supervisor1}</p>
              <p><strong>Pembimbing 2:</strong> {extractedData.supervisor2}</p>
            </div>
          </div>
        )}

        {/* Bagian ini sekarang akan berfungsi dengan benar */}
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>Batal</Button>
          <Button onClick={handleSubmit} disabled={!file || !extractedData || !!validationError || isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null} Kirim File
          </Button>
        </div>
      </Card>
    </div>
  );
};