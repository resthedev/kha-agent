import { Send } from "lucide-react";

interface ChatInputProps {
    input: string;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) {
    return (
        <div className="sticky bottom-0 bg-transparent p-4">
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b26] via-[#1a1b26]/95 to-transparent pointer-events-none" />
            <div className="max-w-3xl mx-auto relative z-10">
                <form onSubmit={onSubmit} className="relative group">
                    <input
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl pl-6 pr-14 py-5 text-[#c0caf5] placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all duration-300 ease-out shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] backdrop-blur-3xl ring-1 ring-white/5"
                        value={input}
                        placeholder="Type your message..."
                        onChange={onInputChange}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 top-3 p-2.5 rounded-xl bg-gradient-to-br from-[#7aa2f7] to-[#6a92e7] hover:shadow-[0_0_15px_-3px_rgba(122,162,247,0.15)] text-[#15161e] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 ease-out"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
