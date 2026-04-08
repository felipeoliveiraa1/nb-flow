"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ScanFace, Award, Camera } from "lucide-react";
import Image from "next/image";
import { useProfileStore } from "@/stores/profile-store";
import { useGalleryStore } from "@/stores/gallery-store";
import Link from "next/link";

export default function FeedPage() {
  const { profile } = useProfileStore();
  const { items: galleryItems } = useGalleryStore();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function toggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const hasContent = galleryItems.length > 0 || profile.totalAnalyses > 0;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-nb-pink-soft/50 bg-white/95 backdrop-blur-sm px-5 py-3">
        <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-nb-dark">
          NB Flow
        </h1>
      </div>

      {/* Stories */}
      <div className="border-b border-nb-gray-light py-3">
        <div className="flex gap-4 overflow-x-auto px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-nb-gray-light">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Voce" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-nb-pink">{(profile.name || "A")[0].toUpperCase()}</span>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-nb-pink text-white text-xs font-bold ring-2 ring-white">
                +
              </div>
            </div>
            <span className="text-xs text-nb-gray-warm">Seu story</span>
          </div>

          {DEMO_USERS.map((user) => (
            <div key={user.name} className="flex shrink-0 flex-col items-center gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-nb-pink to-nb-pink-dark p-0.5">
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover ring-2 ring-white" />
              </div>
              <span className="text-xs text-nb-gray-warm">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div>
        {/* Posts reais da galeria */}
        {galleryItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border-b border-nb-gray-light"
          >
            {/* Author */}
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-nb-pink to-nb-pink-dark">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{(profile.name || "A")[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-nb-dark">{profile.name}</span>
                <span className="ml-2 rounded-full bg-nb-pink-soft px-1.5 py-0.5 text-[10px] font-semibold text-nb-pink">{profile.level}</span>
                <p className="text-xs text-nb-gray-warm">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>

            {/* Before/After image */}
            <div className="relative aspect-square bg-nb-gray-light">
              <div className="flex h-full">
                <div className="w-1/2 overflow-hidden">
                  <img src={item.beforeUrl} alt="Antes" className="h-full w-full object-cover" />
                </div>
                <div className="w-1/2 overflow-hidden">
                  <img src={item.afterUrl} alt="Depois" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 rounded-full bg-nb-pink px-2.5 py-1 text-xs font-bold text-white shadow-md">
                Flow {item.flowScore}
              </div>
              <div className="absolute top-3 left-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">ANTES</div>
              <div className="absolute top-3 left-1/2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">DEPOIS</div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4">
                  <button onClick={() => toggleLike(item.id)} className="transition-transform active:scale-90">
                    <Heart className={`h-6 w-6 ${likedIds.has(item.id) ? "fill-red-500 text-red-500" : "text-nb-dark"}`} />
                  </button>
                  <MessageCircle className="h-6 w-6 text-nb-dark" />
                  <Send className="h-6 w-6 text-nb-dark" />
                </div>
                <button onClick={() => toggleSave(item.id)} className="transition-transform active:scale-90">
                  <Bookmark className={`h-6 w-6 ${savedIds.has(item.id) ? "fill-nb-dark text-nb-dark" : "text-nb-dark"}`} />
                </button>
              </div>
              <p className="text-sm font-semibold text-nb-dark">{likedIds.has(item.id) ? 1 : 0} curtidas</p>
              <p className="mt-1 text-sm text-nb-dark">
                <span className="font-semibold">{profile.name}</span>{" "}
                Resultado {item.clientName} - Flow Score {item.flowScore}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Demo posts (quando nao tem conteudo real) */}
        {!hasContent && DEMO_POSTS.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border-b border-nb-gray-light"
          >
            <div className="flex items-center gap-3 px-5 py-3">
              <img src={post.avatar} alt={post.author} className="h-9 w-9 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-nb-dark">{post.author}</span>
                  <span className="rounded-full bg-nb-pink-soft px-1.5 py-0.5 text-[10px] font-semibold text-nb-pink">{post.level}</span>
                </div>
                <span className="text-xs text-nb-gray-warm">{post.timeAgo}</span>
              </div>
            </div>

            {post.type === "analysis" && (
              <div className="mx-5 rounded-2xl bg-gradient-to-br from-nb-pink to-nb-pink-dark p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ScanFace className="h-5 w-5 text-white" />
                  <span className="text-sm font-semibold text-white">Flow Analysis</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{post.score}</span>
                  <span className="text-sm text-white/60">/100</span>
                </div>
              </div>
            )}

            {post.type === "achievement" && (
              <div className="mx-5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-5 text-center">
                <Award className="mx-auto h-12 w-12 text-white" />
                <p className="mt-2 text-lg font-bold text-white">{post.achievement}</p>
              </div>
            )}

            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4">
                  <button onClick={() => toggleLike(post.id)} className="transition-transform active:scale-90">
                    <Heart className={`h-6 w-6 ${likedIds.has(post.id) ? "fill-red-500 text-red-500" : "text-nb-dark"}`} />
                  </button>
                  <MessageCircle className="h-6 w-6 text-nb-dark" />
                  <Send className="h-6 w-6 text-nb-dark" />
                </div>
                <button onClick={() => toggleSave(post.id)} className="transition-transform active:scale-90">
                  <Bookmark className={`h-6 w-6 ${savedIds.has(post.id) ? "fill-nb-dark" : "text-nb-dark"}`} />
                </button>
              </div>
              <p className="text-sm font-semibold text-nb-dark">{post.likes} curtidas</p>
              <p className="mt-1 text-sm text-nb-dark">
                <span className="font-semibold">{post.author.split(" ")[0]}</span> {post.caption}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Empty state */}
        {galleryItems.length === 0 && hasContent && (
          <div className="flex flex-col items-center py-20 px-5 text-center">
            <Camera className="h-12 w-12 text-nb-pink/30 mb-3" />
            <p className="text-sm font-medium text-nb-dark">Seu feed esta vazio</p>
            <p className="text-xs text-nb-gray-warm mt-1">Adicione fotos na galeria para aparecerem aqui</p>
            <Link href="/gallery" className="mt-4 rounded-xl bg-nb-pink px-5 py-2 text-sm font-semibold text-white">
              Ir para Galeria
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const DEMO_USERS = [
  { name: "Fernanda", avatar: "https://i.pravatar.cc/150?img=1" },
  { name: "Juliana", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Camila", avatar: "https://i.pravatar.cc/150?img=9" },
  { name: "Ana", avatar: "https://i.pravatar.cc/150?img=16" },
];

const DEMO_POSTS = [
  {
    id: "demo-1",
    author: "Fernanda Silva",
    avatar: "https://i.pravatar.cc/100?img=1",
    level: "Elite",
    timeAgo: "2h",
    type: "analysis" as const,
    score: 92,
    caption: "Acabei de usar o Scanner IA e o diagnostico foi certeiro!",
    likes: 47,
  },
  {
    id: "demo-2",
    author: "Camila Rodrigues",
    avatar: "https://i.pravatar.cc/100?img=9",
    level: "Pro",
    timeAgo: "8h",
    type: "achievement" as const,
    achievement: "Nivel Pro - 500 XP",
    caption: "Acabei de subir para o nivel Pro! Obrigada Natalia pela metodologia!",
    likes: 83,
  },
];
