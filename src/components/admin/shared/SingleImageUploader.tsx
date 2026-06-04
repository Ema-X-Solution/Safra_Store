"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export default function SingleImageUploader({ value, onChange, label, aspectRatio = "auto" }: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        throw new Error("No URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const aspectClass = aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "h-40";

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-safra-dark">{label}</label>}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-safra-taupe/40 bg-safra-cream/30 transition-colors hover:bg-safra-cream/50 ${aspectClass} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {value ? (
          <>
            <Image src={value} alt={label || "Uploaded image"} fill className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            {uploading ? (
              <Loader2 className="mx-auto h-8 w-8 text-safra-gold animate-spin" />
            ) : (
              <UploadCloud className="mx-auto h-8 w-8 text-safra-olive" />
            )}
            <p className="mt-2 text-xs text-safra-dark">
              <span className="font-semibold text-safra-gold">Click to upload</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
