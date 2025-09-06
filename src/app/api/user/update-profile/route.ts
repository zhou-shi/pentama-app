import { deleteFromCloudinaryServer, uploadStreamToCloudinary } from '@/lib/cloudinary-server';
import { auth, db } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Verifikasi Token Pengguna
    const idToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid } = decodedToken;

    // 2. Parse FormData TERLEBIH DAHULU
    const formData = await req.formData();

    const updateData: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        updateData[key] = value;
      }
    }
    const profilePhoto = formData.get('profilePhoto') as File | null;

    // 3. Lakukan Validasi Server-Side setelah data di-parse
    const checkResponse = await fetch(new URL('/api/user/edit-check', req.url), {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!checkResponse.ok) throw new Error('Gagal melakukan validasi izin edit.');
    const { canEditExpertise, canEditResearchField } = await checkResponse.json();

    if (updateData['lecturer.expertiseField'] && !canEditExpertise) {
      return NextResponse.json({ error: 'Anda tidak dapat mengubah bidang keahlian saat ini.' }, { status: 403 });
    }
    if (updateData['student.researchField'] && !canEditResearchField) {
      return NextResponse.json({ error: 'Anda tidak dapat mengubah bidang riset saat ini.' }, { status: 403 });
    }

    // 4. Handle Upload Foto Profil jika ada
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();

    if (profilePhoto && profilePhoto.size > 0) {
      const allowedTypes = ['image/png', 'image/jpeg'];
      const maxSize = 3 * 1024 * 1024; // 3MB

      if (!allowedTypes.includes(profilePhoto.type)) {
        return NextResponse.json({ error: 'Tipe file tidak valid. Hanya PNG atau JPG yang diizinkan.' }, { status: 400 });
      }
      if (profilePhoto.size > maxSize) {
        return NextResponse.json({ error: 'Ukuran file melebihi batas maksimal 3MB.' }, { status: 400 });
      }

      if (userData?.cloudinaryPublicId) {
        await deleteFromCloudinaryServer(userData.cloudinaryPublicId, 'image');
      }
      const result = await uploadStreamToCloudinary(
        profilePhoto,
        process.env.NEXT_PUBLIC_UPLOAD_PRESET_PROFILES!,
        'image',
        `user_profiles/${uid}_${Date.now()}`
      );
      updateData.profilePhotoUrl = result.secure_url;
      updateData.cloudinaryPublicId = result.public_id;
    }

    // 5. Update Dokumen di Firestore
    updateData.updatedAt = new Date().toISOString();
    await userRef.update(updateData);

    const updatedUserDoc = await userRef.get();

    return NextResponse.json({ message: 'Profil berhasil diperbarui!', user: updatedUserDoc.data() }, { status: 200 });

  } catch (error: any) {
    console.error('[Update Profile API Error]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}