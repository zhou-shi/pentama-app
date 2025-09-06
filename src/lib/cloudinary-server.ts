import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi ini hanya berjalan di server, aman dari browser.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: string;
}

/**
 * [SERVER-SIDE UPLOAD] Mengunggah file menggunakan SDK Cloudinary di server.
 */
export const uploadStreamToCloudinary = async (
  file: File,
  uploadPreset: string,
  resource_type: 'image' | 'raw' | 'auto' = 'auto',
  publicId?: string 
): Promise<CloudinaryUploadResult> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        upload_preset: uploadPreset,
        resource_type: resource_type,
        // [FIX] Gunakan nama variabel yang benar: 'publicId', BUKAN 'public_id'
        // Cloudinary SDK cukup pintar untuk mengubah 'publicId' menjadi 'public_id' saat mengirim request.
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          return reject(new Error('Upload ke Cloudinary gagal'));
        }
        if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error('Hasil unggahan dari Cloudinary tidak terdefinisi'));
        }
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * [SERVER-SIDE DELETE] Menghapus file menggunakan SDK Cloudinary di server.
 */
export const deleteFromCloudinaryServer = async (
  public_id: string,
  resource_type: 'image' | 'raw' | 'video' = 'image'
): Promise<{ result: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, { resource_type });
    console.log(`File ${public_id} berhasil dihapus dari Cloudinary.`);
    return result;
  } catch (error) {
    console.error(`Gagal menghapus file dari Cloudinary: ${public_id}`, error);
    throw error;
  }
};