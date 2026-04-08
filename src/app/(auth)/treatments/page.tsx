"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pen, Droplets, Sparkles, Eraser, Sun, ChevronRight, ScanFace } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Treatment {
  slug: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  scannerType: string;
  difficulty: string;
}

const treatments: Treatment[] = [
  {
    slug: "flow-brows",
    name: "Flow Brows",
    subtitle: "Analise de sobrancelhas com metodo Natalia",
    icon: Pen,
    scannerType: "Sobrancelha IA",
    difficulty: "Intermediario",
  },
  {
    slug: "flow-lips",
    name: "Flow Lips",
    subtitle: "Analise labial completa com simetria e arco de cupido",
    icon: Droplets,
    scannerType: "Labios IA",
    difficulty: "Intermediario",
  },
  {
    slug: "flow-peel",
    name: "Flow Peel",
    subtitle: "Analise de pele - manchas, textura e poros",
    icon: Sparkles,
    scannerType: "Pele IA",
    difficulty: "Iniciante",
  },
  {
    slug: "flow-removal",
    name: "Flow Removal",
    subtitle: "Detecta pigmento existente e estima dificuldade de remocao",
    icon: Eraser,
    scannerType: "Pigmento IA",
    difficulty: "Avancado",
  },
  {
    slug: "shine-face",
    name: "Shine Face",
    subtitle: "Analise de tipo de pele, oleosidade e hidratacao",
    icon: Sun,
    scannerType: "Pele IA",
    difficulty: "Iniciante",
  },
];

export default function TreatmentsPage() {
  return (
    <div className="pb-4">
      <div className="bg-gradient-to-br from-nb-pink to-nb-pink-dark px-5 pb-8 pt-14">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
          Tecnicas Flow
        </h1>
        <p className="mt-1 text-sm text-white/70">
          Cada tecnica tem seu scanner IA especializado
        </p>
      </div>

      <div className="px-5 -mt-4 space-y-3">
        {treatments.map((t, i) => (
          <motion.div
            key={t.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={`/treatments/${t.slug}`}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-nb-pink-soft">
                <t.icon className="h-6 w-6 text-nb-pink" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-nb-dark">{t.name}</p>
                  <span className="flex items-center gap-0.5 rounded-full bg-nb-pink/10 px-1.5 py-0.5 text-[10px] font-semibold text-nb-pink">
                    <ScanFace className="h-2.5 w-2.5" />
                    {t.scannerType}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-nb-gray-warm leading-relaxed">{t.subtitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-nb-gray-warm" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
