// Indices dos landmarks relevantes do MediaPipe Face Landmarker (468 pontos)
// Referencia: https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png

export const LANDMARKS = {
  // Sobrancelha esquerda - arco superior (do ponto de vista da pessoa)
  LEFT_EYEBROW_TOP: [336, 296, 334, 293, 300],
  // Sobrancelha esquerda - borda inferior
  LEFT_EYEBROW_BOTTOM: [276, 283, 282, 295, 285],
  // Sobrancelha esquerda completa (para metricas)
  LEFT_EYEBROW: [336, 296, 334, 293, 300, 285, 295, 282, 283, 276],

  // Sobrancelha direita - arco superior
  RIGHT_EYEBROW_TOP: [70, 63, 105, 66, 107],
  // Sobrancelha direita - borda inferior
  RIGHT_EYEBROW_BOTTOM: [46, 53, 52, 65, 55],
  // Sobrancelha direita completa (para metricas)
  RIGHT_EYEBROW: [107, 66, 105, 63, 70, 46, 53, 52, 65, 55],

  // Olho esquerdo (contorno completo 16 pontos)
  LEFT_EYE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  LEFT_EYE_CENTER: [468], // iris center (se disponivel)
  // Olho direito (contorno completo 16 pontos)
  RIGHT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  RIGHT_EYE_CENTER: [473], // iris center

  // Canto interno dos olhos (para distancia interocular)
  LEFT_EYE_INNER: 362,
  RIGHT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 263,
  RIGHT_EYE_OUTER: 33,

  // Nariz
  NOSE_TIP: 1,
  NOSE_BRIDGE: [6, 197, 195, 5],
  NOSE_BOTTOM: [2, 98, 327],

  // Labios - contorno externo
  UPPER_LIP: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  LOWER_LIP: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  // Labios - contorno completo (40 pontos)
  UPPER_LIP_FULL: [185, 40, 39, 37, 0, 267, 269, 270, 409, 415, 310, 311, 312, 13, 82, 81, 42, 183, 78],
  LOWER_LIP_FULL: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95],
  // Pontos chave labios
  LIP_LEFT_CORNER: 61,
  LIP_RIGHT_CORNER: 291,
  UPPER_LIP_CENTER: 0,
  LOWER_LIP_CENTER: 17,
  // Arco de cupido
  CUPID_BOW_LEFT: 37,
  CUPID_BOW_RIGHT: 267,
  CUPID_BOW_CENTER: 0,
  // Labio superior interno
  UPPER_LIP_INNER: 13,
  // Labio inferior interno
  LOWER_LIP_INNER: 14,

  // Regioes de pele (para Flow Peel / Shine Face)
  FOREHEAD_LEFT: 71,
  FOREHEAD_RIGHT: 301,
  LEFT_CHEEK: [123, 50, 36, 205],
  RIGHT_CHEEK: [352, 280, 266, 425],
  CHIN_LEFT: 172,
  CHIN_RIGHT: 397,
  T_ZONE: [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1],

  // Contorno do rosto
  FACE_OVAL: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
  ],

  // Pontos de simetria vertical (linha central)
  MIDLINE: [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 2, 164, 0, 17, 152],

  // Testa
  FOREHEAD_CENTER: 10,

  // Queixo
  CHIN: 152,
} as const;
