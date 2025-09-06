import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Mengambil kredensial dari environment variables
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Ganti escape character '\\n' dengan newline asli '\n'
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Inisialisasi Firebase Admin SDK hanya jika belum ada instance yang berjalan
// Ini untuk mencegah error saat hot-reloading di Next.js
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Ekspor instance Firestore dan Auth dari Admin SDK
const db = admin.firestore();
const auth = admin.auth();

export { auth, db };
