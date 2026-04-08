"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowRight } from "lucide-react";
import Image from "next/image";

interface OnboardingProps {
  onComplete: (name: string, avatarUrl: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleFinish() {
    if (!name.trim()) return;
    onComplete(name.trim(), avatarUrl);
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-nb-pink to-nb-pink-dark px-6 pb-10 pt-16 text-center">
        <Image src="/logo.svg" alt="NB" width={48} height={48} className="mx-auto mb-3 w-auto h-auto" />
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
          Bem-vinda ao NB Flow
        </h1>
        <p className="mt-1 text-sm text-white/70">Vamos configurar seu perfil</p>
      </div>

      <div className="flex-1 px-6 pt-8">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-nb-gray-warm">
                Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como voce quer ser chamada?"
                autoFocus
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-base text-nb-dark placeholder:text-nb-gray-warm/50 focus:border-nb-pink focus:outline-none focus:ring-2 focus:ring-nb-pink/20"
              />
            </div>

            <button
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-nb-pink py-3.5 text-sm font-semibold text-white shadow-lg shadow-nb-pink/25 active:scale-[0.98] disabled:opacity-40"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <p className="text-center text-sm text-nb-gray-warm">
              Adicione uma foto de perfil (opcional)
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-nb-pink-soft"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-nb-pink" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </div>

            <button
              onClick={handleFinish}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-nb-pink py-3.5 text-sm font-semibold text-white shadow-lg shadow-nb-pink/25 active:scale-[0.98]"
            >
              Comecar
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onComplete(name.trim(), "")}
              className="w-full text-center text-xs text-nb-gray-warm"
            >
              Pular por agora
            </button>
          </motion.div>
        )}
      </div>

      {/* Steps indicator */}
      <div className="flex justify-center gap-2 pb-10">
        <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? "bg-nb-pink" : "bg-nb-gray-light"}`} />
        <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? "bg-nb-pink" : "bg-nb-gray-light"}`} />
      </div>
    </div>
  );
}
