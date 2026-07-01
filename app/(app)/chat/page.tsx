import ChatClient from "./ChatClient";

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-2xl h-[calc(100vh-57px)] flex flex-col">
      <div className="px-6 pt-6 pb-2 border-b border-gray-100">
        <h1 className="text-lg font-bold">コーチに相談する</h1>
      </div>
      <ChatClient />
    </main>
  );
}
