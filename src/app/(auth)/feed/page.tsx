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

        {/* Demo posts (sempre mostram para o feed parecer ativo) */}
        {DEMO_POSTS.map((post, i) => (
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

            {post.type === "photo" && post.imageUrl && (
              <div className="relative">
                <img src={post.imageUrl} alt="Post" className="w-full aspect-square object-cover" />
                {post.score && (
                  <div className="absolute bottom-3 right-3 rounded-full bg-nb-pink px-2.5 py-1 text-xs font-bold text-white shadow-md">
                    Flow {post.score}
                  </div>
                )}
              </div>
            )}

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

const DEMO_POSTS: {
  id: string; author: string; avatar: string; level: string; timeAgo: string;
  type: "photo" | "analysis" | "achievement"; imageUrl?: string; score?: number;
  achievement?: string; caption: string; likes: number;
}[] = [
  {
    id: "demo-1",
    author: "Fernanda Silva",
    avatar: "https://i.pravatar.cc/100?img=1",
    level: "Elite",
    timeAgo: "1h",
    type: "photo",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop&crop=face",
    score: 94,
    caption: "Resultado Flow Brows de hoje! Cliente saiu amando o arco natural. Tecnica de elevacao no ponto 66 funcionou perfeita.",
    likes: 67,
  },
  {
    id: "demo-2",
    author: "Juliana Mendes",
    avatar: "https://i.pravatar.cc/100?img=5",
    level: "Pro",
    timeAgo: "3h",
    type: "photo",
    imageUrl: "https://images.unsplash.com/photo-1588528402605-3e7f9a090c4a?w=600&h=600&fit=crop&crop=face",
    score: 88,
    caption: "Antes e depois da correcao de simetria. Sobrancelha direita estava 4% mais baixa. Agora equilibrada!",
    likes: 43,
  },
  {
    id: "demo-3",
    author: "Camila Rodrigues",
    avatar: "https://i.pravatar.cc/100?img=9",
    level: "Pro",
    timeAgo: "5h",
    type: "analysis",
    score: 91,
    caption: "Scanner detectou arco a 7.8% - quase perfeito no padrao Natalia! Cada dia mais precisa nas medicoes.",
    likes: 31,
  },
  {
    id: "demo-4",
    author: "Ana Paula Costa",
    avatar: "https://i.pravatar.cc/100?img=16",
    level: "Iniciante",
    timeAgo: "6h",
    type: "photo",
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=600&fit=crop&crop=face",
    score: 85,
    caption: "Minha 5a cliente com o metodo Flow! O gradiente 40-100-70 faz TODA diferenca. Resultado super natural.",
    likes: 28,
  },
  {
    id: "demo-5",
    author: "Fernanda Silva",
    avatar: "https://i.pravatar.cc/100?img=1",
    level: "Elite",
    timeAgo: "8h",
    type: "achievement",
    achievement: "50 Analises Flow",
    caption: "Marco de 50 analises com o Scanner IA! A tecnologia mudou minha forma de trabalhar. Obrigada Natalia!",
    likes: 112,
  },
  {
    id: "demo-6",
    author: "Beatriz Lima",
    avatar: "https://i.pravatar.cc/100?img=20",
    level: "Iniciante",
    timeAgo: "10h",
    type: "photo",
    imageUrl: "https://images.unsplash.com/photo-1596704017254-9759879bfa63?w=600&h=600&fit=crop&crop=face",
    caption: "Flow Lips na cliente! Arco de cupido a 132 graus - dentro do ideal. Tecnica borda infinita ficou incrivel.",
    score: 89,
    likes: 35,
  },
  {
    id: "demo-7",
    author: "Juliana Mendes",
    avatar: "https://i.pravatar.cc/100?img=5",
    level: "Pro",
    timeAgo: "12h",
    type: "analysis",
    score: 86,
    caption: "Flow Peel detectou zona T oleosa e manchas nas bochechas. Recomendou peeling com carvao ativado. Vamos tratar!",
    likes: 22,
  },
  {
    id: "demo-8",
    author: "Ana Paula Costa",
    avatar: "https://i.pravatar.cc/100?img=16",
    level: "Iniciante",
    timeAgo: "1d",
    type: "photo",
    imageUrl: "https://images.unsplash.com/photo-1614289371518-722f2615943d?w=600&h=600&fit=crop&crop=face",
    score: 82,
    caption: "Primeira vez usando Flow Removal. Detectou pigmento marrom com 45% de densidade. Estimativa de 4 sessoes. Impressionante!",
    likes: 19,
  },
  {
    id: "demo-9",
    author: "Camila Rodrigues",
    avatar: "https://i.pravatar.cc/100?img=9",
    level: "Pro",
    timeAgo: "1d",
    type: "achievement",
    achievement: "Nivel Pro - 500 XP",
    caption: "Subi para Pro! Ja fiz 15 analises e 8 fotos antes/depois. O app e viciante!",
    likes: 83,
  },
  {
    id: "demo-10",
    author: "Fernanda Silva",
    avatar: "https://i.pravatar.cc/100?img=1",
    level: "Elite",
    timeAgo: "2d",
    type: "photo",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop&crop=face",
    score: 96,
    caption: "Score 96! Meu maior ate agora. Simetria quase perfeita, arco a 8.1%, angulo final a 12 graus. Padrao Natalia puro!",
    likes: 156,
  },
];
