import { Bot } from "lucide-react";

export function ChatHeader() {
    return (
        <header className="sticky top-0 z-10 border-b border-[#24283b]/30 bg-[#1a1b26]/70 backdrop-blur-xl px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#7aa2f7]/5 rounded-lg border border-[#7aa2f7]/5 shadow-sm">
                    <Bot className="w-6 h-6 text-[#7aa2f7]" />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-normal bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] bg-clip-text text-transparent">
                        Kha's Agent
                    </h1>
                </div>
            </div>
        </header>
    );
}
