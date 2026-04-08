"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { FaceLandmarks } from "@/lib/mediapipe/face-landmarker";
import { Camera, X, SwitchCamera } from "lucide-react";

interface FlowCameraProps {
  onCapture: (landmarks: FaceLandmarks, imageUrl: string, width: number, height: number) => void;
  onClose: () => void;
  drawOverlay: (ctx: CanvasRenderingContext2D, landmarks: FaceLandmarks, w: number, h: number) => void;
  statusLabel: string;
}

export function FlowCamera({ onCapture, onClose, drawOverlay, statusLabel }: FlowCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastLandmarksRef = useRef<FaceLandmarks | null>(null);

  const [ready, setReady] = useState(false);
  const [detected, setDetected] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera nao disponivel. Acesse via HTTPS ou use localhost.");
        onClose();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
      });
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
      const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
      const vision = await FilesetResolver.forVisionTasks(CDN);
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
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

      const isFront = facingMode === "user";
      if (isFront) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const result = landmarker.detectForVideo(video, performance.now());

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const lm = result.faceLandmarks[0];
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
  }, [ready, facingMode, drawOverlay]);

  const handleCapture = useCallback(() => {
    const canvas = canvasRef.current;
    const landmarks = lastLandmarksRef.current;
    if (!canvas || !landmarks) return;

    const tempCanvas = document.createElement("canvas");
    const video = videoRef.current!;
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext("2d")!;

    if (facingMode === "user") {
      tempCtx.save();
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.restore();
    } else {
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    }

    const imageUrl = tempCanvas.toDataURL("image/jpeg", 0.9);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    onCapture(landmarks, imageUrl, tempCanvas.width, tempCanvas.height);
  }, [onCapture, facingMode]);

  return (
    <div className="relative">
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="w-full rounded-3xl" />

      {/* Status */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
          detected ? "bg-emerald-500/80 text-white" : "bg-nb-dark/50 text-white"
        }`}>
          {!ready ? "Carregando IA..." : detected ? statusLabel : "Posicione o rosto"}
        </div>
        <div className="flex gap-2">
          <button onClick={handleSwitchCamera} className="flex h-8 w-8 items-center justify-center rounded-full bg-nb-dark/50 text-white">
            <SwitchCamera className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-nb-dark/50 text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      {detected && (
        <div className="absolute bottom-20 left-3 right-3 rounded-xl bg-nb-dark/70 px-3 py-2 backdrop-blur-sm">
          <p className="text-center text-xs text-white/80">
            <span className="text-green-400">Verde</span> = dentro do padrao &nbsp;
            <span className="text-red-400">Vermelho</span> = fora do padrao
          </p>
        </div>
      )}

      {/* Capture */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={!detected}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-all active:scale-90 disabled:opacity-40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-nb-pink to-nb-pink-dark">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}
