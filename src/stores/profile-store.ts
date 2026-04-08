import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Profile {
  name: string;
  avatarUrl: string;
  bio: string;
  level: "Iniciante" | "Pro" | "Elite" | "Master";
  xp: number;
  totalAnalyses: number;
  totalPhotos: number;
  totalPurchases: number;
  onboarded: boolean;
}

function getLevel(xp: number): Profile["level"] {
  if (xp >= 5000) return "Master";
  if (xp >= 2000) return "Elite";
  if (xp >= 500) return "Pro";
  return "Iniciante";
}

function getNextLevelXP(level: Profile["level"]): number {
  switch (level) {
    case "Iniciante": return 500;
    case "Pro": return 2000;
    case "Elite": return 5000;
    case "Master": return 10000;
  }
}

interface ProfileState {
  profile: Profile;
  setProfile: (updates: Partial<Profile>) => void;
  completeOnboarding: (name: string, avatarUrl: string) => void;
  addXP: (amount: number, type: "analysis" | "photo" | "purchase") => void;
  getProgress: () => { current: number; next: number; percent: number };
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: {
        name: "",
        avatarUrl: "",
        bio: "",
        level: "Iniciante",
        xp: 0,
        totalAnalyses: 0,
        totalPhotos: 0,
        totalPurchases: 0,
        onboarded: false,
      },

      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      completeOnboarding: (name, avatarUrl) =>
        set((state) => ({
          profile: {
            ...state.profile,
            name,
            avatarUrl,
            onboarded: true,
          },
        })),

      addXP: (amount, type) =>
        set((state) => {
          const newXP = state.profile.xp + amount;
          const updates: Partial<Profile> = {
            xp: newXP,
            level: getLevel(newXP),
          };
          if (type === "analysis") updates.totalAnalyses = state.profile.totalAnalyses + 1;
          if (type === "photo") updates.totalPhotos = state.profile.totalPhotos + 1;
          if (type === "purchase") updates.totalPurchases = state.profile.totalPurchases + 1;
          return { profile: { ...state.profile, ...updates } };
        }),

      getProgress: () => {
        const { xp, level } = get().profile;
        const thresholds = { Iniciante: 0, Pro: 500, Elite: 2000, Master: 5000 };
        const current = xp - thresholds[level];
        const next = getNextLevelXP(level) - thresholds[level];
        return { current, next, percent: Math.min(100, Math.round((current / next) * 100)) };
      },
    }),
    { name: "nb-profile" }
  )
);
