"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, ChevronRight } from "lucide-react";

interface UploadDropzoneProps {
  onFileAccepted: (file: File) => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/tiff", "image/bmp"];

export function UploadDropzone({ onFileAccepted }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(png|jpg|jpeg|webp|tiff|bmp|raw|r16|r32)$/i)) {
      setError("Unsupported format. Use PNG, JPEG, WebP, TIFF, or BMP.");
      return;
    }
    onFileAccepted(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="relative w-full max-w-xl px-6">
      {/* Main dropzone */}
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        animate={{
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`
          relative cursor-pointer select-none overflow-hidden rounded-xl
          border border-border bg-card
          transition-all duration-200
          ${isDragging ? "drop-zone-active border-emerald-400/60" : "hover:border-border/80 hover:bg-card/80"}
        `}
      >
        {/* Corner decorations */}
        {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-3 h-3 border-emerald-400/40 ${
              i === 0 ? "border-t border-l" :
              i === 1 ? "border-t border-r" :
              i === 2 ? "border-b border-l" :
              "border-b border-r"
            }`}
          />
        ))}

        {/* Content */}
        <div className="relative flex flex-col items-center gap-8 px-12 py-14">
          {/* Icon */}
          <div className="relative">
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-emerald-400/5 rounded-full border border-emerald-400/20 animate-pulse-glow" />
              <div className="absolute inset-3 bg-emerald-400/5 rounded-full border border-emerald-400/10" />
              <AnimatePresence mode="wait">
                {isDragging ? (
                  <motion.div
                    key="drop"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <ImageIcon className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Upload className="w-8 h-8 text-emerald-400/70" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <h2 className="font-display text-2xl text-foreground">
              {isDragging ? "Drop to visualize" : "Upload Heightmap"}
            </h2>
            <p className="font-mono text-xs text-muted-foreground tracking-wider leading-relaxed">
              DRAG & DROP OR CLICK TO BROWSE<br />
              PNG · JPG · WEBP · TIFF · BMP
            </p>
          </div>

          {/* Browse button */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-mono text-xs tracking-wider group hover:bg-emerald-400/20 transition-colors">
            BROWSE FILES
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-400/5 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center font-mono text-xs text-red-400/80"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Example hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 text-center font-mono text-xs text-muted-foreground/40 tracking-wider"
      >
        GRAYSCALE IMAGES — LIGHTER = HIGHER ELEVATION
      </motion.p>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp,.tiff,.tif,.bmp"
        onChange={onInputChange}
      />
    </div>
  );
}