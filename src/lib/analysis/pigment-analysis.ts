// Analise de pigmento existente - Flow Removal
// Detecta micropigmentacao na regiao da sobrancelha via analise de cor

import type { FaceLandmarks } from "../mediapipe/face-landmarker";
import { LANDMARKS } from "../mediapipe/landmarks";

export interface PigmentAnalysis {
  // Metricas do pigmento
  density: number;           // 0-100 (% da area com pigmento)
  saturation: number;        // 0-100 (intensidade media do pigmento)
  colorConsistency: number;  // 0-100 (uniformidade da cor)
  dominantColor: string;     // hex da cor dominante
  colorCategory: "preto" | "marrom_escuro" | "marrom" | "marrom_claro" | "vermelho" | "outro";

  // Score de dificuldade
  removalDifficulty: number; // 0-100
  difficultyLabel: string;   // "Facil" | "Moderado" | "Dificil" | "Muito Dificil"
  estimatedSessions: number; // sessoes estimadas

  // Diagnosticos
  diagnostics: string[];

  // Mapa de intensidade para overlay
  pigmentMap: { x: number; y: number; intensity: number }[];
}

// Converte RGB para HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function analyzePigment(
  canvas: HTMLCanvasElement,
  landmarks: FaceLandmarks
): PigmentAnalysis {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;

  // Analisar ambas sobrancelhas
  const browRegions = [
    { top: LANDMARKS.RIGHT_EYEBROW_TOP, bottom: LANDMARKS.RIGHT_EYEBROW_BOTTOM },
    { top: LANDMARKS.LEFT_EYEBROW_TOP, bottom: LANDMARKS.LEFT_EYEBROW_BOTTOM },
  ];

  let totalPixels = 0;
  let pigmentedPixels = 0;
  let satSum = 0;
  let hueValues: number[] = [];
  const pigmentMap: PigmentAnalysis["pigmentMap"] = [];
  const colorSamples: { r: number; g: number; b: number }[] = [];

  for (const brow of browRegions) {
    // Bounding box da sobrancelha
    const allIdx = [...brow.top, ...brow.bottom];
    const points = allIdx.map((i) => ({
      x: Math.round(landmarks[i].x * w),
      y: Math.round(landmarks[i].y * h),
    }));

    const minX = Math.max(0, Math.min(...points.map((p) => p.x)) - 5);
    const minY = Math.max(0, Math.min(...points.map((p) => p.y)) - 5);
    const maxX = Math.min(w, Math.max(...points.map((p) => p.x)) + 5);
    const maxY = Math.min(h, Math.max(...points.map((p) => p.y)) + 5);

    const imgData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
    const data = imgData.data;
    const regionW = maxX - minX;
    const regionH = maxY - minY;

    // Amostrar a pele ao redor para referencia
    // Pegar pixels da testa (acima da sobrancelha) como referencia
    const skinRefY = Math.max(0, minY - 20);
    const skinRef = ctx.getImageData(minX, skinRefY, regionW, 10);
    let skinLumAvg = 0;
    let skinSatAvg = 0;
    const skinPixels = skinRef.width * skinRef.height;

    for (let i = 0; i < skinRef.data.length; i += 4) {
      skinLumAvg += luminance(skinRef.data[i], skinRef.data[i + 1], skinRef.data[i + 2]);
      const [, s] = rgbToHsl(skinRef.data[i], skinRef.data[i + 1], skinRef.data[i + 2]);
      skinSatAvg += s;
    }
    skinLumAvg /= skinPixels;
    skinSatAvg /= skinPixels;

    // Analisar cada pixel na regiao da sobrancelha
    for (let py = 0; py < regionH; py++) {
      for (let px = 0; px < regionW; px++) {
        const i = (py * regionW + px) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const lum = luminance(r, g, b);
        const [hue, sat] = rgbToHsl(r, g, b);

        totalPixels++;

        // Pixel e pigmentado se: significativamente mais escuro que a pele
        // OU tem saturacao muito diferente da pele natural
        const lumDiff = skinLumAvg - lum;
        const satDiff = Math.abs(sat - skinSatAvg);

        if (lumDiff > 20 || satDiff > 15) {
          pigmentedPixels++;
          satSum += sat;
          hueValues.push(hue);
          colorSamples.push({ r, g, b });

          // Adicionar ao mapa
          if (px % 3 === 0 && py % 3 === 0) {
            pigmentMap.push({
              x: (minX + px) / w,
              y: (minY + py) / h,
              intensity: Math.min(1, lumDiff / 80),
            });
          }
        }
      }
    }
  }

  // Calcular metricas
  const density = totalPixels > 0 ? (pigmentedPixels / totalPixels) * 100 : 0;
  const avgSat = pigmentedPixels > 0 ? satSum / pigmentedPixels : 0;
  const saturation = Math.min(100, avgSat * 2);

  // Consistencia de cor (menor variancia de hue = mais consistente)
  let hueVariance = 0;
  if (hueValues.length > 1) {
    const avgHue = hueValues.reduce((s, v) => s + v, 0) / hueValues.length;
    hueVariance = hueValues.reduce((s, v) => s + (v - avgHue) ** 2, 0) / hueValues.length;
  }
  const colorConsistency = Math.max(0, Math.min(100, 100 - Math.sqrt(hueVariance) * 2));

  // Cor dominante
  let avgR = 0, avgG = 0, avgB = 0;
  for (const c of colorSamples) {
    avgR += c.r; avgG += c.g; avgB += c.b;
  }
  const n = Math.max(colorSamples.length, 1);
  avgR = Math.round(avgR / n);
  avgG = Math.round(avgG / n);
  avgB = Math.round(avgB / n);
  const dominantColor = `#${avgR.toString(16).padStart(2, "0")}${avgG.toString(16).padStart(2, "0")}${avgB.toString(16).padStart(2, "0")}`;

  // Categoria de cor
  const [domHue, domSat, domLum] = rgbToHsl(avgR, avgG, avgB);
  let colorCategory: PigmentAnalysis["colorCategory"];
  if (domLum < 20) colorCategory = "preto";
  else if (domLum < 35 && domSat < 40) colorCategory = "marrom_escuro";
  else if (domHue > 0 && domHue < 30 && domSat > 50) colorCategory = "vermelho";
  else if (domLum < 50) colorCategory = "marrom";
  else colorCategory = "marrom_claro";

  // Score de dificuldade
  const densityScore = density * 0.3;
  const satScore = saturation * 0.25;
  const colorScore = (colorCategory === "vermelho" ? 80 : colorCategory === "preto" ? 60 : 40) * 0.25;
  const consistencyPenalty = (100 - colorConsistency) * 0.2;
  const removalDifficulty = Math.round(Math.min(100, densityScore + satScore + colorScore + consistencyPenalty));

  let difficultyLabel: string;
  let estimatedSessions: number;
  if (removalDifficulty < 30) { difficultyLabel = "Facil"; estimatedSessions = 2; }
  else if (removalDifficulty < 55) { difficultyLabel = "Moderado"; estimatedSessions = 4; }
  else if (removalDifficulty < 75) { difficultyLabel = "Dificil"; estimatedSessions = 6; }
  else { difficultyLabel = "Muito Dificil"; estimatedSessions = 8; }

  // Diagnosticos
  const diagnostics: string[] = [];

  if (density > 60) diagnostics.push(`Pigmento denso (${density.toFixed(0)}% da area) - maior numero de sessoes necessario`);
  else if (density > 30) diagnostics.push(`Pigmento moderado (${density.toFixed(0)}% da area)`);
  else if (density > 5) diagnostics.push(`Pigmento esparso/desbotado (${density.toFixed(0)}%) - remocao mais rapida`);
  else diagnostics.push("Pouco ou nenhum pigmento detectado na regiao");

  if (colorCategory === "vermelho") diagnostics.push("Pigmento avermelhado detectado - cores quentes sao mais dificeis de remover");
  if (colorCategory === "preto") diagnostics.push("Pigmento preto/escuro - responde bem ao laser");
  if (colorConsistency < 60) diagnostics.push(`Cor inconsistente (${colorConsistency.toFixed(0)}%) - pode indicar trabalho antigo com retoques`);
  if (saturation > 70) diagnostics.push("Pigmento ainda saturado - provavelmente recente");

  return {
    density: Math.round(density),
    saturation: Math.round(saturation),
    colorConsistency: Math.round(colorConsistency),
    dominantColor,
    colorCategory,
    removalDifficulty,
    difficultyLabel,
    estimatedSessions,
    diagnostics,
    pigmentMap,
  };
}
