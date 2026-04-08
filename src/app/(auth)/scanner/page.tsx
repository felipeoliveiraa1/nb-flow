"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveCamera } from "@/components/scanner/LiveCamera";
import { FaceOverlay } from "@/components/scanner/FaceOverlay";
import { MetricsHUD } from "@/components/scanner/MetricsHUD";
import { AnalysisResult } from "@/components/scanner/AnalysisResult";
import { CameraCapture } from "@/components/scanner/CameraCapture";
import { calculateMetrics } from "@/lib/mediapipe/metrics";
import { classifyFace } from "@/lib/mediapipe/classification";
import { getFlowRecommendation } from "@/lib/mediapipe/flow-rules";
import { analyzeNataliaMethod } from "@/lib/mediapipe/natalia-method";
import { getFaceLandmarker } from "@/lib/mediapipe/face-landmarker";
import type { FlowRecommendation } from "@/lib/mediapipe/flow-rules";
import type { NataliaAnalysis } from "@/lib/mediapipe/natalia-method";
import type { FaceLandmarks } from "@/lib/mediapipe/face-landmarker";
import type { FaceMetrics } from "@/lib/mediapipe/metrics";
import { ScanFace, Upload } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useGalleryStore } from "@/stores/gallery-store";

type ScannerState = "idle" | "live" | "analyzing" | "result";

export default function ScannerPage() {
  const [state, setState] = useState<ScannerState>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [metrics, setMetrics] = useState<FaceMetrics | null>(null);
  const [recommendation, setRecommendation] = useState<FlowRecommendation | null>(null);
  const [nataliaAnalysis, setNataliaAnalysis] = useState<NataliaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addXP } = useProfileStore();
  const { addItem: addGalleryItem } = useGalleryStore();

  // Processa os landmarks (vindo da camera ao vivo ou de upload)
  const processLandmarks = useCallback((faceLandmarks: FaceLandmarks) => {
    const faceMetrics = calculateMetrics(faceLandmarks);
    setMetrics(faceMetrics);

    const classification = classifyFace(faceLandmarks);
    const flowRec = getFlowRecommendation(classification);
    setRecommendation(flowRec);

    const natalia = analyzeNataliaMethod(faceLandmarks);
    setNataliaAnalysis(natalia);
  }, []);

  // Callback da camera ao vivo
  const handleLiveCapture = useCallback((
    faceLandmarks: FaceLandmarks,
    capturedImageUrl: string,
    width: number,
    height: number
  ) => {
    setImageUrl(capturedImageUrl);
    setImageDimensions({ width, height });
    setLandmarks(faceLandmarks);
    processLandmarks(faceLandmarks);
    addXP(50, "analysis");
    setState("result");
  }, [processLandmarks, addXP]);

  // Callback de upload de foto
  const handlePhotoUpload = useCallback(async (file: File) => {
    setError(null);
    setState("analyzing");

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve) => {
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        resolve();
      };
    });

    try {
      const faceLandmarker = await getFaceLandmarker();
      const analysisImg = new Image();
      analysisImg.src = url;
      await new Promise<void>((resolve) => {
        analysisImg.onload = () => resolve();
      });

      const result = faceLandmarker.detect(analysisImg);

      if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
        setError("Nenhum rosto detectado. Tente com boa iluminacao e rosto de frente.");
        setState("idle");
        return;
      }

      const faceLandmarks = result.faceLandmarks[0];
      setLandmarks(faceLandmarks);
      processLandmarks(faceLandmarks);
      setState("result");
    } catch (err) {
      console.error("Erro na analise:", err);
      setError("Erro ao processar. Tente novamente.");
      setState("idle");
    }
  }, [processLandmarks]);

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setLandmarks(null);
    setMetrics(null);
    setRecommendation(null);
    setNataliaAnalysis(null);
    setError(null);
    setState("idle");
  }, [imageUrl]);

  return (
    <div className="px-5 pt-12 pb-8">
      <AnimatePresence mode="wait">
        {/* === IDLE: escolha camera ou upload === */}
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="mb-6 text-center">
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-nb-dark">
                Flow Analysis
              </h1>
              <p className="mt-1 text-sm text-nb-gray-warm">
                Analise de sobrancelha com IA - Metodo Natalia
              </p>
            </header>

            <div className="mb-6 flex h-64 w-full items-center justify-center rounded-3xl border-2 border-dashed border-nb-pink/20 bg-nb-gray-light">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-nb-pink-soft">
                  <ScanFace className="h-8 w-8 text-nb-pink-deep" />
                </div>
                <p className="text-sm font-medium text-nb-dark-soft">
                  Meça a sobrancelha em tempo real
                </p>
                <p className="mt-1 text-xs text-nb-gray-warm">
                  Ou envie uma foto para analise
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Camera ao vivo (principal) */}
            <button
              onClick={() => setState("live")}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nb-pink to-nb-pink-dark px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-nb-pink/25 transition-all active:scale-[0.98]"
            >
              <ScanFace className="h-4 w-4" />
              Abrir Camera - Medir ao Vivo
            </button>

            {/* Upload como alternativa */}
            <CameraCapture onCapture={handlePhotoUpload} disabled={false} />
          </motion.div>
        )}

        {/* === LIVE: camera com deteccao em tempo real === */}
        {state === "live" && (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LiveCamera
              onCapture={handleLiveCapture}
              onClose={() => setState("idle")}
            />
          </motion.div>
        )}

        {/* === ANALYZING: processando upload === */}
        {state === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center pt-20"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-nb-pink border-t-transparent" />
            <p className="mt-4 text-sm text-nb-gray-warm">Analisando sobrancelhas...</p>
          </motion.div>
        )}

        {/* === RESULT: analise completa === */}
        {state === "result" && imageUrl && landmarks && metrics && recommendation && nataliaAnalysis && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <header className="text-center">
              <h1 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-nb-dark">
                Resultado Flow
              </h1>
            </header>

            <FaceOverlay
              imageUrl={imageUrl}
              landmarks={landmarks}
              width={imageDimensions.width}
              height={imageDimensions.height}
            />

            {/* Score Natalia */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-nb-dark to-nb-dark-soft p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-nb-pink-light">
                  Padrao Natalia
                </p>
                <p className="font-[family-name:var(--font-playfair)] text-sm text-white/60">
                  Simetria: {nataliaAnalysis.symmetryPercent}%
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-nb-pink">
                  {nataliaAnalysis.overallScore}
                </span>
                <span className="text-sm text-nb-pink-light">/100</span>
              </div>
            </div>

            {/* Diagnosticos Natalia */}
            <div className="rounded-2xl bg-nb-pink-soft p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-nb-pink-dark">
                Diagnostico Metodo Natalia
              </p>
              <div className="space-y-2">
                {nataliaAnalysis.diagnostics.map((diag, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-0.5 text-xs text-nb-pink-dark">
                      {diag.includes("OK") || diag.includes("padrao") ? "✓" : "→"}
                    </span>
                    <p className="text-sm leading-relaxed text-nb-dark-soft">{diag}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medidas detalhadas */}
            <div className="grid grid-cols-2 gap-2">
              <MeasureCard
                label="Arco Direito"
                value={`${nataliaAnalysis.right.archHeight.toFixed(1)}%`}
                ideal={`${IDEAL_ARCH_PCT}%`}
                ok={nataliaAnalysis.right.archStatus === "ok"}
              />
              <MeasureCard
                label="Arco Esquerdo"
                value={`${nataliaAnalysis.left.archHeight.toFixed(1)}%`}
                ideal={`${IDEAL_ARCH_PCT}%`}
                ok={nataliaAnalysis.left.archStatus === "ok"}
              />
              <MeasureCard
                label="Angulo Dir."
                value={`${nataliaAnalysis.right.endAngle.toFixed(0)}°`}
                ideal={`${IDEAL_ANGLE}°`}
                ok={nataliaAnalysis.right.endStatus === "ok"}
              />
              <MeasureCard
                label="Angulo Esq."
                value={`${nataliaAnalysis.left.endAngle.toFixed(0)}°`}
                ideal={`${IDEAL_ANGLE}°`}
                ok={nataliaAnalysis.left.endStatus === "ok"}
              />
            </div>

            <MetricsHUD metrics={metrics} />

            <AnalysisResult
              recommendation={recommendation}
              flowScore={metrics.flowScore}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const IDEAL_ARCH_PCT = 8;
const IDEAL_ANGLE = 12;

function MeasureCard({
  label,
  value,
  ideal,
  ok,
}: {
  label: string;
  value: string;
  ideal: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-xl bg-nb-gray-light p-3">
      <p className="text-xs text-nb-gray-warm">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${ok ? "text-emerald-500" : "text-amber-500"}`}>
        {value}
      </p>
      <p className="text-xs text-nb-gray-warm">
        ideal: {ideal}
      </p>
    </div>
  );
}
