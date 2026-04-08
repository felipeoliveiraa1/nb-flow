import type { FaceClassification, FaceShape, EyebrowShape } from "./classification";

// ============================================================
// TABELA DE REGRAS FLOW - PREENCHER COM A NATALIA
// ============================================================
// Cada regra mapeia uma combinacao de tipo de rosto + sobrancelha
// para a tecnica Flow recomendada.
//
// Como usar:
// 1. Sente com a Natalia e preencha as tecnicas reais
// 2. Substitua os textos placeholder abaixo
// 3. Adicione mais combinacoes conforme necessario
// ============================================================

interface FlowRule {
  faceShape: FaceShape;
  eyebrowShape: EyebrowShape;
  technique: string;        // Nome da tecnica Flow
  description: string;      // Descricao do que fazer
  products?: string[];      // Produtos NB recomendados (opcional)
}

// Tabela de regras - PREENCHER COM A METODOLOGIA DA NATALIA
const FLOW_RULES: FlowRule[] = [
  // --- ROSTO OVAL ---
  {
    faceShape: "oval",
    eyebrowShape: "reta",
    technique: "Flow Natural",
    description: "Rosto oval com sobrancelha reta: criar leve arqueamento no ponto mais alto para adicionar expressao sem alterar a harmonia natural. Manter a espessura original.",
  },
  {
    faceShape: "oval",
    eyebrowShape: "arqueada",
    technique: "Flow Preservacao",
    description: "Rosto oval com sobrancelha arqueada: combinacao ideal. Preservar o arco natural e trabalhar apenas definicao e preenchimento uniforme.",
  },
  {
    faceShape: "oval",
    eyebrowShape: "angulada",
    technique: "Flow Suavizacao",
    description: "Rosto oval com sobrancelha angulada: suavizar o angulo do pico para criar uma transicao mais fluida mantendo a personalidade.",
  },
  {
    faceShape: "oval",
    eyebrowShape: "curva",
    technique: "Flow Definicao",
    description: "Rosto oval com sobrancelha curva: definir melhor o arco e alongar levemente a cauda para equilibrar o formato.",
  },
  {
    faceShape: "oval",
    eyebrowShape: "descendente",
    technique: "Flow Elevacao",
    description: "Rosto oval com sobrancelha descendente: elevar a cauda para criar abertura no olhar. Ponto de elevacao no terco externo.",
  },

  // --- ROSTO REDONDO ---
  {
    faceShape: "redondo",
    eyebrowShape: "reta",
    technique: "Flow Angulacao",
    description: "Rosto redondo com sobrancelha reta: criar um angulo definido no arco para verticalizar o rosto e quebrar a circularidade.",
  },
  {
    faceShape: "redondo",
    eyebrowShape: "arqueada",
    technique: "Flow Elevacao Alta",
    description: "Rosto redondo com sobrancelha arqueada: acentuar o arco para criar mais verticalidade. Elevar o ponto mais alto do arco.",
  },
  {
    faceShape: "redondo",
    eyebrowShape: "angulada",
    technique: "Flow Manutencao",
    description: "Rosto redondo com sobrancelha angulada: formato ideal para este rosto. Manter o angulo e trabalhar preenchimento uniforme.",
  },
  {
    faceShape: "redondo",
    eyebrowShape: "curva",
    technique: "Flow Estruturacao",
    description: "Rosto redondo com sobrancelha curva: adicionar estrutura com ponto de angulacao mais definido no terco externo.",
  },
  {
    faceShape: "redondo",
    eyebrowShape: "descendente",
    technique: "Flow Redesenho",
    description: "Rosto redondo com sobrancelha descendente: redesenhar a cauda com elevacao. Criar angulo ascendente para abrir o olhar.",
  },

  // --- ROSTO QUADRADO ---
  {
    faceShape: "quadrado",
    eyebrowShape: "reta",
    technique: "Flow Curvatura",
    description: "Rosto quadrado com sobrancelha reta: adicionar curvatura suave para suavizar os angulos do rosto. Evitar linhas retas que acentuem o formato.",
  },
  {
    faceShape: "quadrado",
    eyebrowShape: "arqueada",
    technique: "Flow Equilibrio",
    description: "Rosto quadrado com sobrancelha arqueada: arco suave equilibra o rosto. Manter e refinar o arco natural.",
  },
  {
    faceShape: "quadrado",
    eyebrowShape: "angulada",
    technique: "Flow Suavizacao",
    description: "Rosto quadrado com sobrancelha angulada: suavizar o angulo para nao reforcar as linhas retas do maxilar.",
  },
  {
    faceShape: "quadrado",
    eyebrowShape: "curva",
    technique: "Flow Preservacao",
    description: "Rosto quadrado com sobrancelha curva: formato ideal. Preservar a curvatura que suaviza as linhas do rosto naturalmente.",
  },
  {
    faceShape: "quadrado",
    eyebrowShape: "descendente",
    technique: "Flow Elevacao Suave",
    description: "Rosto quadrado com sobrancelha descendente: elevar a cauda com curvatura suave, evitando angulos agudos.",
  },

  // --- ROSTO CORACAO ---
  {
    faceShape: "coracao",
    eyebrowShape: "reta",
    technique: "Flow Arredondamento",
    description: "Rosto coracao com sobrancelha reta: criar arco suave e arredondado para equilibrar a testa larga com o queixo estreito.",
  },
  {
    faceShape: "coracao",
    eyebrowShape: "arqueada",
    technique: "Flow Natural Suave",
    description: "Rosto coracao com sobrancelha arqueada: suavizar levemente o arco. Arco muito alto pode acentuar a largura da testa.",
  },
  {
    faceShape: "coracao",
    eyebrowShape: "angulada",
    technique: "Flow Curvatura",
    description: "Rosto coracao com sobrancelha angulada: transformar o angulo em curva suave para suavizar a parte superior do rosto.",
  },
  {
    faceShape: "coracao",
    eyebrowShape: "curva",
    technique: "Flow Preservacao",
    description: "Rosto coracao com sobrancelha curva: formato harmonioso para este rosto. Preservar e definir a curva natural.",
  },
  {
    faceShape: "coracao",
    eyebrowShape: "descendente",
    technique: "Flow Elevacao Curva",
    description: "Rosto coracao com sobrancelha descendente: elevar com curva suave, nao angular, para manter a suavidade.",
  },

  // --- ROSTO LONGO ---
  {
    faceShape: "longo",
    eyebrowShape: "reta",
    technique: "Flow Horizontal",
    description: "Rosto longo com sobrancelha reta: manter a horizontalidade que cria ilusao de largura. Alongar levemente as caudas lateralmente.",
  },
  {
    faceShape: "longo",
    eyebrowShape: "arqueada",
    technique: "Flow Achatamento",
    description: "Rosto longo com sobrancelha arqueada: diminuir a altura do arco para nao verticalizar ainda mais o rosto.",
  },
  {
    faceShape: "longo",
    eyebrowShape: "angulada",
    technique: "Flow Suavizacao Horizontal",
    description: "Rosto longo com sobrancelha angulada: suavizar o angulo e estender horizontalmente para criar ilusao de largura.",
  },
  {
    faceShape: "longo",
    eyebrowShape: "curva",
    technique: "Flow Extensao",
    description: "Rosto longo com sobrancelha curva: manter a curva baixa e estender a cauda horizontalmente.",
  },
  {
    faceShape: "longo",
    eyebrowShape: "descendente",
    technique: "Flow Nivelamento",
    description: "Rosto longo com sobrancelha descendente: nivelar a cauda para ficar na mesma altura do inicio. Criar linha horizontal.",
  },
];

// --- Busca de recomendacao ---

export interface FlowRecommendation {
  technique: string;
  description: string;
  products: string[];
  faceShapeLabel: string;
  eyebrowShapeLabel: string;
  additionalNotes: string[];
}

const FACE_SHAPE_LABELS: Record<FaceShape, string> = {
  oval: "Oval",
  redondo: "Redondo",
  quadrado: "Quadrado",
  coracao: "Coracao",
  longo: "Longo",
};

const EYEBROW_LABELS: Record<EyebrowShape, string> = {
  reta: "Reta",
  arqueada: "Arqueada",
  angulada: "Angulada",
  curva: "Curva",
  descendente: "Descendente",
};

export function getFlowRecommendation(classification: FaceClassification): FlowRecommendation {
  // Buscar regra pela sobrancelha que mais precisa de atencao (menor simetria)
  // Por padrao usa a esquerda
  const primaryBrow = classification.eyebrowShapeLeft;

  const rule = FLOW_RULES.find(
    (r) => r.faceShape === classification.faceShape && r.eyebrowShape === primaryBrow
  );

  const additionalNotes: string[] = [];

  // Notas sobre espacamento dos olhos
  if (classification.eyeSpacing === "juntos") {
    additionalNotes.push("Olhos proximos: estender inicio da sobrancelha levemente para criar separacao visual");
  } else if (classification.eyeSpacing === "afastados") {
    additionalNotes.push("Olhos afastados: aproximar o inicio das sobrancelhas em direcao ao nariz");
  }

  // Notas sobre labios
  if (classification.lipType === "fino") {
    additionalNotes.push("Labios finos: considerar tecnicas de preenchimento labial para equilibrar com a sobrancelha");
  }

  // Notas sobre testa
  if (classification.foreheadType === "alta") {
    additionalNotes.push("Testa alta: sobrancelha com arco mais baixo pode ajudar a encurtar visualmente a testa");
  } else if (classification.foreheadType === "baixa") {
    additionalNotes.push("Testa baixa: manter sobrancelhas mais finas e com arco elevado para criar espaco");
  }

  // Assimetria entre sobrancelhas
  if (classification.eyebrowShapeLeft !== classification.eyebrowShapeRight) {
    additionalNotes.push(
      `Sobrancelhas assimetricas: esquerda ${EYEBROW_LABELS[classification.eyebrowShapeLeft]}, direita ${EYEBROW_LABELS[classification.eyebrowShapeRight]}. Trabalhar equalizacao gradual`
    );
  }

  if (rule) {
    return {
      technique: rule.technique,
      description: rule.description,
      products: rule.products ?? [],
      faceShapeLabel: FACE_SHAPE_LABELS[classification.faceShape],
      eyebrowShapeLabel: EYEBROW_LABELS[primaryBrow],
      additionalNotes,
    };
  }

  // Fallback se nao encontrar regra
  return {
    technique: "Flow Personalizado",
    description: "Combinacao requer avaliacao personalizada pela Angel. Consultar materiais de referencia Flow.",
    products: [],
    faceShapeLabel: FACE_SHAPE_LABELS[classification.faceShape],
    eyebrowShapeLabel: EYEBROW_LABELS[primaryBrow],
    additionalNotes,
  };
}
