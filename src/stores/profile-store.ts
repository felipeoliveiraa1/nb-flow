import { create } from "zustand";

export interface Profile {
  id: string;
  full_name: string;
  level: "Iniciante" | "Pro" | "Elite" | "Master";
  xp: number;
  avatar_url: string;
  total_procedures: number;
}

interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  addXP: (amount: number) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  addXP: (amount) =>
    set((state) => {
      if (!state.profile) return state;
      const newXP = state.profile.xp + amount;
      let level: Profile["level"] = "Iniciante";
      if (newXP >= 5000) level = "Master";
      else if (newXP >= 2000) level = "Elite";
      else if (newXP >= 500) level = "Pro";
      return { profile: { ...state.profile, xp: newXP, level } };
    }),
}));
