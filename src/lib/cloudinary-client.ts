// Tipe data ini aman untuk digunakan di klien dan server.
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: string;
}

/**
 * [CLIENT-SIDE UPLOAD] Fungsi ini HANYA untuk unggahan dari browser
 * yang tidak memerlukan tanda tangan (unsigned), seperti foto profil.
 */
export const uploadToCloudinaryClient = async (
  file: File,
  uploadPreset: string,
  resource_type: 'image' | 'raw' | 'auto' = 'image',
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (publicId) {
    formData.append('public_id', publicId);
  }

  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`;

  const response = await fetch(url, { method: 'POST', body: formData });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Upload to Cloudinary failed');
  }
  return response.json();
};

export const generateUniquePublicId = (userId: string, prefix: string = 'file'): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${userId}/${timestamp}_${randomSuffix}`;
};

/**
 * [CLIENT-SIDE DELETE] Fungsi ini memanggil API route kita yang aman untuk menghapus file.
 */
export const deleteFromCloudinaryClient = async (
  public_id: string,
  resource_type: 'image' | 'raw' | 'video' = 'image'
): Promise<void> => {
  try {
    const response = await fetch('/api/delete-cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id, resource_type }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal menghapus file.');
    }
    console.log('Permintaan hapus file berhasil dikirim ke server.');
  } catch (error) {
    console.error('Error saat memanggil API penghapusan:', error);
    throw error;
  }
};







// // Tipe data ini aman untuk digunakan di klien dan server.
// export interface CloudinaryUploadResult {
//   public_id: string;
//   secure_url: string;
//   width?: number;
//   height?: number;
//   bytes: number;
//   resource_type: string;
// }

// /**
//  * Fungsi ini HANYA untuk unggahan dari SISI KLIEN yang tidak memerlukan
//  * tanda tangan (unsigned), seperti foto profil.
//  */
// export const uploadToCloudinary = async (
//   file: File,
//   uploadPreset: string,
//   resource_type: 'image' | 'raw' | 'auto' = 'image',
//   publicId?: string
// ): Promise<CloudinaryUploadResult> => {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('upload_preset', uploadPreset);
//   if (publicId) {
//     formData.append('public_id', publicId);
//   }

//   const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`;

//   const response = await fetch(url, { method: 'POST', body: formData });

//   if (!response.ok) {
//     const errorData = await response.json();
//     console.error("Cloudinary upload failed:", errorData);
//     throw new Error('Upload to Cloudinary failed');
//   }
//   return response.json();
// };

// export const generateUniquePublicId = (userId: string, prefix: string = 'file'): string => {
//   const timestamp = Date.now();
//   const randomSuffix = Math.random().toString(36).substring(2, 8);
//   return `${prefix}/${userId}/${timestamp}_${randomSuffix}`;
// };

// /**
//  * Fungsi ini memanggil API route kita yang aman untuk menghapus file.
//  * Ini aman untuk dipanggil dari klien mana pun.
//  */
// export const deleteFromCloudinary = async (
//   public_id: string,
//   resource_type: 'image' | 'raw' | 'video' = 'image'
// ): Promise<void> => {
//   try {
//     const response = await fetch('/api/delete-cloudinary', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ public_id, resource_type }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Gagal menghapus file.');
//     }
//     console.log('Permintaan hapus file berhasil dikirim ke server.');
//   } catch (error) {
//     console.error('Error saat memanggil API penghapusan:', error);
//     throw error;
//   }
// };








// export interface CloudinaryUploadResult {
//   public_id: string;
//   secure_url: string;
//   width?: number;
//   height?: number;
//   bytes: number;
//   resource_type: string;
// }

// /**
//  * [DIUBAH] Fungsi universal untuk mengunggah file ke Cloudinary.
//  * @param file File yang akan diunggah.
//  * @param uploadPreset Preset unggahan dari Cloudinary.
//  * @param resource_type Tipe file: 'image' (default) atau 'raw' untuk PDF/dokumen.
//  * @param publicId ID publik kustom jika diperlukan.
//  * @returns Promise yang berisi hasil unggahan.
//  */
// export const uploadToCloudinary = async (
//   file: File,
//   uploadPreset: string,
//   resource_type: 'image' | 'raw' | 'auto' = 'image', // Default ke 'image'
//   publicId?: string
// ): Promise<CloudinaryUploadResult> => {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('upload_preset', uploadPreset);

//   if (publicId) {
//     formData.append('public_id', publicId);
//   }

//   // [FIX] URL endpoint sekarang dinamis berdasarkan resource_type
//   const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`;

//   const response = await fetch(url, {
//     method: 'POST',
//     body: formData,
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     console.error("Cloudinary upload failed:", errorData);
//     throw new Error('Upload to Cloudinary failed');
//   }

//   return response.json();
// };

// export const generateUniquePublicId = (userId: string, prefix: string = 'file'): string => {
//   const timestamp = Date.now();
//   const randomSuffix = Math.random().toString(36).substring(2, 8);
//   return `${prefix}/${userId}/${timestamp}_${randomSuffix}`;
// };

// // Fungsi ini akan memanggil API route yang aman
// export const deleteFromCloudinary = async (
//   public_id: string,
//   resource_type: 'image' | 'raw' | 'video' = 'image'
// ): Promise<void> => {
//   try {
//     const response = await fetch('/api/delete-cloudinary', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ public_id, resource_type }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Gagal menghapus file.');
//     }
//     console.log('File berhasil diminta untuk dihapus melalui server.');
//   } catch (error) {
//     console.error('Error saat memanggil API penghapusan:', error);
//     throw error;
//   }
// };




// export interface CloudinaryUploadResult {
//   public_id: string
//   secure_url: string
//   width: number
//   height: number
//   bytes: number
// }


// export const uploadToCloudinary = async (
//   file: File,
//   uploadPreset: string,
//   publicId?: string
// ): Promise<CloudinaryUploadResult> => {
//   const formData = new FormData()
//   formData.append('file', file)
//   formData.append('upload_preset', uploadPreset)

//   if (publicId) {
//     formData.append('public_id', publicId)
//   }

//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//     {
//       method: 'POST',
//       body: formData
//     }
//   )

//   if (!response.ok) {
//     throw new Error('Upload failed')
//   }

//   return response.json()
// }

// export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
//   // This would typically be done server-side for security
//   // For now, we'll implement a simple client-side approach
//   // In production, you should create an API route to handle this
//   const timestamp = Math.round((new Date).getTime() / 1000)
//   const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_CLOUD_API_SECRET}`

//   // Note: This requires server-side implementation for security
//   console.warn('Delete operation should be implemented server-side')
// }

// export const generateUniquePublicId = (userId: string, prefix: string = 'profile'): string => {
//   const timestamp = Date.now()
//   return `${prefix}_${userId}_${timestamp}`
// }
