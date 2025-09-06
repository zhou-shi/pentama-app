'use client'

import { ThreeScene } from '@/components/ThreeScene';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Suspense, useCallback, useEffect, useState } from 'react'; // Impor useCallback
import { useMediaQuery } from 'react-responsive';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.841C34.524 4.982 29.563 2.5 24 2.5C11.318 2.5 1.5 12.318 1.5 25s9.818 22.5 22.5 22.5s22.5-9.818 22.5-22.5c0-1.563-.149-3.09-.42-4.583z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.843-5.843C34.524 4.982 29.563 2.5 24 2.5C16.318 2.5 9.506 7.031 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 47.5c5.563 0 10.524-2.482 14.804-6.341l-5.843-5.843C30.842 37.846 27.059 40 24 40c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.506 42.969 16.318 47.5 24 47.5z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.843 5.843C42.922 35.618 45 30.671 45 25c0-1.563-.149-3.09-.42-4.583z" />
  </svg>
);

const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-full">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Memuat model 3D...</p>
    </div>
  </div>
);

export default function Landing() {
  const { signInWithGoogle, loading: authLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const [dynamicStyles, setDynamicStyles] = useState({
    modelScale: 4,
    cardMaxWidth: 'max-w-[95%]'
  });

  const isTablet = useMediaQuery({ query: '(min-width: 768px) and (max-width: 1023px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });

  useEffect(() => {
    setIsMounted(true);

    if (isDesktop) {
      setDynamicStyles({ modelScale: 5, cardMaxWidth: 'lg:max-w-screen-sm' });
    } else if (isTablet) {
      setDynamicStyles({ modelScale: 4.5, cardMaxWidth: 'md:max-w-[88%]' });
    } else {
      setDynamicStyles({ modelScale: 4, cardMaxWidth: 'max-w-[95%]' });
    }
  }, [isTablet, isDesktop]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  // Gunakan useCallback untuk memastikan fungsi ini tidak dibuat ulang di setiap render
  const handleModelLoad = useCallback(() => {
    setIsModelLoaded(true);
  }, []);

  const modelPosition: [number, number, number] = [0, 0.5, 0];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl" />
      </div>

      <header className="absolute top-0 left-0 w-full p-6 sm:p-8 z-30">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">P</div>
          <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">PENTAMA</span>
        </div>
      </header>

      <main className="relative flex flex-col md:flex-row items-center justify-center h-full">

        <div className="absolute inset-0 md:relative md:w-1/2 md:h-full z-10">
          {isMounted ? (
            <Suspense fallback={<LoadingIndicator />}>
              <ThreeScene
                modelPath="/models/book.glb"
                scale={dynamicStyles.modelScale}
                position={modelPosition}
                onLoad={handleModelLoad} // Gunakan fungsi yang sudah di-memoize
              />
            </Suspense>
          ) : <LoadingIndicator />}
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center z-20 p-4 md:-ml-24 lg:ml-0">
          <div className={`w-full ${dynamicStyles.cardMaxWidth} bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10`}>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Sistem Penilaian Tugas Akhir
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              PENTAMA
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Platform untuk mengelola proposal, hasil, dan sidang skripsi secara terpadu.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Manajemen proposal skripsi terintegrasi</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Penjadwalan sidang otomatis</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Monitoring progress real-time</p>
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {authLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Mengautentikasi...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Login dengan Google
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
              Manajemen Tugas Akhir Digital
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
