// Overlay ao vivo para Flow Removal - detecta pigmento nas sobrancelhas em tempo real

import type { FaceLandmarks } from "../mediapipe/face-landmarker";
import { LANDMARKS } from "../mediapipe/landmarks";

const PINK = "#FD7F99";
const GREEN = "rgba(34, 197, 94, 0.8)";
const YELLOW = "rgba(234, 179, 8, 0.8)";
const ORANGE = "rgba(249, 115, 22, 0.8)";
const RED = "rgba(239, 68, 68, 0.8)";
const WHITE = "rgba(255, 255, 255, 0.7)";
const GOLD = "#D4AF37";

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  }
  return [0, s * 100, l * 100];
}

interface BrowRegion {
  label: string;
  top: readonly number[];
  bottom: readonly number[];
}

const BROW_REGIONS: BrowRegion[] = [
  { label: "Dir.", top: LANDMARKS.RIGHT_EYEBROW_TOP, bottom: LANDMARKS.RIGHT_EYEBROW_BOTTOM },
  { label: "Esq.", top: LANDMARKS.LEFT_EYEBROW_TOP, bottom: LANDMARKS.LEFT_EYEBROW_BOTTOM },
];

export function drawPigmentOverlay(ctx: CanvasRenderingContext2D, lm: FaceLandmarks, w: number, h: number) {
  const toX = (i: number) => lm[i].x * w;
  const toY = (i: number) => lm[i].y * h;

  for (const brow of BROW_REGIONS) {
    // Desenhar contorno da sobrancelha
    ctx.beginPath();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (const indices of [brow.top, brow.bottom]) {
      ctx.moveTo(toX(indices[0]), toY(indices[0]));
      for (let i = 1; i < indices.length; i++) ctx.lineTo(toX(indices[i]), toY(indices[i]));
    }
    ctx.stroke();

    // Bounding box
    const allIdx = [...brow.top, ...brow.bottom];
    const points = allIdx.map((i) => ({ x: toX(i), y: toY(i) }));
    const minX = Math.max(0, Math.min(...points.map((p) => p.x)) - 5);
    const minY = Math.max(0, Math.min(...points.map((p) => p.y)) - 5);
    const maxX = Math.min(w, Math.max(...points.map((p) => p.x)) + 5);
    const maxY = Math.min(h, Math.max(...points.map((p) => p.y)) + 5);

    let imgData: ImageData;
    try {
      imgData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
    } catch {
      continue;
    }

    // Referencia de pele (acima da sobrancelha)
    const skinRefY = Math.max(0, minY - 20);
    let skinRef: ImageData;
    try {
      skinRef = ctx.getImageData(minX, skinRefY, maxX - minX, Math.min(10, minY - skinRefY));
    } catch {
      continue;
    }

    let skinLumAvg = 0;
    const skinPixels = skinRef.width * skinRef.height;
    for (let i = 0; i < skinRef.data.length; i += 4) {
      skinLumAvg += luminance(skinRef.data[i], skinRef.data[i + 1], skinRef.data[i + 2]);
    }
    skinLumAvg /= Math.max(skinPixels, 1);

    // Analisar pigmento
    const data = imgData.data;
    const regionW = imgData.width;
    const regionH = imgData.height;
    let pigmentedCount = 0;
    let totalCount = regionW * regionH;
    let satSum = 0;

    for (let py = 0; py < regionH; py++) {
      for (let px = 0; px < regionW; px++) {
        const i = (py * regionW + px) * 4;
        const lum = luminance(data[i], data[i + 1], data[i + 2]);
        const [, sat] = rgbToHsl(data[i], data[i + 1], data[i + 2]);

        if (skinLumAvg - lum > 20 || sat > 25) {
          pigmentedCount++;
          satSum += sat;

          // Colorir pixel pigmentado no canvas (heatmap)
          const intensity = Math.min(1, (skinLumAvg - lum) / 80);
          if (intensity > 0.2 && px % 2 === 0 && py % 2 === 0) {
            const r = Math.round(253 * intensity);
            const g = Math.round(80 * (1 - intensity));
            const b = Math.round(50);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
            ctx.fillRect(minX + px, minY + py, 2, 2);
          }
        }
      }
    }

    const density = (pigmentedCount / Math.max(totalCount, 1)) * 100;
    const avgSat = pigmentedCount > 0 ? satSum / pigmentedCount : 0;
    const saturation = Math.min(100, avgSat * 2);

    // Score de dificuldade
    const difficulty = Math.round(Math.min(100, density * 0.5 + saturation * 0.5));

    // Cor baseada na dificuldade
    let diffColor: string;
    let diffLabel: string;
    if (difficulty < 25) { diffColor = GREEN; diffLabel = "Facil"; }
    else if (difficulty < 50) { diffColor = YELLOW; diffLabel = "Moderado"; }
    else if (difficulty < 70) { diffColor = ORANGE; diffLabel = "Dificil"; }
    else { diffColor = RED; diffLabel = "Muito dificil"; }

    // Labels
    const centerX = (minX + maxX) / 2;
    const labelY = minY - 8;
    const fontSize = Math.round(w * 0.025);

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = diffColor;
    ctx.textAlign = "center";
    ctx.fillText(`${brow.label} ${diffLabel}`, centerX, labelY);

    ctx.font = `${Math.round(fontSize * 0.75)}px sans-serif`;
    ctx.fillStyle = WHITE;
    ctx.fillText(`Dens: ${density.toFixed(0)}% | Sat: ${saturation.toFixed(0)}%`, centerX, labelY + fontSize);
  }

  // Pontos chave
  const keyIdx = [70, 66, 55, 300, 296, 285];
  for (const idx of keyIdx) {
    ctx.beginPath();
    ctx.arc(toX(idx), toY(idx), 3, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
