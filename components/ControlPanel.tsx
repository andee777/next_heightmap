"use client";

import { TerrainSettings } from "@/app/page";
import { motion } from "framer-motion";
import {
  Layers, Zap, Eye, RotateCw, Wind,
  Triangle, SlidersHorizontal, Palette
} from "lucide-react";

interface ControlPanelProps {
  settings: TerrainSettings;
  onChange: (s: TerrainSettings) => void;
}

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3 h-3 text-emerald-400/60" />
      <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-xs text-emerald-400/80 tabular-nums">
          {value.toFixed(step && step < 1 ? 2 : 0)}{unit}
        </span>
      </div>
      <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full"
          style={{ width: `${pct}%` }}
          layout
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 opacity-0 cursor-pointer -mt-3 relative z-10"
        style={{ marginTop: "-12px" }}
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full group py-0.5"
    >
      <div className="text-left">
        <span className="font-mono text-xs text-foreground/80 group-hover:text-foreground transition-colors">
          {label}
        </span>
        {description && (
          <p className="font-mono text-xs text-muted-foreground/50 mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={`relative w-8 h-4 rounded-full transition-all duration-200 shrink-0 ml-4 ${
          value ? "bg-emerald-400/80" : "bg-secondary"
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
          animate={{ left: value ? "17px" : "2px" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </div>
    </button>
  );
}

const COLOR_MODES = [
  { value: "topographic", label: "TOPO", gradient: "from-blue-900 via-green-600 to-stone-300" },
  { value: "grayscale",   label: "GRAY", gradient: "from-zinc-900 to-zinc-100" },
  { value: "heatmap",     label: "HEAT", gradient: "from-purple-900 via-blue-500 to-yellow-400" },
  { value: "arctic",      label: "ICE",  gradient: "from-blue-950 via-sky-400 to-white" },
] as const;

const RESOLUTIONS = [
  { value: 64,  label: "64" },
  { value: 128, label: "128" },
  { value: 256, label: "256" },
  { value: 512, label: "512" },
];

export function ControlPanel({ settings, onChange }: ControlPanelProps) {
  const set = <K extends keyof TerrainSettings>(key: K, value: TerrainSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="relative w-72 h-full border-l border-border bg-card/60 backdrop-blur-md overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 py-4 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-xs tracking-widest text-foreground uppercase">
            Controls
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="p-5 space-y-7">

        {/* Terrain */}
        <section>
          <SectionLabel icon={Layers} label="Terrain" />
          <div className="space-y-5">
            <SliderRow
              label="Displacement"
              value={settings.displacementScale}
              min={0}
              max={100}
              unit="u"
              onChange={(v) => set("displacementScale", v)}
            />
          </div>
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* Color */}
        <section>
          <SectionLabel icon={Palette} label="Color Mode" />
          <div className="grid grid-cols-2 gap-2">
            {COLOR_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => set("colorMode", mode.value)}
                className={`
                  relative h-12 rounded-lg overflow-hidden border transition-all
                  ${settings.colorMode === mode.value
                    ? "border-emerald-400/60 ring-1 ring-emerald-400/30"
                    : "border-border hover:border-border/80"
                  }
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-80`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold text-white/90 tracking-widest drop-shadow">
                    {mode.label}
                  </span>
                </div>
                {settings.colorMode === mode.value && (
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* Resolution */}
        <section>
          <SectionLabel icon={Zap} label="Resolution" />
          <div className="grid grid-cols-4 gap-1.5">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => set("resolution", r.value)}
                className={`
                  py-2 rounded font-mono text-xs tracking-wider transition-all border
                  ${settings.resolution === r.value
                    ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-400"
                    : "bg-secondary border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-muted-foreground/40 mt-2">
            Higher = more detail, slower render
          </p>
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* Lighting */}
        <section>
          <SectionLabel icon={Eye} label="Lighting" />
          <SliderRow
            label="Ambient"
            value={settings.ambientIntensity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => set("ambientIntensity", v)}
          />
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* Render options */}
        <section>
          <SectionLabel icon={Triangle} label="Render" />
          <div className="space-y-4">
            <Toggle
              label="Wireframe"
              value={settings.wireframe}
              onChange={(v) => set("wireframe", v)}
            />
            <Toggle
              label="Flat Shading"
              value={settings.flatShading}
              onChange={(v) => set("flatShading", v)}
            />
            <Toggle
              label="Fog"
              value={settings.fog}
              onChange={(v) => set("fog", v)}
            />
          </div>
        </section>

        <div className="w-full h-px bg-border/50" />

        {/* Animation */}
        <section>
          <SectionLabel icon={RotateCw} label="Animation" />
          <Toggle
            label="Auto Rotate"
            value={settings.autoRotate}
            onChange={(v) => set("autoRotate", v)}
          />
        </section>

        {/* Footer hint */}
        <div className="pt-2 pb-2">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1.5">
            <p className="font-mono text-xs text-muted-foreground/60 leading-relaxed">
              <span className="text-emerald-400/50">LMB</span> Orbit ·{" "}
              <span className="text-emerald-400/50">RMB</span> Pan ·{" "}
              <span className="text-emerald-400/50">SCROLL</span> Zoom
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}