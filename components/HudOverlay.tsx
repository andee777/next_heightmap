"use client";

import { motion } from "framer-motion";
import { TerrainSettings } from "@/app/page";

interface HudOverlayProps {
  imageName: string;
  imageSize: { w: number; h: number } | null;
  settings: TerrainSettings;
}

export function HudOverlay({ imageName, imageSize, settings }: HudOverlayProps) {
  return (
    <>
      {/* Bottom-left info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-5 left-5 space-y-1 pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-emerald-400/80 tracking-wider">
            {imageName}
          </span>
        </div>
        {imageSize && (
          <p className="font-mono text-xs text-muted-foreground/50 pl-3.5">
            {imageSize.w} × {imageSize.h}px
          </p>
        )}
      </motion.div>

      {/* Bottom-right active settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-5 right-5 flex gap-2 pointer-events-none"
      >
        {settings.wireframe && (
          <span className="px-2 py-1 font-mono text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded">
            WIRE
          </span>
        )}
        {settings.autoRotate && (
          <span className="px-2 py-1 font-mono text-xs text-sky-400/80 bg-sky-400/10 border border-sky-400/20 rounded">
            AUTO
          </span>
        )}
        <span className="px-2 py-1 font-mono text-xs text-muted-foreground/50 bg-secondary/50 border border-border/30 rounded">
          {settings.resolution}²
        </span>
        <span className="px-2 py-1 font-mono text-xs text-muted-foreground/50 bg-secondary/50 border border-border/30 rounded uppercase">
          {settings.colorMode}
        </span>
      </motion.div>

      {/* Top-right crosshair decoration */}
      <div className="absolute top-5 right-5 w-8 h-8 pointer-events-none opacity-20">
        <div className="absolute inset-0 border border-emerald-400 rounded" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400 -translate-x-1/2" />
      </div>
    </>
  );
}