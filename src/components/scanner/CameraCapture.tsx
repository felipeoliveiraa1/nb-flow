"use client";

import { useRef } from "react";
import { Camera, Upload } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
    e.target.value = "";
  }

  return (
    <div className="flex gap-3">
      {/* Camera button */}
      <button
        onClick={() => cameraRef.current?.click()}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-nb-pink px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-nb-pink/25 transition-all active:scale-[0.98] disabled:opacity-60"
      >
        <Camera className="h-4 w-4" />
        Tirar Foto
      </button>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFile}
        className="hidden"
      />

      {/* Upload button */}
      <button
        onClick={() => uploadRef.current?.click()}
        disabled={disabled}
        className="flex items-center justify-center gap-2 rounded-xl border border-nb-pink/20 bg-white px-4 py-3.5 text-sm font-medium text-nb-dark transition-all active:scale-[0.98] disabled:opacity-60"
      >
        <Upload className="h-4 w-4" />
      </button>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
