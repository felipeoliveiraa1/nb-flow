import type { FaceLandmarks } from "./face-landmarker";
import { LANDMARKS } from "./landmarks";

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function angleDeg(a: { x: number; y: number }, center: { x: number; y: number }, b: { x: number; y: number }) {
  const v1 = { x: a.x - center.x, y: a.y - center.y };
  const v2 = { x: b.x - center.x, y: b.y - center.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;
  return Math.abs(Math.atan2(cross, dot) * (180 / Math.PI));
}

// --- Tipos ---

export type LipShape = "fino" | "medio" | "cheio" | "coracao" | "largo";
export type LipTechnique = "volume" | "contorno" | "borda_infinita" | "lip_tint" | "equilibrio";

export interface LipAnalysis {
  // Medidas
  width: number;
  upperHeight: number;
  lowerHeight: number;
  totalHeight: number;
  upperLowerRatio: number;     // ideal ~0.5 a 0.7
  widthHeightRatio: number;

  // Arco de cupido
  cupidBowAngle: number;       // ideal ~130 graus
  cupidBowDepth: number;       // profundidade do arco

  // Simetria
  symmetryPercent: number;     // 0-100
  leftWidth: number;
  rightWidth: number;

  // Classificacao
  lipShape: LipShape;
  lipShapeLabel: string;

  // Recomendacao
  technique: LipTechnique;
  techniqueLabel: string;
  description: string;

  // Score
  flowScore: number;

  // Diagnosticos
  diagnostics: string[];
}

// --- Ideais ---
const IDEAL = {
  cupidBowAngle: 130,        // graus
  cupidBowAngleMin: 120,
  cupidBowAngleMax: 140,
  upperLowerRatio: 0.6,       // labio inferior ~1.6x o superior
  upperLowerRatioMin: 0.45,
  upperLowerRatioMax: 0.75,
  widthHeightRatio: 3.0,      // largura = 3x a altura
  symmetryMin: 92,
};

const SHAPE_LABELS: Record<LipShape, string> = {
  fino: "Fino",
  medio: "Medio",
  cheio: "Cheio",
  coracao: "Coracao",
  largo: "Largo",
};

const TECHNIQUE_LABELS: Record<LipTechnique, string> = {
  volume: "Flow Volume",
  contorno: "Flow Contorno",
  borda_infinita: "Flow Borda Infinita",
  lip_tint: "Flow Lip Tint",
  equilibrio: "Flow Equilibrio",
};

// --- Analise principal ---

export function analyzeLips(landmarks: FaceLandmarks): LipAnalysis {
  const lm = landmarks;

  const leftCorner = lm[LANDMARKS.LIP_LEFT_CORNER];
  const rightCorner = lm[LANDMARKS.LIP_RIGHT_CORNER];
  const upperCenter = lm[LANDMARKS.UPPER_LIP_CENTER];
  const lowerCenter = lm[LANDMARKS.LOWER_LIP_CENTER];
  const upperInner = lm[LANDMARKS.UPPER_LIP_INNER];
  const lowerInner = lm[LANDMARKS.LOWER_LIP_INNER];
  const cupidLeft = lm[LANDMARKS.CUPID_BOW_LEFT];
  const cupidRight = lm[LANDMARKS.CUPID_BOW_RIGHT];
  const cupidCenter = lm[LANDMARKS.CUPID_BOW_CENTER];
  const noseTip = lm[LANDMARKS.NOSE_TIP];

  // Midline para simetria
  const midX = noseTip.x;

  // --- Medidas ---
  const width = dist(leftCorner, rightCorner);
  const upperHeight = dist(upperCenter, upperInner);
  const lowerHeight = dist(lowerInner, lowerCenter);
  const totalHeight = dist(upperCenter, lowerCenter);
  const upperLowerRatio = upperHeight / Math.max(lowerHeight, 0.001);
  const widthHeightRatio = width / Math.max(totalHeight, 0.001);

  // --- Arco de cupido ---
  const cupidBowAngle = angleDeg(cupidLeft, cupidCenter, cupidRight);
  const cupidBaseline = (cupidLeft.y + cupidRight.y) / 2;
  const cupidBowDepth = (cupidBaseline - cupidCenter.y) / Math.max(width, 0.001) * 100;

  // --- Simetria ---
  const leftWidth = Math.abs(leftCorner.x - midX);
  const rightWidth = Math.abs(rightCorner.x - midX);
  const widthSym = 1 - Math.abs(leftWidth - rightWidth) / Math.max(leftWidth, rightWidth, 0.001);

  const upperLeftH = dist(cupidLeft, { x: cupidLeft.x, y: upperInner.y });
  const upperRightH = dist(cupidRight, { x: cupidRight.x, y: upperInner.y });
  const heightSym = 1 - Math.abs(upperLeftH - upperRightH) / Math.max(upperLeftH, upperRightH, 0.001);

  const symmetryPercent = Math.round(((widthSym + heightSym) / 2) * 100);

  // --- Classificacao ---
  let lipShape: LipShape;
  if (totalHeight / width < 0.22) lipShape = "fino";
  else if (totalHeight / width > 0.38) lipShape = "cheio";
  else if (cupidBowDepth > 5) lipShape = "coracao";
  else if (widthHeightRatio > 3.5) lipShape = "largo";
  else lipShape = "medio";

  // --- Tecnica recomendada ---
  let technique: LipTechnique;
  let description: string;

  if (lipShape === "fino") {
    technique = "volume";
    description = "Labios finos: tecnica de volume para criar plenitude natural. Preenchimento gradual do centro para as bordas com efeito lip tint.";
  } else if (lipShape === "coracao") {
    technique = "borda_infinita";
    description = "Labios coracao: tecnica borda infinita para suavizar o contorno e criar transicao difusa entre labio e pele. Preservar o arco de cupido.";
  } else if (lipShape === "largo") {
    technique = "contorno";
    description = "Labios largos: tecnica de contorno para definir bordas e criar ilusao de proporcao. Nao estender alem do contorno natural.";
  } else if (upperLowerRatio > 0.75) {
    technique = "equilibrio";
    description = "Labio superior proporcionalmente grande: tecnica de equilibrio para harmonizar com preenchimento sutil no labio inferior.";
  } else if (upperLowerRatio < 0.4) {
    technique = "equilibrio";
    description = "Labio inferior dominante: tecnica de equilibrio com preenchimento no labio superior e definicao do arco de cupido.";
  } else {
    technique = "lip_tint";
    description = "Labios proporcionais: tecnica lip tint para revitalizar cor e dar acabamento natural. Manter proporcoes existentes.";
  }

  // --- Diagnosticos ---
  const diagnostics: string[] = [];

  if (cupidBowAngle < IDEAL.cupidBowAngleMin) {
    diagnostics.push(`Arco de cupido fechado (${cupidBowAngle.toFixed(0)}°). Ideal: ${IDEAL.cupidBowAngle}° - suavizar para efeito mais natural`);
  } else if (cupidBowAngle > IDEAL.cupidBowAngleMax) {
    diagnostics.push(`Arco de cupido aberto (${cupidBowAngle.toFixed(0)}°). Ideal: ${IDEAL.cupidBowAngle}° - definir mais o arco`);
  }

  if (upperLowerRatio < IDEAL.upperLowerRatioMin) {
    diagnostics.push(`Labio superior muito fino (ratio ${upperLowerRatio.toFixed(2)}). Ideal: ${IDEAL.upperLowerRatio} - preencher labio superior`);
  } else if (upperLowerRatio > IDEAL.upperLowerRatioMax) {
    diagnostics.push(`Labio superior proporcionalmente grande (ratio ${upperLowerRatio.toFixed(2)}). Ideal: ${IDEAL.upperLowerRatio}`);
  }

  if (symmetryPercent < IDEAL.symmetryMin) {
    diagnostics.push(`Assimetria labial de ${100 - symmetryPercent}%. Trabalhar equalizacao`);
  }

  if (diagnostics.length === 0) {
    diagnostics.push("Labios dentro das proporcoes ideais. Manter e refinar com lip tint natural.");
  }

  // --- Score ---
  const cupidScore = Math.max(0, 100 - Math.abs(cupidBowAngle - IDEAL.cupidBowAngle) * 2);
  const ratioScore = Math.max(0, 100 - Math.abs(upperLowerRatio - IDEAL.upperLowerRatio) * 200);
  const flowScore = Math.round(
    Math.min(100, cupidScore * 0.3 + ratioScore * 0.3 + symmetryPercent * 0.4)
  );

  return {
    width: round(width * 100),
    upperHeight: round(upperHeight * 100),
    lowerHeight: round(lowerHeight * 100),
    totalHeight: round(totalHeight * 100),
    upperLowerRatio: round(upperLowerRatio),
    widthHeightRatio: round(widthHeightRatio),
    cupidBowAngle: round(cupidBowAngle),
    cupidBowDepth: round(cupidBowDepth),
    symmetryPercent,
    leftWidth: round(leftWidth * 100),
    rightWidth: round(rightWidth * 100),
    lipShape,
    lipShapeLabel: SHAPE_LABELS[lipShape],
    technique,
    techniqueLabel: TECHNIQUE_LABELS[technique],
    description,
    flowScore: Math.max(0, Math.min(100, flowScore)),
    diagnostics,
  };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
