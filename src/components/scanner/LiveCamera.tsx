"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { LANDMARKS } from "@/lib/mediapipe/landmarks";
import { Camera, X, SwitchCamera } from "lucide-react";
import type { FaceLandmarks } from "@/lib/mediapipe/face-landmarker";

interface LiveCameraProps {
  onCapture: (landmarks: FaceLandmarks, imageUrl: string, width: number, height: number) => void;
  onClose: () => void;
}

const GOLD = "#D4AF37";
const GOLD_LIGHT = "rgba(212, 175, 55, 0.4)";
const GREEN = "rgba(34, 197, 94, 0.8)";
const RED = "rgba(239, 68, 68, 0.6)";
const WHITE = "rgba(255, 255, 255, 0.7)";

// Parametros ideais Natalia
const IDEAL_ARCH_PERCENT = 8;
const IDEAL_END_ANGLE = 12;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function angleDeg(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

export function LiveCamera({ onCapture, onClose }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastLandmarksRef = useRef<FaceLandmarks | null>(null);

  const [ready, setReady] = useState(false);
  const [detected, setDetected] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Start/switch camera
  async function startCamera(mode: "user" | "environment") {
    if (!navigator.mediaDevices?.getUserMedia) return;
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode, width: { ideal: 720 }, height: { ideal: 960 } },
    });

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  }

  function handleSwitchCamera() {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    startCamera(newMode);
  }

  // Initialize MediaPipe and camera
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera nao disponivel. Acesse via HTTPS ou use localhost.");
        onClose();
        return;
      }
      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
      });

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Init MediaPipe
      const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
      const vision = await FilesetResolver.forVisionTasks(CDN);
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      if (cancelled) return;
      landmarkerRef.current = landmarker;
      setReady(true);
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      landmarkerRef.current?.close();
    };
  }, []);

  // Detection loop
  useEffect(() => {
    if (!ready) return;

    function detect() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !canvas || !landmarker || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror only front camera
      const isFront = facingMode === "user";
      if (isFront) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      // Run detection
      const result = landmarker.detectForVideo(video, performance.now());

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const lm = result.faceLandmarks[0];

        // Mirror landmarks only for front camera
        const processed = isFront
          ? lm.map((p) => ({ x: 1 - p.x, y: p.y, z: p.z }))
          : lm.map((p) => ({ x: p.x, y: p.y, z: p.z }));
        lastLandmarksRef.current = processed;
        setDetected(true);

        drawOverlay(ctx, processed, canvas.width, canvas.height);
      } else {
        lastLandmarksRef.current = null;
        setDetected(false);
      }

      animFrameRef.current = requestAnimationFrame(detect);
    }

    animFrameRef.current = requestAnimationFrame(detect);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [ready, facingMode]);

  // Draw eyebrow overlay with measurements
  function drawOverlay(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
    const toX = (i: number) => lm[i].x * w;
    const toY = (i: number) => lm[i].y * h;

    // --- Sobrancelhas atuais ---
    drawBrowPath(ctx, LANDMARKS.RIGHT_EYEBROW_TOP, lm, w, h, GOLD, 2.5);
    drawBrowPath(ctx, LANDMARKS.RIGHT_EYEBROW_BOTTOM, lm, w, h, GOLD, 1.5);
    drawBrowPath(ctx, LANDMARKS.LEFT_EYEBROW_TOP, lm, w, h, GOLD, 2.5);
    drawBrowPath(ctx, LANDMARKS.LEFT_EYEBROW_BOTTOM, lm, w, h, GOLD, 1.5);

    // --- Olhos ---
    drawClosedPath(ctx, LANDMARKS.RIGHT_EYE, lm, w, h, WHITE, 1);
    drawClosedPath(ctx, LANDMARKS.LEFT_EYE, lm, w, h, WHITE, 1);

    // --- Medidas em tempo real (lado direito como exemplo principal) ---
    drawMeasurements(ctx, lm, w, h, "right");
    drawMeasurements(ctx, lm, w, h, "left");

    // --- Pontos chave com labels ---
    drawKeyPoint(ctx, toX(70), toY(70), "Inicio", w);
    drawKeyPoint(ctx, toX(66), toY(66), "Arco", w);
    drawKeyPoint(ctx, toX(55), toY(55), "Final", w);

    drawKeyPoint(ctx, toX(300), toY(300), "Inicio", w);
    drawKeyPoint(ctx, toX(296), toY(296), "Arco", w);
    drawKeyPoint(ctx, toX(285), toY(285), "Final", w);
  }

  function drawMeasurements(
    ctx: CanvasRenderingContext2D,
    lm: FaceLandmarks,
    w: number,
    h: number,
    side: "left" | "right"
  ) {
    const startIdx = side === "right" ? 70 : 300;
    const archIdx = side === "right" ? 66 : 296;
    const endIdx = side === "right" ? 55 : 285;

    const start = { x: lm[startIdx].x * w, y: lm[startIdx].y * h };
    const arch = { x: lm[archIdx].x * w, y: lm[archIdx].y * h };
    const end = { x: lm[endIdx].x * w, y: lm[endIdx].y * h };

    // Calcular arco %
    const baselineY = start.y + ((arch.x - start.x) / (end.x - start.x + 0.001)) * (end.y - start.y);
    const archDeviation = baselineY - arch.y;
    const baseLength = dist(start, end);
    const archPercent = (archDeviation / (baseLength + 0.001)) * 100;

    // Calcular angulo do final
    const endAngle = Math.abs(angleDeg(arch, end));

    // Cor baseada na proximidade do ideal
    const archOk = archPercent >= 5 && archPercent <= 10;
    const angleOk = endAngle >= 10 && endAngle <= 15;

    // Desenhar linha base (tracejada)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = GOLD_LIGHT;
    ctx.lineWidth = 1;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label do arco
    const archColor = archOk ? GREEN : RED;
    const labelX = arch.x;
    const labelY = arch.y - 20;

    ctx.font = `bold ${Math.round(w * 0.028)}px sans-serif`;
    ctx.fillStyle = archColor;
    ctx.textAlign = "center";
    ctx.fillText(`Arco: ${archPercent.toFixed(1)}%`, labelX, labelY);

    // Mini texto do ideal
    ctx.font = `${Math.round(w * 0.02)}px sans-serif`;
    ctx.fillStyle = WHITE;
    ctx.fillText(archOk ? "OK" : `ideal: ${IDEAL_ARCH_PERCENT}%`, labelX, labelY + Math.round(w * 0.03));

    // Label do angulo final
    const angleColor = angleOk ? GREEN : RED;
    ctx.font = `bold ${Math.round(w * 0.025)}px sans-serif`;
    ctx.fillStyle = angleColor;
    ctx.textAlign = "center";
    ctx.fillText(`${endAngle.toFixed(0)}°`, end.x, end.y + Math.round(w * 0.05));
    ctx.font = `${Math.round(w * 0.018)}px sans-serif`;
    ctx.fillStyle = WHITE;
    ctx.fillText(angleOk ? "OK" : `ideal: ${IDEAL_END_ANGLE}°`, end.x, end.y + Math.round(w * 0.075));
  }

  function drawKeyPoint(ctx: CanvasRenderingContext2D, x: number, y: number, _label: string, w: number) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(3, w * 0.006), 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Capture current frame
  const handleCapture = useCallback(() => {
    const canvas = canvasRef.current;
    const landmarks = lastLandmarksRef.current;
    if (!canvas || !landmarks) return;

    // Create clean image (without overlay)
    const tempCanvas = document.createElement("canvas");
    const video = videoRef.current!;
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext("2d")!;

    // Mirror only front camera
    if (facingMode === "user") {
      tempCtx.save();
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.restore();
    } else {
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    }

    const imageUrl = tempCanvas.toDataURL("image/jpeg", 0.9);

    // Stop camera
    streamRef.current?.getTracks().forEach((t) => t.stop());
    cancelAnimationFrame(animFrameRef.current);

    onCapture(landmarks, imageUrl, tempCanvas.width, tempCanvas.height);
  }, [onCapture]);

  return (
    <div className="relative">
      {/* Video (hidden, used as source) */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
      />

      {/* Canvas with overlay */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-3xl"
      />

      {/* Status bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
          detected
            ? "bg-emerald-500/80 text-white"
            : "bg-nb-dark/50 text-white"
        }`}>
          {!ready ? "Carregando IA..." : detected ? "Sobrancelha detectada" : "Posicione o rosto"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSwitchCamera}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-nb-dark/50 text-white"
          >
            <SwitchCamera className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-nb-dark/50 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Gradient legend */}
      {detected && (
        <div className="absolute bottom-20 left-3 right-3 rounded-xl bg-nb-dark/70 px-3 py-2 backdrop-blur-sm">
          <p className="text-center text-xs text-white/80">
            <span className="text-green-400">Verde</span> = dentro do padrao &nbsp;
            <span className="text-red-400">Vermelho</span> = fora do padrao
          </p>
        </div>
      )}

      {/* Capture button */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={!detected}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-all active:scale-90 disabled:opacity-40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-nb-gold to-nb-gold-dark">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}

// --- Drawing helpers ---

function drawBrowPath(
  ctx: CanvasRenderingContext2D,
  indices: readonly number[],
  lm: FaceLandmarks,
  w: number,
  h: number,
  color: string,
  lineWidth: number
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(lm[indices[0]].x * w, lm[indices[0]].y * h);
  for (let i = 1; i < indices.length; i++) {
    ctx.lineTo(lm[indices[i]].x * w, lm[indices[i]].y * h);
  }
  ctx.stroke();
}

function drawClosedPath(
  ctx: CanvasRenderingContext2D,
  indices: readonly number[],
  lm: FaceLandmarks,
  w: number,
  h: number,
  color: string,
  lineWidth: number
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(lm[indices[0]].x * w, lm[indices[0]].y * h);
  for (let i = 1; i < indices.length; i++) {
    ctx.lineTo(lm[indices[i]].x * w, lm[indices[i]].y * h);
  }
  ctx.closePath();
  ctx.stroke();
}
