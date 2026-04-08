"use client";

import type { FaceMetrics } from "@/lib/mediapipe/metrics";
import { motion } from "framer-motion";

interface MetricsHUDProps {
  metrics: FaceMetrics;
}

export function MetricsHUD({ metrics }: MetricsHUDProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-3"
    >
      {/* Score principal */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-nb-dark to-nb-dark-soft p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-nb-pink-light">
            Flow Score
          </p>
          <p className="font-[family-name:var(--font-playfair)] text-sm text-white/60">
            Harmonia facial geral
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-nb-pink">
            {metrics.flowScore}
          </span>
          <span className="text-sm text-nb-pink-light">/100</span>
        </div>
      </div>

      {/* Metricas detalhadas */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Sobrancelhas"
          value={metrics.eyebrowSymmetry}
          unit="%"
          delay={0.4}
        />
        <MetricCard
          label="Olhos"
          value={metrics.eyeSymmetry}
          unit="%"
          delay={0.5}
        />
        <MetricCard
          label="Labios"
          value={metrics.lipSymmetry}
          unit="%"
          delay={0.6}
        />
        <MetricCard
          label="Proporcao Aurea"
          value={metrics.goldenRatio}
          unit="%"
          delay={0.7}
        />
      </div>
    </motion.div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  delay,
}: {
  label: string;
  value: number;
  unit: string;
  delay: number;
}) {
  const color =
    value >= 90
      ? "text-emerald-500"
      : value >= 75
        ? "text-nb-pink"
        : "text-amber-500";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl bg-nb-gray-light p-3"
    >
      <p className="text-xs text-nb-gray-warm">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${color}`}>
        {value}
        <span className="text-xs font-normal text-nb-gray-warm">{unit}</span>
      </p>
    </motion.div>
  );
}
