"use client";

import { useState, useRef } from "react";
import { useProfileStore } from "@/stores/profile-store";
import { useGalleryStore } from "@/stores/gallery-store";
import { FlaskConical, Camera, ShoppingBag, Target, Pencil, Check, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { profile, setProfile, getProgress } = useProfileStore();
  const { items: galleryItems } = useGalleryStore();
  const progress = getProgress();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    setProfile({ name: editName.trim() || profile.name, bio: editBio });
    setEditing(false);
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="px-5 pt-12 pb-4">
      {/* Avatar + nome */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-nb-pink to-nb-pink-dark shadow-lg shadow-nb-pink/20"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white">
                {(profile.name || "A")[0].toUpperCase()}
              </span>
            )}
          </button>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-nb-pink shadow-sm">
            Lv.{profile.level === "Iniciante" ? "1" : profile.level === "Pro" ? "2" : profile.level === "Elite" ? "3" : "4"}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>

        {editing ? (
          <div className="mt-4 w-full max-w-xs space-y-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-center text-sm focus:border-nb-pink focus:outline-none"
              autoFocus
            />
            <input
              type="text"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Sua bio..."
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-center text-xs focus:border-nb-pink focus:outline-none"
            />
            <button onClick={handleSave} className="flex w-full items-center justify-center gap-1 rounded-lg bg-nb-pink py-2 text-xs font-semibold text-white">
              <Check className="h-3 w-3" /> Salvar
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-2">
              <h1 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-nb-dark">
                {profile.name || "Angel"}
              </h1>
              <button onClick={() => { setEditName(profile.name); setEditBio(profile.bio); setEditing(true); }}>
                <Pencil className="h-3.5 w-3.5 text-nb-gray-warm" />
              </button>
            </div>
            {profile.bio && <p className="text-xs text-nb-gray-warm mt-0.5">{profile.bio}</p>}
            <p className="text-sm text-nb-gray-warm">Nivel {profile.level}</p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-nb-pink-soft p-3 text-center">
          <p className="text-lg font-bold text-nb-pink">{profile.totalAnalyses}</p>
          <p className="text-[10px] text-nb-gray-warm">Analises</p>
        </div>
        <div className="rounded-xl bg-nb-pink-soft p-3 text-center">
          <p className="text-lg font-bold text-nb-pink">{galleryItems.length}</p>
          <p className="text-[10px] text-nb-gray-warm">Fotos</p>
        </div>
        <div className="rounded-xl bg-nb-pink-soft p-3 text-center">
          <p className="text-lg font-bold text-nb-pink">{profile.totalPurchases}</p>
          <p className="text-[10px] text-nb-gray-warm">Pedidos</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-5 rounded-2xl bg-nb-gray-light p-5">
        <div className="flex justify-between text-xs text-nb-dark-soft/70">
          <span>{profile.xp} XP total</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-nb-pink to-nb-pink-dark"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="mt-1.5 text-xs text-nb-gray-warm">
          {progress.current} / {progress.next} XP para {profile.level === "Master" ? "Max" : profile.level === "Elite" ? "Master" : profile.level === "Pro" ? "Elite" : "Pro"}
        </p>
      </div>

      {/* Como ganhar XP */}
      <div className="mt-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-nb-dark">Como ganhar XP</h2>
        <div className="mt-3 space-y-3">
          <XPAction action="Analise Flow AI" xp={50} icon={FlaskConical} />
          <XPAction action="Foto Antes/Depois" xp={30} icon={Camera} />
          <XPAction action="Compra NB Shop" xp={20} icon={ShoppingBag} />
          <XPAction action="Meta mensal" xp={100} icon={Target} />
        </div>
      </div>
    </div>
  );
}

function XPAction({ action, xp, icon: Icon }: { action: string; xp: number; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-nb-gray-light p-3">
      <Icon className="h-5 w-5 text-nb-pink" />
      <span className="flex-1 text-sm text-nb-dark-soft">{action}</span>
      <span className="text-sm font-bold text-nb-pink">+{xp} XP</span>
    </div>
  );
}
