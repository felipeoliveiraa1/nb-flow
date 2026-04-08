// Analise de pele via Canvas API - Flow Peel / Shine Face
// Usa getImageData para analisar textura, manchas, oleosidade e uniformidade

import type { FaceLandmarks } from "../mediapipe/face-landmarker";
import { LANDMARKS } from "../mediapipe/landmarks";

export interface SkinRegionResult {
  name: string;
  uniformity: number;      // 0-100 (100 = uniforme)
  spots: number;           // 0-100 (0 = sem manchas)
  oiliness: number;        // 0-100 (0 = sem brilho)
  texture: number;         // 0-100 (100 = suave)
}

export interface SkinAnalysis {
  regions: SkinRegionResult[];
  overallScore: number;    // 0-100
  skinType: "seca" | "normal" | "mista" | "oleosa";
  skinTypeLabel: string;
  diagnostics: string[];
  technique: string;
  description: string;
  // Heatmap data (normalized 0-1 per pixel for rendering)
  heatmapData: { x: number; y: number; intensity: number }[];
}

// Extrai pixels de uma regiao poligonal da imagem
function getRegionPixels(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarks,
  indices: number[],
  w: number,
  h: number
): ImageData | null {
  const points = indices.map((i) => ({
    x: Math.round(landmarks[i].x * w),
    y: Math.round(landmarks[i].y * h),
  }));

  if (points.length < 3) return null;

  // Bounding box
  const minX = Math.max(0, Math.min(...points.map((p) => p.x)) - 2);
  const minY = Math.max(0, Math.min(...points.map((p) => p.y)) - 2);
  const maxX = Math.min(w, Math.max(...points.map((p) => p.x)) + 2);
  const maxY = Math.min(h, Math.max(...points.map((p) => p.y)) + 2);

  return ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
}

// Calcula luminancia de um pixel
function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Analisa uma regiao de pixels
function analyzeRegion(imageData: ImageData, name: string): SkinRegionResult {
  const { data, width, height } = imageData;
  const pixelCount = width * height;

  let lumSum = 0;
  let lumSqSum = 0;
  const lumValues: number[] = [];
  let brightPixels = 0;
  let edgeCount = 0;

  // Pass 1: calcular luminancia e estatisticas
  for (let i = 0; i < data.length; i += 4) {
    const lum = luminance(data[i], data[i + 1], data[i + 2]);
    lumValues.push(lum);
    lumSum += lum;
    lumSqSum += lum * lum;
    if (lum > 200) brightPixels++;
  }

  const avgLum = lumSum / pixelCount;
  const variance = lumSqSum / pixelCount - avgLum * avgLum;
  const stdDev = Math.sqrt(Math.max(0, variance));

  // Uniformidade: menor desvio padrao = mais uniforme
  const uniformity = Math.max(0, Math.min(100, 100 - stdDev * 2));

  // Manchas: pixels muito mais escuros que a media
  let spotPixels = 0;
  for (const lum of lumValues) {
    if (lum < avgLum - stdDev * 1.5) spotPixels++;
  }
  const spots = Math.min(100, (spotPixels / pixelCount) * 500);

  // Oleosidade: proporcao de pixels muito claros (brilho)
  const oiliness = Math.min(100, (brightPixels / pixelCount) * 300);

  // Textura: edge detection simplificado (diferenca entre pixels vizinhos)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const diff = Math.abs(lumValues[idx] - lumValues[idx - 1]) +
                   Math.abs(lumValues[idx] - lumValues[idx - width]);
      if (diff > 15) edgeCount++;
    }
  }
  const textureRoughness = (edgeCount / pixelCount) * 100;
  const texture = Math.max(0, Math.min(100, 100 - textureRoughness * 3));

  return { name, uniformity, spots, oiliness, texture };
}

// --- Analise principal ---

export function analyzeSkin(
  canvas: HTMLCanvasElement,
  landmarks: FaceLandmarks
): SkinAnalysis {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;

  const regions: SkinRegionResult[] = [];
  const heatmapData: SkinAnalysis["heatmapData"] = [];

  // Definir regioes por landmarks
  const regionDefs = [
    { name: "Testa", indices: [10, 338, 297, 332, 284, 251, 21, 54, 103, 67, 109] },
    { name: "Bochecha Esq.", indices: LANDMARKS.LEFT_CHEEK as unknown as number[] },
    { name: "Bochecha Dir.", indices: LANDMARKS.RIGHT_CHEEK as unknown as number[] },
    { name: "Zona T", indices: [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1] },
    { name: "Queixo", indices: [152, 148, 176, 149, 150, 136, 172, 58, 132] },
  ];

  for (const def of regionDefs) {
    const imgData = getRegionPixels(ctx, landmarks, def.indices, w, h);
    if (imgData) {
      const result = analyzeRegion(imgData, def.name);
      regions.push(result);

      // Gerar pontos de heatmap
      const centerX = def.indices.reduce((s, i) => s + landmarks[i].x, 0) / def.indices.length;
      const centerY = def.indices.reduce((s, i) => s + landmarks[i].y, 0) / def.indices.length;
      const intensity = (result.spots + result.oiliness + (100 - result.texture)) / 300;
      heatmapData.push({ x: centerX, y: centerY, intensity });
    }
  }

  // Score geral
  const avgUniformity = regions.reduce((s, r) => s + r.uniformity, 0) / regions.length;
  const avgSpots = regions.reduce((s, r) => s + r.spots, 0) / regions.length;
  const avgTexture = regions.reduce((s, r) => s + r.texture, 0) / regions.length;
  const avgOil = regions.reduce((s, r) => s + r.oiliness, 0) / regions.length;

  const overallScore = Math.round(
    avgUniformity * 0.3 + (100 - avgSpots) * 0.25 + avgTexture * 0.25 + (100 - avgOil) * 0.2
  );

  // Tipo de pele
  const tZone = regions.find((r) => r.name === "Zona T");
  const cheeks = regions.filter((r) => r.name.includes("Bochecha"));
  const tOil = tZone?.oiliness ?? 0;
  const cheekOil = cheeks.reduce((s, r) => s + r.oiliness, 0) / Math.max(cheeks.length, 1);

  let skinType: SkinAnalysis["skinType"];
  if (tOil > 50 && cheekOil > 40) skinType = "oleosa";
  else if (tOil > 40 && cheekOil < 30) skinType = "mista";
  else if (tOil < 20 && cheekOil < 20) skinType = "seca";
  else skinType = "normal";

  const skinTypeLabels = { seca: "Seca", normal: "Normal", mista: "Mista", oleosa: "Oleosa" };

  // Diagnosticos
  const diagnostics: string[] = [];

  if (avgSpots > 30) diagnostics.push(`Manchas detectadas (${avgSpots.toFixed(0)}%) - areas com pigmentacao irregular`);
  if (tOil > 50) diagnostics.push(`Zona T oleosa (${tOil.toFixed(0)}%) - brilho excessivo na testa e nariz`);
  if (avgTexture < 60) diagnostics.push(`Textura irregular (${avgTexture.toFixed(0)}%) - poros dilatados ou rugosidade`);
  if (avgUniformity < 70) diagnostics.push(`Tom de pele desuniforme (${avgUniformity.toFixed(0)}%) - variacao de cor entre regioes`);

  if (diagnostics.length === 0) {
    diagnostics.push("Pele com boa uniformidade, textura suave e sem manchas significativas.");
  }

  // Tecnica recomendada
  let technique: string;
  let description: string;

  if (avgSpots > 40) {
    technique = "Flow Peel Intensivo";
    description = "Manchas significativas detectadas. Mascara de carvao ativado + laser para estimular renovacao celular e uniformizar o tom.";
  } else if (avgTexture < 50) {
    technique = "Flow Peel Textura";
    description = "Textura irregular e poros dilatados. Peeling quimico suave + laser para refinamento da pele e reducao de poros.";
  } else if (skinType === "oleosa") {
    technique = "Shine Face Controle";
    description = "Pele oleosa com brilho excessivo. Tratamento de hidratacao oil-free + controle de oleosidade com acidos.";
  } else if (skinType === "seca") {
    technique = "Shine Face Hidratacao";
    description = "Pele seca que precisa de hidratacao profunda. Acido hialuronico + vitamina C para luminosidade e maciez.";
  } else {
    technique = "Shine Face Manutencao";
    description = "Pele em bom estado. Tratamento de manutencao com renovacao celular suave e hidratacao para manter a luminosidade.";
  }

  return {
    regions,
    overallScore,
    skinType,
    skinTypeLabel: skinTypeLabels[skinType],
    diagnostics,
    technique,
    description,
    heatmapData,
  };
}
