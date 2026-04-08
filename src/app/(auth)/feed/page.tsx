"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ScanFace, Award, type LucideIcon } from "lucide-react";
import Image from "next/image";

interface FeedPost {
  id: string;
  author: string;
  authorInitial: string;
  level: string;
  timeAgo: string;
  type: "before_after" | "analysis" | "achievement";
  imageUrl?: string;
  beforeUrl?: string;
  afterUrl?: string;
  caption: string;
  flowScore?: number;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
}

const MOCK_POSTS: FeedPost[] = [
  {
    id: "1",
    author: "Fernanda Silva",
    authorInitial: "F",
    level: "Elite",
    timeAgo: "2h",
    type: "before_after",
    beforeUrl: "/demo/before-1.jpg",
    afterUrl: "/demo/after-1.jpg",
    caption: "Resultado incrivel com a tecnica Flow Elevacao! Cliente amou o resultado natural.",
    flowScore: 92,
    likes: 47,
    comments: 12,
    liked: false,
    saved: false,
  },
  {
    id: "2",
    author: "Juliana Mendes",
    authorInitial: "J",
    level: "Pro",
    timeAgo: "5h",
    type: "analysis",
    caption: "Acabei de usar o Scanner IA e o diagnostico foi certeiro! Arco a 7.8%, quase perfeito no padrao Natalia.",
    flowScore: 88,
    likes: 31,
    comments: 8,
    liked: true,
    saved: false,
  },
  {
    id: "3",
    author: "Camila Rodrigues",
    authorInitial: "C",
    level: "Pro",
    timeAgo: "8h",
    type: "achievement",
    caption: "Acabei de subir para o nivel Pro! 500 XP conquistados. Obrigada Natalia pela metodologia!",
    likes: 83,
    comments: 24,
    liked: false,
    saved: true,
  },
  {
    id: "4",
    author: "Ana Paula Costa",
    authorInitial: "A",
    level: "Iniciante",
    timeAgo: "12h",
    type: "before_after",
    beforeUrl: "/demo/before-2.jpg",
    afterUrl: "/demo/after-2.jpg",
    caption: "Minha terceira cliente usando o metodo Flow! Cada vez mais confiante nos resultados.",
    flowScore: 85,
    likes: 22,
    comments: 6,
    liked: false,
    saved: false,
  },
  {
    id: "5",
    author: "Beatriz Lima",
    authorInitial: "B",
    level: "Iniciante",
    timeAgo: "1d",
    type: "analysis",
    caption: "Primeira analise completa no app! O Scanner detectou que preciso trabalhar a simetria. Vamos la!",
    flowScore: 71,
    likes: 15,
    comments: 4,
    liked: false,
    saved: false,
  },
];

const STORY_USERS = [
  { name: "Fernanda", avatar: "https://i.pravatar.cc/150?img=1" },
  { name: "Juliana", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Camila", avatar: "https://i.pravatar.cc/150?img=9" },
  { name: "Ana", avatar: "https://i.pravatar.cc/150?img=16" },
];

const AVATARS: Record<string, string> = {
  F: "https://i.pravatar.cc/100?img=1",
  J: "https://i.pravatar.cc/100?img=5",
  C: "https://i.pravatar.cc/100?img=9",
  A: "https://i.pravatar.cc/100?img=16",
  B: "https://i.pravatar.cc/100?img=20",
};

export default function FeedPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  function toggleSave(id: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
    );
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-nb-pink-soft/50 bg-white/95 backdrop-blur-sm px-5 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-nb-dark">
            NB Flow
          </h1>
          <div className="flex gap-3">
            <button className="text-nb-dark">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stories bar */}
      <div className="border-b border-nb-gray-light py-3">
        <div className="flex gap-4 overflow-x-auto px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* My story */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-nb-gray-light">
              <Image src="/logo.svg" alt="Voce" width={24} height={24} className="w-auto h-auto" />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-nb-pink text-white text-xs font-bold ring-2 ring-white">
                +
              </div>
            </div>
            <span className="text-xs text-nb-gray-warm">Seu story</span>
          </div>

          {/* Other stories */}
          {STORY_USERS.map((user) => (
            <div key={user.name} className="flex shrink-0 flex-col items-center gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-nb-pink to-nb-pink-dark p-0.5">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover ring-2 ring-white"
                />
              </div>
              <span className="text-xs text-nb-gray-warm">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div>
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <PostCard
              post={post}
              onLike={() => toggleLike(post.id)}
              onSave={() => toggleSave(post.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onSave,
}: {
  post: FeedPost;
  onLike: () => void;
  onSave: () => void;
}) {
  const levelColor =
    post.level === "Elite"
      ? "text-amber-600 bg-amber-50"
      : post.level === "Pro"
        ? "text-nb-pink-dark bg-nb-pink-soft"
        : "text-nb-gray-warm bg-nb-gray-light";

  return (
    <div className="border-b border-nb-gray-light">
      {/* Author header */}
      <div className="flex items-center gap-3 px-5 py-3">
        <img
          src={AVATARS[post.authorInitial] || `https://i.pravatar.cc/100?u=${post.authorInitial}`}
          alt={post.author}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-nb-dark">{post.author}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${levelColor}`}>
              {post.level}
            </span>
          </div>
          <span className="text-xs text-nb-gray-warm">{post.timeAgo}</span>
        </div>
        <button className="text-nb-gray-warm">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      {post.type === "before_after" && (
        <div className="relative aspect-square bg-nb-gray-light">
          <div className="flex h-full">
            <div className="w-1/2 bg-nb-gray-light flex items-center justify-center border-r border-white/50">
              <div className="text-center">
                <ScanFace className="mx-auto h-10 w-10 text-nb-pink/30" />
                <p className="mt-1 text-xs text-nb-gray-warm">Antes</p>
              </div>
            </div>
            <div className="w-1/2 bg-nb-pink-soft flex items-center justify-center">
              <div className="text-center">
                <ScanFace className="mx-auto h-10 w-10 text-nb-pink/50" />
                <p className="mt-1 text-xs text-nb-gray-warm">Depois</p>
              </div>
            </div>
          </div>
          {post.flowScore && (
            <div className="absolute bottom-3 right-3 rounded-full bg-nb-pink px-2.5 py-1 text-xs font-bold text-white shadow-md">
              Flow {post.flowScore}
            </div>
          )}
          <div className="absolute top-3 left-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            ANTES
          </div>
          <div className="absolute top-3 right-1/2 translate-x-[calc(50%+2px)] rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            DEPOIS
          </div>
        </div>
      )}

      {post.type === "analysis" && (
        <div className="mx-5 rounded-2xl bg-gradient-to-br from-nb-pink to-nb-pink-dark p-5">
          <div className="flex items-center gap-2 mb-2">
            <ScanFace className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold text-white">Flow Analysis</span>
          </div>
          {post.flowScore && (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{post.flowScore}</span>
              <span className="text-sm text-white/60">/100</span>
            </div>
          )}
          <p className="mt-1 text-xs text-white/60">Padrao Natalia</p>
        </div>
      )}

      {post.type === "achievement" && (
        <div className="mx-5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-5 text-center">
          <Award className="mx-auto h-12 w-12 text-white" />
          <p className="mt-2 text-lg font-bold text-white">Nivel Pro</p>
          <p className="text-sm text-white/70">500 XP conquistados</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-4">
            <button onClick={onLike} className="transition-transform active:scale-90">
              <Heart
                className={`h-6 w-6 ${post.liked ? "fill-red-500 text-red-500" : "text-nb-dark"}`}
              />
            </button>
            <button>
              <MessageCircle className="h-6 w-6 text-nb-dark" />
            </button>
            <button>
              <Send className="h-6 w-6 text-nb-dark" />
            </button>
          </div>
          <button onClick={onSave} className="transition-transform active:scale-90">
            <Bookmark
              className={`h-6 w-6 ${post.saved ? "fill-nb-dark text-nb-dark" : "text-nb-dark"}`}
            />
          </button>
        </div>

        <p className="text-sm font-semibold text-nb-dark">{post.likes} curtidas</p>

        <p className="mt-1 text-sm text-nb-dark">
          <span className="font-semibold">{post.author.split(" ")[0]}</span>{" "}
          {post.caption}
        </p>

        {post.comments > 0 && (
          <button className="mt-1 text-xs text-nb-gray-warm">
            Ver todos os {post.comments} comentarios
          </button>
        )}
      </div>
    </div>
  );
}
