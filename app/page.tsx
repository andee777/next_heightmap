"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ControlPanel } from "@/components/ControlPanel";
import { HudOverlay } from "@/components/HudOverlay";
import { Header } from "@/components/Header";

// Dynamically import the 3D viewer to avoid SSR issues
const TerrainViewer = dynamic(() => import("@/components/TerrainViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-emerald-400/60 tracking-widest uppercase">
          Initializing renderer...
        </p>
      </div>
    </div>
  ),
});

export interface TerrainSettings {
  displacementScale: number;
  wireframe: boolean;
  colorMode: "topographic" | "grayscale" | "heatmap" | "arctic";
  resolution: number;
  ambientIntensity: number;
  autoRotate: boolean;
  flatShading: boolean;
  fog: boolean;
}

const defaultSettings: TerrainSettings = {
  displacementScale: 30,
  wireframe: false,
  colorMode: "topographic",
  resolution: 256,
  ambientIntensity: 0.4,
  autoRotate: false,
  flatShading: false,
  fog: true,
};

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);
  const [settings, setSettings] = useState<TerrainSettings>(defaultSettings);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleFileUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageName(file.name);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
  }, []);

  const handleReset = () => {
    setImageUrl(null);
    setImageName("");
    setImageSize(null);
    setSettings(defaultSettings);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background grid-bg">
      {/* Header */}
      <Header
        hasImage={!!imageUrl}
        imageName={imageName}
        onReset={handleReset}
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen((v) => !v)}
      />

      {/* Main content area */}
      <div className="flex w-full h-full pt-14">
        {/* 3D Viewport */}
        <div className="relative flex-1 h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {imageUrl ? (
              <motion.div
                key="viewer"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TerrainViewer imageUrl={imageUrl} settings={settings} />
                <HudOverlay
                  imageName={imageName}
                  imageSize={imageSize}
                  settings={settings}
                />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                className="w-full h-full flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <UploadDropzone onFileAccepted={handleFileUpload} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Panel */}
        <AnimatePresence>
          {isPanelOpen && imageUrl && (
            <motion.div
              key="panel"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 200 }}
              className="relative h-full"
            >
              <ControlPanel
                settings={settings}
                onChange={setSettings}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}