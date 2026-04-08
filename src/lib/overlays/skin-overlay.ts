// Overlay ao vivo para Flow Peel / Shine Face - heatmap de pele em tempo real

import type { FaceLandmarks } from "../mediapipe/face-landmarker";
import { LANDMARKS } from "../mediapipe/landmarks";

const GREEN = "rgba(34, 197, 94, 0.35)";
const YELLOW = "rgba(234, 179, 8, 0.35)";
const RED = "rgba(239, 68, 68, 0.35)";
const WHITE = "rgba(255, 255, 255, 0.8)";

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

interface RegionDef {
  name: string;
  indices: readonly number[];
}

const REGIONS: RegionDef[] = [
  { name: "Testa", indices: [10, 338, 297, 332, 109, 67, 103, 54, 21] },
  { name: "Boch.E", indices: LANDMARKS.LEFT_CHEEK },
  { name: "Boch.D", indices: LANDMARKS.RIGHT_CHEEK },
  { name: "Queixo", indices: [152, 148, 176, 149, 150, 136, 172, 58, 132] },
];

export function drawSkinOverlay(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
  const toX = (i: number) => lm[i].x * w;
  const toY = (i: number) => lm[i].y * h;

  // Contorno facial
  ctx.beginPath();
  ctx.strokeStyle = "rgba(253, 127, 153, 0.3)";
  ctx.lineWidth = 1;
  const oval = LANDMARKS.FACE_OVAL;
  ctx.moveTo(toX(oval[0]), toY(oval[0]));
  for (let i = 1; i < oval.length; i++) ctx.lineTo(toX(oval[i]), toY(oval[i]));
  ctx.closePath();
  ctx.stroke();

  // Analisar e colorir cada regiao
  for (const region of REGIONS) {
    const points = region.indices.map((i) => ({ x: toX(i), y: toY(i) }));
    if (points.length < 3) continue;

    // Bounding box
    const minX = Math.max(0, Math.min(...points.map((p) => p.x)) - 2);
    const minY = Math.max(0, Math.min(...points.map((p) => p.y)) - 2);
    const maxX = Math.min(w, Math.max(...points.map((p) => p.x)) + 2);
    const maxY = Math.min(h, Math.max(...points.map((p) => p.y)) + 2);

    // Amostrar pixels
    let imgData: ImageData;
    try {
      imgData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
    } catch {
      continue;
    }

    const data = imgData.data;
    const pixelCount = imgData.width * imgData.height;
    let lumSum = 0;
    let lumSqSum = 0;
    let brightPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const lum = luminance(data[i], data[i + 1], data[i + 2]);
      lumSum += lum;
      lumSqSum += lum * lum;
      if (lum > 200) brightPixels++;
    }

    const avgLum = lumSum / pixelCount;
    const variance = lumSqSum / pixelCount - avgLum * avgLum;
    const stdDev = Math.sqrt(Math.max(0, variance));

    // Scores
    const uniformity = Math.max(0, Math.min(100, 100 - stdDev * 2));
    const oiliness = Math.min(100, (brightPixels / pixelCount) * 300);
    const healthScore = (uniformity + (100 - oiliness)) / 2;

    // Cor do heatmap baseada no score
    let color: string;
    if (healthScore > 70) color = GREEN;
    else if (healthScore > 45) color = YELLOW;
    else color = RED;

    // Desenhar regiao colorida
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Borda da regiao
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Label
    const centerX = points.reduce((s, p) => s + p.x, 0) / points.length;
    const centerY = points.reduce((s, p) => s + p.y, 0) / points.length;

    const fontSize = Math.round(w * 0.022);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = WHITE;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(region.name, centerX, centerY - fontSize * 0.8);

    ctx.font = `bold ${Math.round(fontSize * 1.3)}px sans-serif`;
    ctx.fillText(`${Math.round(healthScore)}`, centerX, centerY + fontSize * 0.5);

    ctx.font = `${Math.round(fontSize * 0.7)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("/100", centerX + fontSize * 1.2, centerY + fontSize * 0.5);
    ctx.textBaseline = "alphabetic";
  }

  // Zona T indicator
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  // Vertical (testa ao nariz)
  ctx.moveTo(toX(10), toY(10));
  ctx.lineTo(toX(152), toY(1));
  // Horizontal (entre olhos)
  ctx.moveTo(toX(LANDMARKS.RIGHT_EYE_OUTER), toY(LANDMARKS.RIGHT_EYE_OUTER));
  ctx.lineTo(toX(LANDMARKS.LEFT_EYE_OUTER), toY(LANDMARKS.LEFT_EYE_OUTER));
  ctx.stroke();
  ctx.setLineDash([]);

  // Label Zona T
  const fontSize = Math.round(w * 0.018);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.textAlign = "center";
  ctx.fillText("Zona T", toX(LANDMARKS.NOSE_TIP), toY(LANDMARKS.NOSE_BRIDGE[1]) - 5);
}
