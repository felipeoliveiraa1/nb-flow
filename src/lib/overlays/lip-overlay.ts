// Overlay ao vivo para Flow Lips - desenha contorno, medidas e guias sobre labios

import type { FaceLandmarks } from "../mediapipe/face-landmarker";
import { LANDMARKS } from "../mediapipe/landmarks";

const PINK = "#FD7F99";
const PINK_LIGHT = "rgba(253, 127, 153, 0.4)";
const GREEN = "rgba(34, 197, 94, 0.8)";
const RED = "rgba(239, 68, 68, 0.6)";
const WHITE = "rgba(255, 255, 255, 0.7)";
const GOLD = "#D4AF37";

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function angleDeg(a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }) {
  const v1 = { x: a.x - c.x, y: a.y - c.y };
  const v2 = { x: b.x - c.x, y: b.y - c.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;
  return Math.abs(Math.atan2(cross, dot) * (180 / Math.PI));
}

export function drawLipOverlay(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
  const toX = (i: number) => lm[i].x * w;
  const toY = (i: number) => lm[i].y * h;

  // --- Contorno externo labio superior ---
  ctx.beginPath();
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const upper = LANDMARKS.UPPER_LIP;
  ctx.moveTo(toX(upper[0]), toY(upper[0]));
  for (let i = 1; i < upper.length; i++) ctx.lineTo(toX(upper[i]), toY(upper[i]));
  ctx.stroke();

  // --- Contorno externo labio inferior ---
  ctx.beginPath();
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 2;
  const lower = LANDMARKS.LOWER_LIP;
  ctx.moveTo(toX(lower[0]), toY(lower[0]));
  for (let i = 1; i < lower.length; i++) ctx.lineTo(toX(lower[i]), toY(lower[i]));
  ctx.stroke();

  // --- Linha de simetria vertical ---
  const noseTip = lm[LANDMARKS.NOSE_TIP];
  const chin = lm[LANDMARKS.CHIN];
  ctx.beginPath();
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = PINK_LIGHT;
  ctx.lineWidth = 1;
  ctx.moveTo(noseTip.x * w, toY(LANDMARKS.UPPER_LIP_CENTER) - 10);
  ctx.lineTo(noseTip.x * w, toY(LANDMARKS.LOWER_LIP_CENTER) + 15);
  ctx.stroke();
  ctx.setLineDash([]);

  // --- Pontos chave ---
  const keyPoints = [
    LANDMARKS.LIP_LEFT_CORNER,
    LANDMARKS.LIP_RIGHT_CORNER,
    LANDMARKS.UPPER_LIP_CENTER,
    LANDMARKS.LOWER_LIP_CENTER,
    LANDMARKS.CUPID_BOW_LEFT,
    LANDMARKS.CUPID_BOW_RIGHT,
  ];
  for (const idx of keyPoints) {
    ctx.beginPath();
    ctx.arc(toX(idx), toY(idx), 3, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // --- Arco de cupido (triangulo) ---
  ctx.beginPath();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.moveTo(toX(LANDMARKS.CUPID_BOW_LEFT), toY(LANDMARKS.CUPID_BOW_LEFT));
  ctx.lineTo(toX(LANDMARKS.CUPID_BOW_CENTER), toY(LANDMARKS.CUPID_BOW_CENTER));
  ctx.lineTo(toX(LANDMARKS.CUPID_BOW_RIGHT), toY(LANDMARKS.CUPID_BOW_RIGHT));
  ctx.stroke();

  // --- Calcular metricas ao vivo ---
  const leftCorner = { x: toX(LANDMARKS.LIP_LEFT_CORNER), y: toY(LANDMARKS.LIP_LEFT_CORNER) };
  const rightCorner = { x: toX(LANDMARKS.LIP_RIGHT_CORNER), y: toY(LANDMARKS.LIP_RIGHT_CORNER) };
  const upperCenter = { x: toX(LANDMARKS.UPPER_LIP_CENTER), y: toY(LANDMARKS.UPPER_LIP_CENTER) };
  const lowerCenter = { x: toX(LANDMARKS.LOWER_LIP_CENTER), y: toY(LANDMARKS.LOWER_LIP_CENTER) };
  const upperInner = { x: toX(LANDMARKS.UPPER_LIP_INNER), y: toY(LANDMARKS.UPPER_LIP_INNER) };
  const lowerInner = { x: toX(LANDMARKS.LOWER_LIP_INNER), y: toY(LANDMARKS.LOWER_LIP_INNER) };
  const cupidL = { x: toX(LANDMARKS.CUPID_BOW_LEFT), y: toY(LANDMARKS.CUPID_BOW_LEFT) };
  const cupidC = { x: toX(LANDMARKS.CUPID_BOW_CENTER), y: toY(LANDMARKS.CUPID_BOW_CENTER) };
  const cupidR = { x: toX(LANDMARKS.CUPID_BOW_RIGHT), y: toY(LANDMARKS.CUPID_BOW_RIGHT) };

  const cupidAngle = angleDeg(cupidL, cupidC, cupidR);
  const upperH = dist(upperCenter, upperInner);
  const lowerH = dist(lowerInner, lowerCenter);
  const ratio = upperH / Math.max(lowerH, 0.001);

  // Simetria
  const midX = noseTip.x * w;
  const leftW = Math.abs(leftCorner.x - midX);
  const rightW = Math.abs(rightCorner.x - midX);
  const sym = (1 - Math.abs(leftW - rightW) / Math.max(leftW, rightW, 0.001)) * 100;

  const fontSize = Math.round(w * 0.025);

  // --- Label arco de cupido ---
  const cupidOk = cupidAngle >= 120 && cupidAngle <= 140;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = cupidOk ? GREEN : RED;
  ctx.textAlign = "center";
  ctx.fillText(`Cupido: ${cupidAngle.toFixed(0)}°`, cupidC.x, cupidC.y - 18);
  ctx.font = `${Math.round(fontSize * 0.75)}px sans-serif`;
  ctx.fillStyle = WHITE;
  ctx.fillText(cupidOk ? "OK" : "ideal: 130°", cupidC.x, cupidC.y - 5);

  // --- Label ratio ---
  const ratioOk = ratio >= 0.45 && ratio <= 0.75;
  const ratioX = rightCorner.x + 15;
  const ratioY = (upperCenter.y + lowerCenter.y) / 2;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = ratioOk ? GREEN : RED;
  ctx.textAlign = "left";
  ctx.fillText(`Ratio: ${ratio.toFixed(2)}`, ratioX, ratioY);
  ctx.font = `${Math.round(fontSize * 0.75)}px sans-serif`;
  ctx.fillStyle = WHITE;
  ctx.fillText(ratioOk ? "OK" : "ideal: 0.6", ratioX, ratioY + fontSize);

  // --- Label simetria ---
  const symOk = sym > 92;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = symOk ? GREEN : RED;
  ctx.textAlign = "center";
  ctx.fillText(`Sim: ${sym.toFixed(0)}%`, (leftCorner.x + rightCorner.x) / 2, lowerCenter.y + 25);
}
