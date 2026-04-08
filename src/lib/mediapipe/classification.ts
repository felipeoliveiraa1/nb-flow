import type { FaceLandmarks } from "./face-landmarker";
import { LANDMARKS } from "./landmarks";

// --- Tipos ---

export type FaceShape = "oval" | "redondo" | "quadrado" | "coracao" | "longo";
export type EyebrowShape = "reta" | "arqueada" | "angulada" | "curva" | "descendente";
export type EyeSpacing = "juntos" | "normal" | "afastados";
export type LipType = "fino" | "medio" | "cheio";
export type ForeheadType = "baixa" | "media" | "alta";

export interface FaceClassification {
  faceShape: FaceShape;
  eyebrowShapeLeft: EyebrowShape;
  eyebrowShapeRight: EyebrowShape;
  eyeSpacing: EyeSpacing;
  lipType: LipType;
  foreheadType: ForeheadType;
}

// --- Helpers ---

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// --- Classificadores ---

function classifyFaceShape(lm: FaceLandmarks): FaceShape {
  const forehead = lm[LANDMARKS.FOREHEAD_CENTER];
  const chin = lm[LANDMARKS.CHIN];
  const faceHeight = dist(forehead, chin);

  // Largura na altura das bochechas (pontos do oval)
  const cheekLeft = lm[LANDMARKS.FACE_OVAL[8]];
  const cheekRight = lm[LANDMARKS.FACE_OVAL[28]];
  const faceWidth = dist(cheekLeft, cheekRight);

  // Largura na testa
  const templeLeft = lm[LANDMARKS.FACE_OVAL[3]];
  const templeRight = lm[LANDMARKS.FACE_OVAL[33]];
  const foreheadWidth = dist(templeLeft, templeRight);

  // Largura na mandibula
  const jawLeft = lm[LANDMARKS.FACE_OVAL[12]];
  const jawRight = lm[LANDMARKS.FACE_OVAL[24]];
  const jawWidth = dist(jawLeft, jawRight);

  const ratio = faceHeight / faceWidth;
  const foreheadToJaw = foreheadWidth / jawWidth;

  if (ratio > 1.5) return "longo";
  if (ratio < 1.15) return "redondo";
  if (foreheadToJaw > 1.2 && jawWidth < faceWidth * 0.85) return "coracao";
  if (Math.abs(foreheadWidth - jawWidth) < faceWidth * 0.08) return "quadrado";
  return "oval";
}

function classifyEyebrow(lm: FaceLandmarks, topIndices: readonly number[]): EyebrowShape {
  // Pegamos os 5 pontos do arco superior
  const points = topIndices.map((i) => lm[i]);

  // Ponto mais alto vs extremidades
  const start = points[0];
  const end = points[points.length - 1];
  const baseline = (start.y + end.y) / 2;

  // Encontrar o ponto mais alto (menor Y = mais alto na tela)
  let highestIdx = 0;
  let highestY = points[0].y;
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < highestY) {
      highestY = points[i].y;
      highestIdx = i;
    }
  }

  const archHeight = baseline - highestY; // quanto o arco sobe
  const totalWidth = dist(start, end);
  const archRatio = archHeight / totalWidth;

  // Posicao do pico (0 = inicio, 1 = fim)
  const peakPosition = highestIdx / (points.length - 1);

  // Inclinacao geral (start.y vs end.y)
  const slope = end.y - start.y;

  if (archRatio < 0.03) return "reta";
  if (slope > totalWidth * 0.08) return "descendente";
  if (peakPosition > 0.55 && archRatio > 0.08) return "angulada";
  if (archRatio > 0.12) return "arqueada";
  return "curva";
}

function classifyEyeSpacing(lm: FaceLandmarks): EyeSpacing {
  const leftInner = lm[LANDMARKS.LEFT_EYE_INNER];
  const rightInner = lm[LANDMARKS.RIGHT_EYE_INNER];
  const leftOuter = lm[LANDMARKS.LEFT_EYE_OUTER];
  const rightOuter = lm[LANDMARKS.RIGHT_EYE_OUTER];

  const interocular = dist(rightInner, leftInner);
  const leftEyeWidth = dist(lm[LANDMARKS.LEFT_EYE[0]], lm[LANDMARKS.LEFT_EYE[8]]);
  const rightEyeWidth = dist(lm[LANDMARKS.RIGHT_EYE[0]], lm[LANDMARKS.RIGHT_EYE[8]]);
  const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;

  // Regra classica: distancia entre olhos ≈ largura de 1 olho
  const ratio = interocular / avgEyeWidth;

  if (ratio < 0.85) return "juntos";
  if (ratio > 1.15) return "afastados";
  return "normal";
}

function classifyLipType(lm: FaceLandmarks): LipType {
  const lipWidth = dist(lm[LANDMARKS.LIP_LEFT_CORNER], lm[LANDMARKS.LIP_RIGHT_CORNER]);
  const lipHeight = dist(lm[LANDMARKS.UPPER_LIP_CENTER], lm[LANDMARKS.LOWER_LIP_CENTER]);
  const ratio = lipHeight / lipWidth;

  if (ratio < 0.18) return "fino";
  if (ratio > 0.3) return "cheio";
  return "medio";
}

function classifyForehead(lm: FaceLandmarks): ForeheadType {
  const forehead = lm[LANDMARKS.FOREHEAD_CENTER];
  const browCenter = lm[LANDMARKS.RIGHT_EYEBROW_TOP[2]]; // meio da sobrancelha
  const chin = lm[LANDMARKS.CHIN];

  const foreheadHeight = dist(forehead, browCenter);
  const faceHeight = dist(forehead, chin);
  const ratio = foreheadHeight / faceHeight;

  if (ratio < 0.28) return "baixa";
  if (ratio > 0.38) return "alta";
  return "media";
}

// --- Funcao principal ---

export function classifyFace(landmarks: FaceLandmarks): FaceClassification {
  return {
    faceShape: classifyFaceShape(landmarks),
    eyebrowShapeLeft: classifyEyebrow(landmarks, LANDMARKS.LEFT_EYEBROW_TOP),
    eyebrowShapeRight: classifyEyebrow(landmarks, LANDMARKS.RIGHT_EYEBROW_TOP),
    eyeSpacing: classifyEyeSpacing(landmarks),
    lipType: classifyLipType(landmarks),
    foreheadType: classifyForehead(landmarks),
  };
}
