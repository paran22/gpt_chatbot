import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Chatbot</h1>
        <ChatBot />
      </div>
    </main>
  );
}
