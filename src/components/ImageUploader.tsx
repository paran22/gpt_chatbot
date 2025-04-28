"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onImagesSelected: (images: File[]) => void;
}

export default function ImageUploader({
  onImagesSelected,
}: ImageUploaderProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);

    onImagesSelected(imageFiles);
  };

  const removeImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-2xl space-y-4 mx-auto my-3">
      <div className="flex items-center justify-center w-full">
        <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">이미지를 선택하세요</span>
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            <Image
              src={url}
              alt={`Uploaded image ${index + 1}`}
              width={100}
              height={100}
              className="rounded-lg object-cover"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
