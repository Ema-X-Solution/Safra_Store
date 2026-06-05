"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Images } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      toast.error(`"${file.name}" is not an image file.`);
      return null;
    }

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
      return data.url || null;
    } catch (err: any) {
      toast.error(`Failed to upload "${file.name}": ${err.message}`);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const total = files.length;

    setTotalCount(total);
    setUploadingCount(total);

    // Upload all files in parallel
    const uploadPromises = files.map(async (file) => {
      const url = await uploadSingleFile(file);
      setUploadingCount((prev) => prev - 1);
      return url;
    });

    const results = await Promise.all(uploadPromises);
    const successfulUrls = results.filter((url): url is string => url !== null);

    if (successfulUrls.length > 0) {
      onChange([...images, ...successfulUrls]);
      toast.success(
        successfulUrls.length === total
          ? `${total} image${total > 1 ? "s" : ""} uploaded successfully!`
          : `${successfulUrls.length} of ${total} images uploaded.`
      );
    }

    setTotalCount(0);
    setUploadingCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const isUploading = uploadingCount > 0;
  const uploadedCount = totalCount - uploadingCount;

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Drop Zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`flex w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-safra-taupe/40 bg-safra-cream/30 px-6 py-10 transition-all hover:border-safra-gold/60 hover:bg-safra-cream/50 ${isUploading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <div className="text-center">
          {isUploading ? (
            <>
              <div className="relative mx-auto h-14 w-14">
                <Loader2 className="h-14 w-14 text-safra-gold animate-spin" />
              </div>
              <p className="mt-3 text-sm font-semibold text-safra-dark">
                Uploading {uploadedCount}/{totalCount} images...
              </p>
              {/* Progress bar */}
              <div className="mt-3 w-48 mx-auto h-1.5 rounded-full bg-safra-taupe/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-safra-gold transition-all duration-300"
                  style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative mx-auto h-12 w-12">
                <UploadCloud className="h-12 w-12 text-safra-olive" />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-safra-gold p-0.5">
                  <Images className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <p className="mt-3 text-sm text-safra-dark">
                <span className="font-semibold text-safra-gold">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs text-safra-muted">
                Select <span className="font-semibold">multiple images</span> at once — PNG, JPG, WEBP up to 5MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-safra-muted">
            {images.length} image{images.length > 1 ? "s" : ""} · First image is the primary
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {images.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm"
              >
                <Image src={src} alt={`Upload ${i}`} fill className="object-cover" />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Primary badge */}
                {i === 0 && (
                  <div className="absolute left-2 top-2 rounded-md bg-safra-gold px-2 py-0.5 text-[10px] font-bold uppercase text-safra-dark shadow-sm">
                    Primary
                  </div>
                )}
                {/* Index badge for non-primary */}
                {i > 0 && (
                  <div className="absolute right-2 top-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
