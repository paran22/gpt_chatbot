"use client";

import ChatBot from "@/components/ChatBot";
import ImageUploader from "@/components/ImageUploader";
import { useState } from "react";

export default function Home() {
  const [images, setImages] = useState<File[]>([]);

  console.log(images);

  const handleImagesSelected = (selectedImages: File[]) => {
    setImages(selectedImages);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Chatbot</h1>
        <ImageUploader onImagesSelected={handleImagesSelected} />
        <ChatBot images={images} />
      </div>
    </main>
  );
}
