"use client";

import Link from "next/link";
import Image from "next/image";
import { ScanFace, Sparkles, Images, Newspaper, ChevronRight, Zap, Star, FlaskConical, ImagePlus, Package, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="pb-4">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-nb-pink to-nb-pink-dark px-5 pb-20 pt-14">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Bem-vinda de volta</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
              Angel
            </h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Image src="/logo.svg" alt="NB" width={28} height={28} className="w-auto h-auto" />
          </div>
        </div>
      </div>

      {/* Card de nivel flutuante */}
      <div className="relative z-10 px-5 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-5 shadow-lg shadow-black/8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nb-pink-soft">
                <Zap className="h-5 w-5 text-nb-pink" />
              </div>
              <div>
                <p className="text-xs text-nb-gray-warm">Nivel Atual</p>
                <p className="font-[family-name:var(--font-playfair)] text-base font-semibold text-nb-dark">
                  Iniciante
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-nb-pink">0</p>
              <p className="text-xs text-nb-gray-warm">XP</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-nb-gray-warm">
              <span>Proximo: Pro</span>
              <span>0 / 500 XP</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-nb-gray-light">
              <div
                className="h-full rounded-full bg-gradient-to-r from-nb-pink to-nb-pink-dark transition-all duration-500"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Banner Flow - CTA principal */}
      <div className="mt-5 px-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link
            href="/treatments"
            className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-nb-pink to-nb-pink-dark p-4 shadow-md shadow-nb-pink/15 transition-transform active:scale-[0.98]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <ScanFace className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Tecnicas Flow</p>
              <p className="mt-0.5 text-xs text-white/70">
                5 scanners IA - Brows, Lips, Peel, Removal, Shine
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/50" />
          </Link>
        </motion.div>
      </div>

      {/* Grid de acoes */}
      <div className="mt-5 px-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-nb-gray-warm">
          Menu
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link
              href="/treatments"
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-pink-soft">
                <Sparkles className="h-5 w-5 text-nb-pink" />
              </div>
              <span className="text-xs font-medium text-nb-dark">Flow</span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Link
              href="/gallery"
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-pink-soft">
                <Images className="h-5 w-5 text-nb-pink" />
              </div>
              <span className="text-xs font-medium text-nb-dark">Galeria</span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link
              href="/feed"
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-pink-soft">
                <Newspaper className="h-5 w-5 text-nb-pink" />
              </div>
              <span className="text-xs font-medium text-nb-dark">Feed</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Missoes */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-nb-gray-warm">
            Missoes
          </h2>
          <div className="flex items-center gap-1 rounded-full bg-nb-pink-soft px-2.5 py-0.5">
            <Star className="h-3 w-3 text-nb-pink" />
            <span className="text-xs font-semibold text-nb-pink">0/3</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <MissionItem
            icon={FlaskConical}
            title="Primeira analise Flow"
            subtitle="Use o Scanner IA em uma cliente"
            xp={50}
          />
          <MissionItem
            icon={ImagePlus}
            title="Antes & Depois"
            subtitle="Registre um resultado na galeria"
            xp={30}
          />
          <MissionItem
            icon={Package}
            title="Primeiro pedido"
            subtitle="Faca um pedido no NB Shop"
            xp={20}
          />
        </div>
      </div>
    </div>
  );
}

function MissionItem({
  icon: Icon,
  title,
  subtitle,
  xp,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  xp: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-black/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nb-pink-soft">
        <Icon className="h-5 w-5 text-nb-pink" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-nb-dark">{title}</p>
        <p className="text-xs text-nb-gray-warm">{subtitle}</p>
      </div>
      <div className="shrink-0 rounded-full bg-nb-pink-soft px-2.5 py-1">
        <span className="text-xs font-bold text-nb-pink">+{xp} XP</span>
      </div>
    </div>
  );
}
