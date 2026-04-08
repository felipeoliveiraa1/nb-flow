"use client";

import type { FlowRecommendation } from "@/lib/mediapipe/flow-rules";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, AlertCircle } from "lucide-react";

interface AnalysisResultProps {
  recommendation: FlowRecommendation;
  flowScore: number;
  onReset: () => void;
}

export function AnalysisResult({ recommendation, flowScore, onReset }: AnalysisResultProps) {
  const level =
    flowScore >= 90
      ? { label: "Excelente", color: "from-emerald-400 to-emerald-600" }
      : flowScore >= 75
        ? { label: "Muito Bom", color: "from-nb-pink to-nb-pink-dark" }
        : flowScore >= 60
          ? { label: "Bom", color: "from-amber-400 to-amber-600" }
          : { label: "A Melhorar", color: "from-orange-400 to-orange-600" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="space-y-4"
    >
      {/* Classificacao do rosto */}
      <div className="rounded-2xl bg-nb-gray-light p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-nb-dark-soft/60">
          Classificacao
        </p>
        <div className="flex gap-2">
          <span className="rounded-full bg-nb-pink-soft px-3 py-1 text-xs font-semibold text-nb-pink-deep">
            Rosto {recommendation.faceShapeLabel}
          </span>
          <span className="rounded-full bg-nb-pink-soft px-3 py-1 text-xs font-semibold text-nb-pink-dark">
            Sobrancelha {recommendation.eyebrowShapeLabel}
          </span>
        </div>
      </div>

      {/* Nivel de harmonia */}
      <div className={`rounded-2xl bg-gradient-to-r ${level.color} p-4`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-white" />
          <p className="text-sm font-semibold text-white">
            Harmonia Facial: {level.label} ({flowScore}/100)
          </p>
        </div>
      </div>

      {/* Tecnica Flow recomendada */}
      <div className="rounded-2xl bg-nb-pink-soft p-5">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-nb-pink-dark">
          Tecnica Recomendada
        </p>
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-nb-dark">
          {recommendation.technique}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-nb-dark-soft">
          {recommendation.description}
        </p>
      </div>

      {/* Notas adicionais */}
      {recommendation.additionalNotes.length > 0 && (
        <div className="space-y-2">
          {recommendation.additionalNotes.map((note, i) => (
            <div key={i} className="flex gap-2 rounded-xl bg-nb-gray-light p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-nb-pink-dark" />
              <p className="text-xs leading-relaxed text-nb-dark-soft">{note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Botao nova analise */}
      <button
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-nb-pink/20 bg-white py-3 text-sm font-medium text-nb-dark-soft transition-all active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" />
        Nova Analise
      </button>
    </motion.div>
  );
}
