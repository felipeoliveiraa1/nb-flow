"use client";

import Link from "next/link";
import { ScanFace, Sparkles, Images, Newspaper, ChevronRight, Zap, Star, FlaskConical, ImagePlus, Package, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useProfileStore } from "@/stores/profile-store";
import { useGalleryStore } from "@/stores/gallery-store";

export default function HomePage() {
  const { profile, getProgress } = useProfileStore();
  const { items: galleryItems } = useGalleryStore();
  const progress = getProgress();

  const missionsCompleted = [
    profile.totalAnalyses > 0,
    profile.totalPhotos > 0,
    profile.totalPurchases > 0,
  ].filter(Boolean).length;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-nb-pink to-nb-pink-dark px-5 pb-20 pt-14">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Bem-vinda de volta</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
              {profile.name || "Angel"}
            </h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/20">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">
                {(profile.name || "A")[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card de nivel */}
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
                  {profile.level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-nb-pink">{profile.xp}</p>
              <p className="text-xs text-nb-gray-warm">XP</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-nb-gray-warm">
              <span>Proximo: {profile.level === "Master" ? "Max" : profile.level === "Elite" ? "Master" : profile.level === "Pro" ? "Elite" : "Pro"}</span>
              <span>{progress.current} / {progress.next} XP</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-nb-gray-light">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-nb-pink to-nb-pink-dark"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Banner Flow */}
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

      {/* Grid */}
      <div className="mt-5 px-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-nb-gray-warm">
          Menu
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href="/treatments" className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.97]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-pink-soft">
                <Sparkles className="h-5 w-5 text-nb-pink" />
              </div>
              <span className="text-xs font-medium text-nb-dark">Flow</span>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Link href="/gallery" className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.97]">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-nb-pink-soft">
                <Images className="h-5 w-5 text-nb-pink" />
                {galleryItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-nb-pink text-[9px] font-bold text-white">
                    {galleryItems.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-nb-dark">Galeria</span>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/feed" className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.97]">
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-nb-gray-warm">Missoes</h2>
          <div className="flex items-center gap-1 rounded-full bg-nb-pink-soft px-2.5 py-0.5">
            <Star className="h-3 w-3 text-nb-pink" />
            <span className="text-xs font-semibold text-nb-pink">{missionsCompleted}/3</span>
          </div>
        </div>
        <div className="space-y-2.5">
          <MissionItem icon={FlaskConical} title="Primeira analise Flow" subtitle="Use o Scanner IA em uma cliente" xp={50} done={profile.totalAnalyses > 0} />
          <MissionItem icon={ImagePlus} title="Antes & Depois" subtitle="Registre um resultado na galeria" xp={30} done={profile.totalPhotos > 0} />
          <MissionItem icon={Package} title="Primeiro pedido" subtitle="Faca um pedido no NB Shop" xp={20} done={profile.totalPurchases > 0} />
        </div>
      </div>
    </div>
  );
}

function MissionItem({ icon: Icon, title, subtitle, xp, done }: { icon: LucideIcon; title: string; subtitle: string; xp: number; done: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3.5 shadow-sm ring-1 ring-black/5 ${done ? "bg-nb-pink-soft" : "bg-white"}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? "bg-nb-pink" : "bg-nb-pink-soft"}`}>
        <Icon className={`h-5 w-5 ${done ? "text-white" : "text-nb-pink"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? "text-nb-pink-dark line-through" : "text-nb-dark"}`}>{title}</p>
        <p className="text-xs text-nb-gray-warm">{subtitle}</p>
      </div>
      <div className="shrink-0 rounded-full bg-nb-pink-soft px-2.5 py-1">
        <span className="text-xs font-bold text-nb-pink">{done ? "Feito" : `+${xp} XP`}</span>
      </div>
    </div>
  );
}
