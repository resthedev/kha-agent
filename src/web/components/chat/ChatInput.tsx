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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1b26] via-[#1a1b26]/95 to-transparent" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <form onSubmit={onSubmit} className="group relative">
          <input
            className="w-full rounded-2xl border border-[#2f3549]/30 bg-[#16161e]/50 py-5 pl-6 pr-14 text-[#c0caf5] placeholder-[#565f89] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-xl transition-colors duration-200 ease-out focus:border-[#7aa2f7]/30 focus:bg-[#16161e]/80 focus:outline-none"
            value={input}
            placeholder="Type your message..."
            onChange={onInputChange}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-3 rounded-xl bg-gradient-to-br from-[#7aa2f7] to-[#6a92e7] p-2.5 text-[#15161e] transition-all duration-300 ease-out hover:shadow-[0_0_15px_-3px_rgba(122,162,247,0.15)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
