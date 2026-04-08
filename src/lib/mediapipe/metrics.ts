import type { FaceLandmarks } from "./face-landmarker";
import { LANDMARKS } from "./landmarks";

// Distancia euclidiana 2D entre dois landmarks
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Ponto medio entre dois landmarks
function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export interface FaceMetrics {
  // Simetria (0-100, onde 100 = perfeitamente simetrico)
  overallSymmetry: number;
  eyebrowSymmetry: number;
  eyeSymmetry: number;
  lipSymmetry: number;

  // Proporcoes
  interocularDistance: number; // distancia entre olhos
  faceWidth: number;
  faceHeight: number;
  lipWidth: number;
  lipHeight: number;
  noseWidth: number;

  // Ratios
  goldenRatio: number; // proximidade da proporcao aurea
  eyeToFaceRatio: number;
  lipToFaceRatio: number;

  // Score geral (0-100)
  flowScore: number;
}

export function calculateMetrics(landmarks: FaceLandmarks): FaceMetrics {
  const lm = landmarks;

  // --- Distancias base ---
  const leftEyeInner = lm[LANDMARKS.LEFT_EYE_INNER];
  const rightEyeInner = lm[LANDMARKS.RIGHT_EYE_INNER];
  const leftEyeOuter = lm[LANDMARKS.LEFT_EYE_OUTER];
  const rightEyeOuter = lm[LANDMARKS.RIGHT_EYE_OUTER];
  const noseTip = lm[LANDMARKS.NOSE_TIP];
  const foreheadCenter = lm[LANDMARKS.FOREHEAD_CENTER];
  const chin = lm[LANDMARKS.CHIN];
  const lipLeft = lm[LANDMARKS.LIP_LEFT_CORNER];
  const lipRight = lm[LANDMARKS.LIP_RIGHT_CORNER];
  const upperLipCenter = lm[LANDMARKS.UPPER_LIP_CENTER];
  const lowerLipCenter = lm[LANDMARKS.LOWER_LIP_CENTER];

  // Face dimensions
  const faceHeight = dist(foreheadCenter, chin);
  const faceWidth = dist(lm[LANDMARKS.FACE_OVAL[8]], lm[LANDMARKS.FACE_OVAL[28]]);

  // Interocular
  const interocularDistance = dist(rightEyeInner, leftEyeInner);

  // Labios
  const lipWidth = dist(lipLeft, lipRight);
  const lipHeight = dist(upperLipCenter, lowerLipCenter);

  // Nariz
  const noseBottom = lm[LANDMARKS.NOSE_BOTTOM[0]];
  const noseWidth = dist(lm[LANDMARKS.NOSE_BOTTOM[1]], lm[LANDMARKS.NOSE_BOTTOM[2]]);

  // --- Simetria ---
  // Calcula usando a linha central (nariz) como eixo
  const midlineX = noseTip.x;

  // Simetria das sobrancelhas
  const leftBrowCenter = midpoint(
    lm[LANDMARKS.LEFT_EYEBROW_TOP[0]],
    lm[LANDMARKS.LEFT_EYEBROW_TOP[4]]
  );
  const rightBrowCenter = midpoint(
    lm[LANDMARKS.RIGHT_EYEBROW_TOP[0]],
    lm[LANDMARKS.RIGHT_EYEBROW_TOP[4]]
  );
  const leftBrowDist = Math.abs(leftBrowCenter.x - midlineX);
  const rightBrowDist = Math.abs(rightBrowCenter.x - midlineX);
  const leftBrowHeight = Math.abs(leftBrowCenter.y - noseTip.y);
  const rightBrowHeight = Math.abs(rightBrowCenter.y - noseTip.y);

  const eyebrowSymmetryX = 1 - Math.abs(leftBrowDist - rightBrowDist) / Math.max(leftBrowDist, rightBrowDist, 0.001);
  const eyebrowSymmetryY = 1 - Math.abs(leftBrowHeight - rightBrowHeight) / Math.max(leftBrowHeight, rightBrowHeight, 0.001);
  const eyebrowSymmetry = ((eyebrowSymmetryX + eyebrowSymmetryY) / 2) * 100;

  // Simetria dos olhos
  const leftEyeWidth = dist(leftEyeInner, leftEyeOuter);
  const rightEyeWidth = dist(rightEyeInner, rightEyeOuter);
  const eyeWidthSym = 1 - Math.abs(leftEyeWidth - rightEyeWidth) / Math.max(leftEyeWidth, rightEyeWidth, 0.001);

  const leftEyeDist = Math.abs(lm[LANDMARKS.LEFT_EYE[0]].x - midlineX);
  const rightEyeDist = Math.abs(lm[LANDMARKS.RIGHT_EYE[0]].x - midlineX);
  const eyePosSym = 1 - Math.abs(leftEyeDist - rightEyeDist) / Math.max(leftEyeDist, rightEyeDist, 0.001);
  const eyeSymmetry = ((eyeWidthSym + eyePosSym) / 2) * 100;

  // Simetria labial
  const lipLeftDist = Math.abs(lipLeft.x - midlineX);
  const lipRightDist = Math.abs(lipRight.x - midlineX);
  const lipSymmetry = (1 - Math.abs(lipLeftDist - lipRightDist) / Math.max(lipLeftDist, lipRightDist, 0.001)) * 100;

  // Simetria geral
  const overallSymmetry = eyebrowSymmetry * 0.3 + eyeSymmetry * 0.4 + lipSymmetry * 0.3;

  // --- Proporcoes ---
  const eyeToFaceRatio = interocularDistance / faceWidth;
  const lipToFaceRatio = lipWidth / faceWidth;

  // Proporcao aurea (1.618) - comparando segmentos do rosto
  const upperFace = dist(foreheadCenter, noseBottom); // testa ao nariz
  const lowerFace = dist(noseBottom, chin); // nariz ao queixo
  const faceRatio = upperFace / Math.max(lowerFace, 0.001);
  const goldenRatio = (1 - Math.abs(faceRatio - 1.618) / 1.618) * 100;

  // --- Score geral Flow ---
  const flowScore = Math.round(
    overallSymmetry * 0.4 +
    goldenRatio * 0.3 +
    clamp(eyeToFaceRatio / 0.28 * 100, 0, 100) * 0.15 + // ideal ~0.28
    clamp(lipToFaceRatio / 0.38 * 100, 0, 100) * 0.15    // ideal ~0.38
  );

  return {
    overallSymmetry: round(overallSymmetry),
    eyebrowSymmetry: round(eyebrowSymmetry),
    eyeSymmetry: round(eyeSymmetry),
    lipSymmetry: round(lipSymmetry),
    interocularDistance: round(interocularDistance * 100),
    faceWidth: round(faceWidth * 100),
    faceHeight: round(faceHeight * 100),
    lipWidth: round(lipWidth * 100),
    lipHeight: round(lipHeight * 100),
    noseWidth: round(noseWidth * 100),
    goldenRatio: round(goldenRatio),
    eyeToFaceRatio: round(eyeToFaceRatio * 100),
    lipToFaceRatio: round(lipToFaceRatio * 100),
    flowScore: clamp(flowScore, 0, 100),
  };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number) {
  return Math.round(Math.min(max, Math.max(min, n)));
}

export function getFlowRecommendation(metrics: FaceMetrics): string {
  const tips: string[] = [];

  if (metrics.eyebrowSymmetry < 85) {
    tips.push("Sobrancelhas com leve assimetria - tecnica de correcao com microblading pode harmonizar");
  }
  if (metrics.lipSymmetry < 85) {
    tips.push("Labios com assimetria sutil - preenchimento labial estrategico pode equilibrar");
  }
  if (metrics.goldenRatio < 70) {
    tips.push("Proporcoes faciais fora da razao aurea - contorno facial pode otimizar a harmonia");
  }
  if (metrics.eyeToFaceRatio * 100 < 24) {
    tips.push("Distancia interocular reduzida - tecnica de iluminacao nos cantos internos pode ampliar");
  }

  if (tips.length === 0) {
    tips.push("Excelente harmonia facial! Manter tecnicas de preservacao e realce natural");
  }

  return tips.join(". ") + ".";
}
