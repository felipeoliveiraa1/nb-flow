import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GalleryItem {
  id: string;
  clientName: string;
  beforeUrl: string;
  afterUrl: string;
  flowScore: number;
  createdAt: string;
}

interface GalleryState {
  items: GalleryItem[];
  addItem: (item: Omit<GalleryItem, "id" | "createdAt">) => void;
  removeItem: (id: string) => void;
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            {
              ...item,
              id: typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2) + Date.now().toString(36),
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
    }),
    { name: "nb-gallery" }
  )
);
