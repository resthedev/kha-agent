import { Bot } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#24283b]/30 bg-[#1a1b26]/70 px-6 py-4 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-[#7aa2f7]/5 bg-[#7aa2f7]/5 p-2 shadow-sm">
          <Bot className="h-6 w-6 text-[#7aa2f7]" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] bg-clip-text font-serif text-2xl font-normal text-transparent">
            Kha&apos;s Agent
          </h1>
        </div>
      </div>
    </header>
  );
}
