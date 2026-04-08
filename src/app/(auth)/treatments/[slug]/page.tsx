"use client";

import { useParams, useRouter, redirect } from "next/navigation";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ScanFace, RotateCcw, Check, AlertCircle, Pen, Droplets, Sparkles, Eraser, Sun, type LucideIcon } from "lucide-react";
import { FlowCamera } from "@/components/scanner/FlowCamera";
import type { FaceLandmarks } from "@/lib/mediapipe/face-landmarker";
import { analyzeLips, type LipAnalysis } from "@/lib/mediapipe/lip-analysis";
import { analyzeSkin, type SkinAnalysis } from "@/lib/analysis/skin-analysis";
import { analyzePigment, type PigmentAnalysis } from "@/lib/analysis/pigment-analysis";
import { drawLipOverlay } from "@/lib/overlays/lip-overlay";
import { drawSkinOverlay } from "@/lib/overlays/skin-overlay";
import { drawPigmentOverlay } from "@/lib/overlays/pigment-overlay";

type ViewState = "info" | "live" | "result";

interface TreatmentDef {
  name: string;
  icon: LucideIcon;
  description: string;
  analysisType: "lips" | "skin_peel" | "skin_shine" | "pigment";
  statusLabel: string;
}

const TREATMENTS: Record<string, TreatmentDef> = {
  "flow-lips": {
    name: "Flow Lips",
    icon: Droplets,
    description: "Analise labial completa com camera ao vivo. Mede simetria, proporcao superior/inferior, angulo do arco de cupido e recomenda a tecnica de preenchimento ideal para a cliente.",
    analysisType: "lips",
    statusLabel: "Labios detectados",
  },
  "flow-peel": {
    name: "Flow Peel",
    icon: Sparkles,
    description: "Analise de pele em tempo real por regiao do rosto. Detecta manchas, textura irregular, poros dilatados e recomenda o tipo de peeling ideal. Heatmap colorido mostra as areas problematicas.",
    analysisType: "skin_peel",
    statusLabel: "Pele detectada",
  },
  "flow-removal": {
    name: "Flow Removal",
    icon: Eraser,
    description: "Detecta pigmento existente nas sobrancelhas em tempo real. Analisa densidade, saturacao, cor dominante e calcula a dificuldade de remocao com estimativa de sessoes necessarias.",
    analysisType: "pigment",
    statusLabel: "Pigmento detectado",
  },
  "shine-face": {
    name: "Shine Face",
    icon: Sun,
    description: "Analise completa do tipo de pele em tempo real. Detecta oleosidade por zona (T-zone, bochechas, queixo), uniformidade do tom e textura. Recomenda o tratamento de hidratacao ideal.",
    analysisType: "skin_shine",
    statusLabel: "Pele detectada",
  },
};

export default function TreatmentScannerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Flow Brows redireciona para o Scanner completo
  if (slug === "flow-brows") {
    redirect("/scanner");
  }

  const treatment = TREATMENTS[slug];

  const [view, setView] = useState<ViewState>("info");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [lipResult, setLipResult] = useState<LipAnalysis | null>(null);
  const [skinResult, setSkinResult] = useState<SkinAnalysis | null>(null);
  const [pigmentResult, setPigmentResult] = useState<PigmentAnalysis | null>(null);
  const [flowScore, setFlowScore] = useState(0);

  // Overlay ao vivo baseado no tipo de analise
  const getDrawOverlay = useCallback(() => {
    if (!treatment) return () => {};
    switch (treatment.analysisType) {
      case "lips": return drawLipOverlay;
      case "skin_peel":
      case "skin_shine": return drawSkinOverlay;
      case "pigment": return drawPigmentOverlay;
    }
  }, [treatment]);

  // Captura da camera ao vivo
  const handleCapture = useCallback((landmarks: FaceLandmarks, capturedUrl: string, width: number, height: number) => {
    setImageUrl(capturedUrl);

    // Criar canvas para analise de pixels
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.src = capturedUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      switch (treatment.analysisType) {
        case "lips": {
          const result = analyzeLips(landmarks);
          setLipResult(result);
          setFlowScore(result.flowScore);
          break;
        }
        case "skin_peel":
        case "skin_shine": {
          const result = analyzeSkin(canvas, landmarks);
          setSkinResult(result);
          setFlowScore(result.overallScore);
          break;
        }
        case "pigment": {
          const result = analyzePigment(canvas, landmarks);
          setPigmentResult(result);
          setFlowScore(100 - result.removalDifficulty);
          break;
        }
      }

      setView("result");
    };
  }, [treatment]);

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setLipResult(null);
    setSkinResult(null);
    setPigmentResult(null);
    setView("info");
  }, [imageUrl]);

  if (!treatment) {
    return <div className="pt-20 text-center text-nb-gray-warm">Tecnica nao encontrada</div>;
  }

  const Icon = treatment.icon;

  return (
    <div className="pb-8">
      <AnimatePresence mode="wait">
        {/* === INFO === */}
        {view === "info" && (
          <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-gradient-to-br from-nb-pink to-nb-pink-dark px-5 pb-8 pt-12">
              <button onClick={() => router.back()} className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">{treatment.name}</h1>
                  <p className="text-xs text-white/70">Scanner IA ao vivo</p>
                </div>
              </div>
            </div>

            <div className="px-5 pt-5 space-y-4">
              <p className="text-sm leading-relaxed text-nb-dark-soft">{treatment.description}</p>

              <button
                onClick={() => setView("live")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-nb-pink py-3.5 text-sm font-semibold text-white shadow-lg shadow-nb-pink/25 active:scale-[0.98]"
              >
                <ScanFace className="h-5 w-5" />
                Abrir Camera ao Vivo
              </button>
            </div>
          </motion.div>
        )}

        {/* === LIVE CAMERA === */}
        {view === "live" && (
          <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pt-12">
            <FlowCamera
              onCapture={handleCapture}
              onClose={() => setView("info")}
              drawOverlay={getDrawOverlay()}
              statusLabel={treatment.statusLabel}
            />
          </motion.div>
        )}

        {/* === RESULT === */}
        {view === "result" && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-gradient-to-br from-nb-pink to-nb-pink-dark px-5 pb-4 pt-12">
              <button onClick={handleReset} className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">Resultado {treatment.name}</h1>
            </div>

            <div className="px-5 pt-4 space-y-4">
              {imageUrl && <img src={imageUrl} alt="Analise" className="w-full rounded-2xl" />}

              {/* Score */}
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-nb-dark to-nb-dark-soft p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-nb-pink-light">{treatment.name}</p>
                  <p className="text-sm text-white/60">
                    {treatment.analysisType === "pigment" ? "Facilidade de remocao" : "Score geral"}
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-nb-pink">{flowScore}</span>
                  <span className="text-sm text-nb-pink-light">/100</span>
                </div>
              </div>

              {lipResult && <LipsResult data={lipResult} />}
              {skinResult && <SkinResult data={skinResult} />}
              {pigmentResult && <PigmentResult data={pigmentResult} />}

              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-nb-pink/20 bg-white py-3 text-sm font-medium text-nb-dark-soft active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" />
                Nova Analise
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Resultado Flow Lips ---
function LipsResult({ data }: { data: LipAnalysis }) {
  return (
    <>
      <div className="rounded-2xl bg-nb-pink-soft p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-nb-pink-dark mb-1">Classificacao</p>
        <p className="text-sm font-semibold text-nb-dark">Labio {data.lipShapeLabel}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Arco Cupido" value={`${data.cupidBowAngle.toFixed(0)}°`} ideal="130°" ok={data.cupidBowAngle >= 120 && data.cupidBowAngle <= 140} />
        <MetricCard label="Ratio Sup/Inf" value={`${data.upperLowerRatio.toFixed(2)}`} ideal="0.60" ok={data.upperLowerRatio >= 0.45 && data.upperLowerRatio <= 0.75} />
        <MetricCard label="Simetria" value={`${data.symmetryPercent}%`} ideal=">92%" ok={data.symmetryPercent > 92} />
        <MetricCard label="Largura/Alt" value={`${data.widthHeightRatio.toFixed(1)}`} ideal="3.0" ok={data.widthHeightRatio >= 2.5 && data.widthHeightRatio <= 3.5} />
      </div>
      <TechniqueCard title={data.techniqueLabel} description={data.description} />
      <DiagnosticsList items={data.diagnostics} />
    </>
  );
}

// --- Resultado Flow Peel / Shine Face ---
function SkinResult({ data }: { data: SkinAnalysis }) {
  return (
    <>
      <div className="rounded-2xl bg-nb-pink-soft p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-nb-pink-dark mb-1">Tipo de Pele</p>
        <p className="text-sm font-semibold text-nb-dark">{data.skinTypeLabel}</p>
      </div>
      <div className="space-y-2">
        {data.regions.map((r) => (
          <div key={r.name} className="rounded-xl bg-nb-gray-light p-3">
            <p className="text-xs font-semibold text-nb-dark mb-2">{r.name}</p>
            <div className="grid grid-cols-4 gap-1">
              <MiniMetric label="Uniforme" value={r.uniformity} />
              <MiniMetric label="Manchas" value={r.spots} invert />
              <MiniMetric label="Oleosidade" value={r.oiliness} invert />
              <MiniMetric label="Textura" value={r.texture} />
            </div>
          </div>
        ))}
      </div>
      <TechniqueCard title={data.technique} description={data.description} />
      <DiagnosticsList items={data.diagnostics} />
    </>
  );
}

// --- Resultado Flow Removal ---
function PigmentResult({ data }: { data: PigmentAnalysis }) {
  const diffColor =
    data.removalDifficulty < 30 ? "text-emerald-500" :
    data.removalDifficulty < 55 ? "text-amber-500" :
    data.removalDifficulty < 75 ? "text-orange-500" : "text-red-500";

  return (
    <>
      <div className="rounded-2xl bg-nb-pink-soft p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-nb-pink-dark mb-1">Dificuldade de Remocao</p>
            <p className={`text-lg font-bold ${diffColor}`}>{data.difficultyLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-nb-dark">{data.estimatedSessions}</p>
            <p className="text-xs text-nb-gray-warm">sessoes est.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Densidade" value={`${data.density}%`} ideal="<30%" ok={data.density < 30} />
        <MetricCard label="Saturacao" value={`${data.saturation}%`} ideal="<40%" ok={data.saturation < 40} />
        <MetricCard label="Consistencia" value={`${data.colorConsistency}%`} ideal=">70%" ok={data.colorConsistency > 70} />
        <div className="rounded-xl bg-nb-gray-light p-3">
          <p className="text-xs text-nb-gray-warm">Cor dominante</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ backgroundColor: data.dominantColor }} />
            <div>
              <span className="text-sm font-bold text-nb-dark">{data.dominantColor}</span>
              <p className="text-xs text-nb-gray-warm capitalize">{data.colorCategory.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </div>
      <DiagnosticsList items={data.diagnostics} />
    </>
  );
}

// --- Shared ---
function MetricCard({ label, value, ideal, ok }: { label: string; value: string; ideal: string; ok: boolean }) {
  return (
    <div className="rounded-xl bg-nb-gray-light p-3">
      <p className="text-xs text-nb-gray-warm">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${ok ? "text-emerald-500" : "text-amber-500"}`}>{value}</p>
      <p className="text-xs text-nb-gray-warm">ideal: {ideal}</p>
    </div>
  );
}

function MiniMetric({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value < 30 : value > 70;
  const color = good ? "text-emerald-500" : "text-amber-500";
  return (
    <div className="text-center">
      <p className={`text-sm font-bold ${color}`}>{Math.round(value)}</p>
      <p className="text-[10px] text-nb-gray-warm">{label}</p>
    </div>
  );
}

function TechniqueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-nb-pink-soft p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-nb-pink-dark mb-1">Tecnica Recomendada</p>
      <p className="text-sm font-semibold text-nb-dark">{title}</p>
      <p className="mt-1.5 text-xs text-nb-dark-soft leading-relaxed">{description}</p>
    </div>
  );
}

function DiagnosticsList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 rounded-xl bg-nb-gray-light p-3">
          {item.includes("ideal") || item.includes("padrao") || item.includes("bom") || item.includes("OK")
            ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-nb-pink" />
          }
          <p className="text-xs leading-relaxed text-nb-dark-soft">{item}</p>
        </div>
      ))}
    </div>
  );
}
