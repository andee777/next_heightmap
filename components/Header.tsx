"use client";

import { motion } from "framer-motion";
import { Mountain, RotateCcw, PanelRight, PanelRightClose } from "lucide-react";

interface HeaderProps {
  hasImage: boolean;
  imageName: string;
  onReset: () => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
}

export function Header({ hasImage, imageName, onReset, isPanelOpen, onTogglePanel }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-5 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-400/10 rounded border border-emerald-400/30 animate-pulse-glow" />
          <Mountain className="w-4 h-4 text-emerald-400 relative z-10" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-base font-semibold text-foreground tracking-tight">TERRAIN</span>
          <span className="font-mono text-xs text-emerald-400/70 tracking-widest">.IO</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border" />

      {/* Status bar */}
      <div className="flex-1 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            animate={{ backgroundColor: hasImage ? "#34d399" : "#374151" }}
            transition={{ duration: 0.3 }}
          />
          <span className="font-mono text-xs text-muted-foreground tracking-wider">
            {hasImage ? "LOADED" : "IDLE"}
          </span>
        </div>
        {hasImage && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-xs text-emerald-400/60 truncate"
          >
            {imageName}
          </motion.span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {hasImage && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary rounded border border-transparent hover:border-border transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </motion.button>
        )}
        {hasImage && (
          <button
            onClick={onTogglePanel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary rounded border border-transparent hover:border-border transition-all"
          >
            {isPanelOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}