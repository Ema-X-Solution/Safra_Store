"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
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
        onChange([...images, data.url]);
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

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`flex w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-safra-taupe/40 bg-safra-cream/30 px-6 py-10 transition-colors hover:bg-safra-cream/50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="text-center">
          {uploading ? (
            <Loader2 className="mx-auto h-12 w-12 text-safra-gold animate-spin" />
          ) : (
            <UploadCloud className="mx-auto h-12 w-12 text-safra-olive" />
          )}
          <p className="mt-2 text-sm text-safra-dark">
            <span className="font-semibold text-safra-gold">Click to upload</span> {uploading ? "..." : "or drag and drop"}
          </p>
          <p className="text-xs text-safra-muted">PNG, JPG, WEBP up to 5MB</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
          {images.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-safra-taupe/40 bg-white">
              <Image src={src} alt={`Upload ${i}`} fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {i === 0 && (
                <div className="absolute left-2 top-2 rounded-md bg-safra-gold px-2 py-0.5 text-[10px] font-bold uppercase text-safra-dark shadow-sm">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
