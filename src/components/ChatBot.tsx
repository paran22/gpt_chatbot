"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: File[];
}

interface ChatBotProps {
  images?: File[];
}

export default function ChatBot({ images }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "이미지를 업로드하고, 궁금한 내용을 입력해주세요.",
      },
    ]);
  }, []);

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 아래로 이동
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      role: "user",
      content: input,
      images,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);
    setIsStreaming(false);

    try {
      const formData = new FormData();
      formData.append("message", input);
      images?.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsStreaming(true);
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        assistantMessage += text;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "죄송합니다. 오류가 발생했습니다." },
      ]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-200 text-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
