import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Konfigurasi Cloudinary dengan kredensial dari environment variables
// Kredensial ini SANGAT RAHASIA dan hanya boleh ada di server.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY, // Gunakan CLOUDINARY_API_KEY, bukan yang publik
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { public_id, resource_type = 'image' } = body;

    // 1. Validasi Input
    // Pastikan public_id dikirim dari klien
    if (!public_id) {
      return NextResponse.json(
        { message: 'Error: public_id tidak ditemukan.' },
        { status: 400 }
      );
    }

    // 2. Panggil API Cloudinary untuk Menghapus
    // Menggunakan `uploader.destroy` untuk menghapus aset
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type, // Tentukan tipe: 'image', 'raw', atau 'video'
    });

    // 3. Kirim Respons Berdasarkan Hasil
    // Jika hasil dari Cloudinary adalah 'ok', berarti berhasil.
    if (result.result === 'ok') {
      return NextResponse.json(
        { message: 'File berhasil dihapus.' },
        { status: 200 }
      );
    } else {
      // Jika Cloudinary mengembalikan status lain (misal: 'not found')
      return NextResponse.json(
        { message: 'Gagal menghapus file dari Cloudinary.', details: result },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error saat menghapus file Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json(
      { message: 'Internal Server Error', error: errorMessage },
      { status: 500 }
    );
  }
}