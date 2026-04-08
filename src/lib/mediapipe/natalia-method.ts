import type { FaceLandmarks } from "./face-landmarker";
import { LANDMARKS } from "./landmarks";

// ============================================================
// METODO NATALIA - Regras de sobrancelha baseadas na metodologia
// ============================================================
// Landmarks de referencia:
//   Inicio: 70 (dir) / 300 (esq)
//   Corpo:  63→66 (dir) / 293→296 (esq)
//   Arco:   66 (dir) / 296 (esq) → +5% a +10% acima da base
//   Final:  55 (dir) / 285 (esq) → 10° a 15° descendente
//   Gradiente: 40% inicio → 100% meio → 70% final
// ============================================================

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function angleDeg(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

// --- Parametros ideais Natalia ---
const IDEAL = {
  archHeightPercent: 8,         // +8% acima da linha base
  archHeightMin: 5,             // minimo +5%
  archHeightMax: 10,            // maximo +10%
  endAngleIdeal: 12,            // graus descendente
  endAngleMin: 10,
  endAngleMax: 15,
  widthToEyeRatio: 2.5,        // largura total = 2.5x largura do olho
  thicknessToEyeRatio: 1.2,    // espessura = 1.2x altura do olho
  maxSymmetryDiff: 3,           // maximo 3% diferenca entre lados
  gradient: { start: 0.4, middle: 1.0, end: 0.7 },
} as const;

// --- Analise de uma sobrancelha ---

export interface BrowAnalysis {
  // Medidas atuais
  startX: number;
  archHeight: number;         // % acima da base
  endAngle: number;           // graus de inclinacao do final
  totalWidth: number;
  thickness: number;
  widthToEyeRatio: number;

  // Diagnostico (diferenca do ideal)
  archDiff: number;           // positivo = muito alto, negativo = muito baixo
  angleDiff: number;          // positivo = muito caido, negativo = muito reto
  widthDiff: number;          // positivo = muito larga, negativo = muito curta

  // Status por zona
  startStatus: "ok" | "muito_quadrado" | "muito_afastado" | "muito_junto";
  archStatus: "ok" | "muito_alto" | "muito_baixo" | "ausente";
  endStatus: "ok" | "muito_caido" | "muito_reto" | "muito_curto";
  thicknessStatus: "ok" | "muito_fino" | "muito_grosso";
}

function analyzeBrow(
  lm: FaceLandmarks,
  side: "left" | "right"
): BrowAnalysis {
  // Landmarks por lado
  const startIdx = side === "right" ? 70 : 300;
  const archIdx = side === "right" ? 66 : 296;
  const endIdx = side === "right" ? 55 : 285;
  const bodyStart = side === "right" ? 63 : 293;
  const bodyEnd = side === "right" ? 66 : 296;

  // Landmarks do olho para proporcao
  const eyeIndices = side === "right" ? LANDMARKS.RIGHT_EYE : LANDMARKS.LEFT_EYE;
  const eyeTop = lm[eyeIndices[Math.floor(eyeIndices.length * 0.25)]];
  const eyeBottom = lm[eyeIndices[Math.floor(eyeIndices.length * 0.75)]];
  const eyeLeft = lm[eyeIndices[0]];
  const eyeRight = lm[eyeIndices[Math.floor(eyeIndices.length / 2)]];

  // Landmark da narina para validacao do inicio
  const nostrilIdx = side === "right" ? 98 : 327;

  const start = lm[startIdx];
  const arch = lm[archIdx];
  const end = lm[endIdx];
  const body1 = lm[bodyStart];
  const body2 = lm[bodyEnd];
  const nostril = lm[nostrilIdx];

  // Medidas do olho
  const eyeWidth = dist(eyeLeft, eyeRight);
  const eyeHeight = dist(eyeTop, eyeBottom);

  // --- Largura total da sobrancelha ---
  const totalWidth = dist(start, end);
  const widthToEyeRatio = totalWidth / eyeWidth;

  // --- Espessura (media do corpo) ---
  // Aproxima usando distancia vertical entre pontos do arco superior e inferior
  const topIdx = side === "right" ? LANDMARKS.RIGHT_EYEBROW_TOP : LANDMARKS.LEFT_EYEBROW_TOP;
  const botIdx = side === "right" ? LANDMARKS.RIGHT_EYEBROW_BOTTOM : LANDMARKS.LEFT_EYEBROW_BOTTOM;
  const midTop = lm[topIdx[2]]; // ponto medio do arco
  const midBot = lm[botIdx[2]]; // ponto medio inferior
  const thickness = dist(midTop, midBot);
  const thicknessToEye = thickness / eyeHeight;

  // --- Altura do arco ---
  // Linha base = reta do inicio ao final
  // Arco = distancia perpendicular do ponto mais alto a essa reta
  const baselineY = start.y + ((arch.x - start.x) / (end.x - start.x)) * (end.y - start.y);
  const archDeviation = baselineY - arch.y; // positivo = arco esta acima da base
  const baselineLength = dist(start, end);
  const archHeight = (archDeviation / baselineLength) * 100;

  // --- Angulo do final ---
  // Angulo entre o arco e o final (descendente)
  const rawAngle = angleDeg(arch, end);
  // Normalizar: 0° = horizontal, positivo = descendente
  const endAngle = Math.abs(rawAngle);

  // --- Validacao do inicio (alinhamento com narina) ---
  const startNostrilDiff = Math.abs(start.x - nostril.x) / eyeWidth;
  let startStatus: BrowAnalysis["startStatus"] = "ok";
  if (startNostrilDiff > 0.15) {
    startStatus = start.x > nostril.x === (side === "right")
      ? "muito_afastado"
      : "muito_junto";
  }

  // --- Diagnosticos ---
  const archDiff = archHeight - IDEAL.archHeightPercent;
  let archStatus: BrowAnalysis["archStatus"] = "ok";
  if (archHeight < 2) archStatus = "ausente";
  else if (archHeight < IDEAL.archHeightMin) archStatus = "muito_baixo";
  else if (archHeight > IDEAL.archHeightMax) archStatus = "muito_alto";

  const angleDiff = endAngle - IDEAL.endAngleIdeal;
  let endStatus: BrowAnalysis["endStatus"] = "ok";
  if (endAngle > IDEAL.endAngleMax + 5) endStatus = "muito_caido";
  else if (endAngle < IDEAL.endAngleMin - 3) endStatus = "muito_reto";

  const widthDiff = widthToEyeRatio - IDEAL.widthToEyeRatio;

  let thicknessStatus: BrowAnalysis["thicknessStatus"] = "ok";
  if (thicknessToEye < IDEAL.thicknessToEyeRatio * 0.7) thicknessStatus = "muito_fino";
  else if (thicknessToEye > IDEAL.thicknessToEyeRatio * 1.4) thicknessStatus = "muito_grosso";

  return {
    startX: start.x,
    archHeight,
    endAngle,
    totalWidth,
    thickness,
    widthToEyeRatio,
    archDiff,
    angleDiff,
    widthDiff,
    startStatus,
    archStatus,
    endStatus,
    thicknessStatus,
  };
}

// --- Analise completa (ambos lados) ---

export interface NataliaAnalysis {
  left: BrowAnalysis;
  right: BrowAnalysis;
  symmetryPercent: number;        // 0-100, 100 = perfeito
  overallScore: number;           // 0-100
  diagnostics: string[];          // lista de observacoes
  idealGuide: IdealGuidePoints;   // pontos para desenhar o guia ideal
}

export interface IdealGuidePoints {
  left: { start: { x: number; y: number }; arch: { x: number; y: number }; end: { x: number; y: number } };
  right: { start: { x: number; y: number }; arch: { x: number; y: number }; end: { x: number; y: number } };
}

export function analyzeNataliaMethod(landmarks: FaceLandmarks): NataliaAnalysis {
  const left = analyzeBrow(landmarks, "left");
  const right = analyzeBrow(landmarks, "right");

  // Simetria
  const archSymmetry = 100 - Math.abs(left.archHeight - right.archHeight) * 10;
  const angleSymmetry = 100 - Math.abs(left.endAngle - right.endAngle) * 5;
  const widthSymmetry = 100 - Math.abs(left.widthToEyeRatio - right.widthToEyeRatio) * 20;
  const symmetryPercent = Math.round(
    Math.max(0, Math.min(100, (archSymmetry + angleSymmetry + widthSymmetry) / 3))
  );

  // Score geral
  const archScore = Math.max(0, 100 - Math.abs(left.archDiff) * 8 - Math.abs(right.archDiff) * 8);
  const angleScore = Math.max(0, 100 - Math.abs(left.angleDiff) * 5 - Math.abs(right.angleDiff) * 5);
  const overallScore = Math.round(
    Math.max(0, Math.min(100,
      archScore * 0.3 + angleScore * 0.3 + symmetryPercent * 0.4
    ))
  );

  // Diagnosticos
  const diagnostics: string[] = [];

  // Sobrancelha direita
  if (right.startStatus !== "ok") {
    const msg = right.startStatus === "muito_quadrado"
      ? "Inicio da sobrancelha direita muito quadrado - suavizar com leve inclinacao pra dentro"
      : right.startStatus === "muito_afastado"
        ? "Inicio da sobrancelha direita muito afastado da narina"
        : "Inicio da sobrancelha direita muito junto ao nariz";
    diagnostics.push(msg);
  }
  if (right.archStatus === "muito_baixo") {
    diagnostics.push(`Arco direito baixo (${right.archHeight.toFixed(1)}%). Ideal: +${IDEAL.archHeightPercent}% para efeito lifting`);
  } else if (right.archStatus === "muito_alto") {
    diagnostics.push(`Arco direito alto demais (${right.archHeight.toFixed(1)}%). Suavizar para evitar cara de "desenhada"`);
  } else if (right.archStatus === "ausente") {
    diagnostics.push("Arco direito quase ausente. Criar elevacao de +5% a +8% para efeito lifting natural");
  }
  if (right.endStatus === "muito_caido") {
    diagnostics.push(`Final direito muito caido (${right.endAngle.toFixed(0)}°). Ideal: ${IDEAL.endAngleIdeal}° - evitar cara triste`);
  } else if (right.endStatus === "muito_reto") {
    diagnostics.push(`Final direito muito reto (${right.endAngle.toFixed(0)}°). Ideal: ${IDEAL.endAngleIdeal}° descendente`);
  }
  if (right.thicknessStatus === "muito_fino") {
    diagnostics.push("Sobrancelha direita fina demais. Ideal: espessura = 1.2x altura do olho");
  }

  // Sobrancelha esquerda
  if (left.startStatus !== "ok") {
    const msg = left.startStatus === "muito_quadrado"
      ? "Inicio da sobrancelha esquerda muito quadrado"
      : left.startStatus === "muito_afastado"
        ? "Inicio da sobrancelha esquerda muito afastado"
        : "Inicio da sobrancelha esquerda muito junto";
    diagnostics.push(msg);
  }
  if (left.archStatus === "muito_baixo") {
    diagnostics.push(`Arco esquerdo baixo (${left.archHeight.toFixed(1)}%). Ideal: +${IDEAL.archHeightPercent}%`);
  } else if (left.archStatus === "muito_alto") {
    diagnostics.push(`Arco esquerdo alto demais (${left.archHeight.toFixed(1)}%)`);
  } else if (left.archStatus === "ausente") {
    diagnostics.push("Arco esquerdo quase ausente. Criar elevacao de +5% a +8%");
  }
  if (left.endStatus === "muito_caido") {
    diagnostics.push(`Final esquerdo muito caido (${left.endAngle.toFixed(0)}°). Ideal: ${IDEAL.endAngleIdeal}°`);
  }
  if (left.thicknessStatus === "muito_fino") {
    diagnostics.push("Sobrancelha esquerda fina demais");
  }

  // Simetria
  if (symmetryPercent < 90) {
    diagnostics.push(`Assimetria de ${100 - symmetryPercent}% entre as sobrancelhas. Ideal: < ${IDEAL.maxSymmetryDiff}% de diferenca`);
  }

  if (diagnostics.length === 0) {
    diagnostics.push("Sobrancelhas dentro do padrao Natalia! Manter e refinar gradiente (40% → 100% → 70%)");
  }

  // Calcular pontos do guia ideal
  const idealGuide = calculateIdealGuide(landmarks);

  return {
    left,
    right,
    symmetryPercent,
    overallScore,
    diagnostics,
    idealGuide,
  };
}

// --- Calcula onde a sobrancelha IDEAL deveria estar ---

function calculateIdealGuide(lm: FaceLandmarks): IdealGuidePoints {
  function calcSide(side: "left" | "right") {
    const nostrilIdx = side === "right" ? 98 : 327;
    const archIdx = side === "right" ? 66 : 296;
    const startIdx = side === "right" ? 70 : 300;
    const endIdx = side === "right" ? 55 : 285;

    const currentStart = lm[startIdx];
    const currentArch = lm[archIdx];
    const currentEnd = lm[endIdx];
    const nostril = lm[nostrilIdx];

    // Inicio ideal: alinhado com narina, mesmo Y que o atual
    const idealStart = { x: nostril.x, y: currentStart.y };

    // Arco ideal: mesma posicao X, +8% acima da baseline
    const baselineY = idealStart.y + ((currentArch.x - idealStart.x) / (currentEnd.x - idealStart.x)) * (currentEnd.y - idealStart.y);
    const baseLength = dist(idealStart, currentEnd);
    const idealArchY = baselineY - (baseLength * IDEAL.archHeightPercent / 100);
    const idealArch = { x: currentArch.x, y: idealArchY };

    // Final ideal: angulo de 12° descendente a partir do arco
    const angleRad = (IDEAL.endAngleIdeal * Math.PI) / 180;
    const endDist = dist(currentArch, currentEnd);
    const direction = side === "right" ? -1 : 1;
    const idealEnd = {
      x: currentEnd.x,
      y: idealArch.y + Math.sin(angleRad) * endDist,
    };

    return { start: idealStart, arch: idealArch, end: idealEnd };
  }

  return {
    left: calcSide("left"),
    right: calcSide("right"),
  };
}
