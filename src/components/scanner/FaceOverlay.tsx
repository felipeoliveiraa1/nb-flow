"use client";

import { useEffect, useRef } from "react";
import type { FaceLandmarks } from "@/lib/mediapipe/face-landmarker";
import { LANDMARKS } from "@/lib/mediapipe/landmarks";

interface FaceOverlayProps {
  imageUrl: string;
  landmarks: FaceLandmarks;
  width: number;
  height: number;
}

const GOLD = "#D4AF37";
const GOLD_LIGHT = "rgba(212, 175, 55, 0.3)";
const ROSE = "rgba(233, 30, 99, 0.5)";
const WHITE = "rgba(255, 255, 255, 0.7)";

export function FaceOverlay({ imageUrl, landmarks, width, height }: FaceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks.length) return;

    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      const lm = landmarks;
      const toX = (i: number) => lm[i].x * width;
      const toY = (i: number) => lm[i].y * height;

      // --- Draw midline (symmetry axis) ---
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = GOLD_LIGHT;
      ctx.lineWidth = 1.5;
      const midlinePoints = LANDMARKS.MIDLINE;
      ctx.moveTo(toX(midlinePoints[0]), toY(midlinePoints[0]));
      for (let i = 1; i < midlinePoints.length; i++) {
        ctx.lineTo(toX(midlinePoints[i]), toY(midlinePoints[i]));
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // --- Draw face oval ---
      ctx.beginPath();
      ctx.strokeStyle = GOLD_LIGHT;
      ctx.lineWidth = 1;
      const oval = LANDMARKS.FACE_OVAL;
      ctx.moveTo(toX(oval[0]), toY(oval[0]));
      for (let i = 1; i < oval.length; i++) {
        ctx.lineTo(toX(oval[i]), toY(oval[i]));
      }
      ctx.closePath();
      ctx.stroke();

      // --- Draw eyebrows (arco superior + borda inferior = contorno completo) ---
      drawPath(ctx, LANDMARKS.LEFT_EYEBROW_TOP, lm, width, height, GOLD, 2.5);
      drawPath(ctx, LANDMARKS.LEFT_EYEBROW_BOTTOM, lm, width, height, GOLD, 1.5);
      drawPath(ctx, LANDMARKS.RIGHT_EYEBROW_TOP, lm, width, height, GOLD, 2.5);
      drawPath(ctx, LANDMARKS.RIGHT_EYEBROW_BOTTOM, lm, width, height, GOLD, 1.5);

      // --- Draw eyes ---
      drawClosedPath(ctx, LANDMARKS.LEFT_EYE, lm, width, height, WHITE, 1.5);
      drawClosedPath(ctx, LANDMARKS.RIGHT_EYE, lm, width, height, WHITE, 1.5);

      // --- Draw interocular line ---
      ctx.beginPath();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.moveTo(toX(LANDMARKS.RIGHT_EYE_INNER), toY(LANDMARKS.RIGHT_EYE_INNER));
      ctx.lineTo(toX(LANDMARKS.LEFT_EYE_INNER), toY(LANDMARKS.LEFT_EYE_INNER));
      ctx.stroke();
      ctx.setLineDash([]);

      // --- Draw nose ---
      drawPath(ctx, LANDMARKS.NOSE_BRIDGE, lm, width, height, GOLD_LIGHT, 1);
      // Nose width
      ctx.beginPath();
      ctx.strokeStyle = ROSE;
      ctx.lineWidth = 1;
      ctx.moveTo(toX(LANDMARKS.NOSE_BOTTOM[1]), toY(LANDMARKS.NOSE_BOTTOM[1]));
      ctx.lineTo(toX(LANDMARKS.NOSE_BOTTOM[2]), toY(LANDMARKS.NOSE_BOTTOM[2]));
      ctx.stroke();

      // --- Draw lips ---
      drawClosedPath(ctx, LANDMARKS.UPPER_LIP, lm, width, height, ROSE, 1.5);
      drawClosedPath(ctx, LANDMARKS.LOWER_LIP, lm, width, height, ROSE, 1.5);

      // --- Draw key landmark dots ---
      const keyPoints = [
        LANDMARKS.NOSE_TIP,
        LANDMARKS.FOREHEAD_CENTER,
        LANDMARKS.CHIN,
        LANDMARKS.LEFT_EYE_INNER,
        LANDMARKS.RIGHT_EYE_INNER,
        LANDMARKS.LEFT_EYE_OUTER,
        LANDMARKS.RIGHT_EYE_OUTER,
        LANDMARKS.LIP_LEFT_CORNER,
        LANDMARKS.LIP_RIGHT_CORNER,
      ];

      keyPoints.forEach((idx) => {
        ctx.beginPath();
        ctx.arc(toX(idx), toY(idx), 3, 0, Math.PI * 2);
        ctx.fillStyle = GOLD;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    img.src = imageUrl;
  }, [imageUrl, landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-2xl"
      style={{ aspectRatio: `${width}/${height}` }}
    />
  );
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  indices: readonly number[],
  landmarks: FaceLandmarks,
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
  ctx.moveTo(landmarks[indices[0]].x * w, landmarks[indices[0]].y * h);
  for (let i = 1; i < indices.length; i++) {
    ctx.lineTo(landmarks[indices[i]].x * w, landmarks[indices[i]].y * h);
  }
  ctx.stroke();
}

function drawClosedPath(
  ctx: CanvasRenderingContext2D,
  indices: readonly number[],
  landmarks: FaceLandmarks,
  w: number,
  h: number,
  color: string,
  lineWidth: number
) {
  drawPath(ctx, indices, landmarks, w, h, color, lineWidth);
  ctx.closePath();
  ctx.stroke();
}
