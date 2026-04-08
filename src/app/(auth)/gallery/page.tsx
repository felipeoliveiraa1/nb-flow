"use client";

import { useState, useRef } from "react";
import { useGalleryStore, type GalleryItem } from "@/stores/gallery-store";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";
import { applyWatermark } from "@/lib/watermark";
import { generateStoryImage } from "@/lib/stories";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Download, Share2, Trash2, ImagePlus, ChevronLeft } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";

type ViewState = "list" | "add" | "detail";

export default function GalleryPage() {
  const { items, addItem, removeItem } = useGalleryStore();
  const { addXP } = useProfileStore();
  const [view, setView] = useState<ViewState>("list");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);

  // Add form state
  const [clientName, setClientName] = useState("");
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  }

  async function handleSave() {
    if (!beforeUrl || !afterUrl) return;
    setSaving(true);

    const watermarkedAfter = await applyWatermark(afterUrl);

    addItem({
      clientName: clientName || "Cliente",
      beforeUrl,
      afterUrl: watermarkedAfter,
      flowScore: Math.round(70 + Math.random() * 25),
    });

    addXP(30, "photo");
    setClientName("");
    setBeforeUrl(null);
    setAfterUrl(null);
    setSaving(false);
    setView("list");
  }

  async function handleShareStory(item: GalleryItem) {
    setGeneratingStory(true);
    const storyUrl = await generateStoryImage(
      item.beforeUrl,
      item.afterUrl,
      item.clientName,
      item.flowScore
    );
    setGeneratingStory(false);

    // Download the story image
    const link = document.createElement("a");
    link.download = `nb-flow-story-${item.clientName}.jpg`;
    link.href = storyUrl;
    link.click();
  }

  function handleDelete(id: string) {
    removeItem(id);
    setSelectedItem(null);
    setView("list");
  }

  return (
    <div className="px-5 pt-12 pb-8">
      <AnimatePresence mode="wait">
        {/* === LIST === */}
        {view === "list" && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-nb-dark">
                  Galeria
                </h1>
                <p className="mt-0.5 text-sm text-nb-gray-warm">
                  {items.length} {items.length === 1 ? "registro" : "registros"}
                </p>
              </div>
              <button
                onClick={() => setView("add")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-pink text-white shadow-md shadow-nb-pink/20"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-nb-pink-soft mb-4">
                  <ImagePlus className="h-8 w-8 text-nb-pink" />
                </div>
                <p className="text-sm font-medium text-nb-dark">Nenhum registro ainda</p>
                <p className="mt-1 text-xs text-nb-gray-warm">
                  Adicione seu primeiro antes e depois
                </p>
                <button
                  onClick={() => setView("add")}
                  className="mt-4 rounded-xl bg-nb-pink px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Adicionar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setView("detail"); }}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 text-left transition-transform active:scale-[0.97]"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={item.afterUrl}
                        alt={item.clientName}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 rounded-full bg-nb-pink px-2 py-0.5 text-xs font-bold text-white">
                        {item.flowScore}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-medium text-nb-dark truncate">{item.clientName}</p>
                      <p className="text-xs text-nb-gray-warm">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* === ADD === */}
        {view === "add" && (
          <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setView("list")} className="text-nb-gray-warm">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-nb-dark">
                Novo Registro
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-nb-gray-warm">
                  Nome da cliente
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-nb-dark placeholder:text-nb-gray-warm/50 focus:border-nb-pink focus:outline-none focus:ring-2 focus:ring-nb-pink/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Before */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-nb-gray-warm">
                    Antes
                  </label>
                  <button
                    onClick={() => beforeRef.current?.click()}
                    className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-black/10 bg-nb-gray-light"
                  >
                    {beforeUrl ? (
                      <img src={beforeUrl} alt="Antes" className="h-full w-full object-cover" />
                    ) : (
                      <Plus className="h-6 w-6 text-nb-gray-warm" />
                    )}
                  </button>
                  <input ref={beforeRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, setBeforeUrl)} className="hidden" />
                </div>

                {/* After */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-nb-gray-warm">
                    Depois
                  </label>
                  <button
                    onClick={() => afterRef.current?.click()}
                    className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-black/10 bg-nb-gray-light"
                  >
                    {afterUrl ? (
                      <img src={afterUrl} alt="Depois" className="h-full w-full object-cover" />
                    ) : (
                      <Plus className="h-6 w-6 text-nb-gray-warm" />
                    )}
                  </button>
                  <input ref={afterRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, setAfterUrl)} className="hidden" />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!beforeUrl || !afterUrl || saving}
                className="w-full rounded-xl bg-nb-pink py-3.5 text-sm font-semibold text-white shadow-lg shadow-nb-pink/20 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {saving ? "Salvando..." : "Salvar com marca d'agua NB"}
              </button>
            </div>
          </motion.div>
        )}

        {/* === DETAIL === */}
        {view === "detail" && selectedItem && (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setView("list")} className="text-nb-gray-warm">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h1 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-nb-dark">
                  {selectedItem.clientName}
                </h1>
                <p className="text-xs text-nb-gray-warm">
                  {new Date(selectedItem.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="rounded-full bg-nb-pink px-3 py-1 text-sm font-bold text-white">
                {selectedItem.flowScore}
              </div>
            </div>

            <BeforeAfterSlider
              beforeUrl={selectedItem.beforeUrl}
              afterUrl={selectedItem.afterUrl}
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleShareStory(selectedItem)}
                disabled={generatingStory}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-nb-pink py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              >
                <Share2 className="h-4 w-4" />
                {generatingStory ? "Gerando..." : "Template Stories"}
              </button>
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 text-red-400 transition-all active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
