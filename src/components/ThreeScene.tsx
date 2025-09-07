'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ThreeSceneProps {
  modelPath: string;
  scale: number;
  position?: [number, number, number];
  onLoad?: () => void;
}

const disposeModel = (model: THREE.Object3D) => {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
};

export const ThreeScene = ({ modelPath, scale, position = [0, -1, 0], onLoad }: ThreeSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    model?: THREE.Object3D;
  } | null>(null);
  const animationFrameIdRef = useRef<number>(0);
  const basePosition = useRef(position);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Inisialisasi hanya jika belum ada
    if (!sceneRef.current) {
      const scene = new THREE.Scene();
      scene.background = null;
      const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
      camera.position.set(0, 1, 8);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      currentMount.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
      hemisphereLight.position.set(0, 20, 0);
      scene.add(hemisphereLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
      directionalLight.position.set(5, 10, 7.5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.maxPolarAngle = Math.PI / 2;
      controls.minPolarAngle = Math.PI / 3;

      sceneRef.current = { scene, camera, renderer, controls };
    }

    const { scene, camera, renderer, controls } = sceneRef.current;

    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      controls.update();
      if (sceneRef.current?.model) {
        sceneRef.current.model.rotation.y += 0.002;
        sceneRef.current.model.position.y = basePosition.current[1] + Math.sin(Date.now() * 0.001) * 0.1;
      }
      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Fungsi cleanup utama
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (sceneRef.current) {
        if (sceneRef.current.model) {
          disposeModel(sceneRef.current.model);
          scene.remove(sceneRef.current.model);
        }
        renderer.dispose();
        controls.dispose();
        if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
        }
        sceneRef.current = null;
      }
    };
  }, []);

  // Efek untuk memuat model
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;

    if (sceneRef.current.model) {
      disposeModel(sceneRef.current.model);
      scene.remove(sceneRef.current.model);
    }

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(model);
        sceneRef.current!.model = model;

        model.scale.set(scale, scale, scale);
        model.position.set(...position);
        basePosition.current = position;

        if (onLoad) onLoad();
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );
  }, [modelPath, onLoad]);

  // Efek untuk memperbarui properti
  useEffect(() => {
    if (sceneRef.current?.model) {
      sceneRef.current.model.scale.set(scale, scale, scale);
      sceneRef.current.model.position.set(...position);
      basePosition.current = position;
    }
  }, [scale, position]);

  return <div ref={mountRef} className="w-full h-full" />;
};
