import { motion } from "framer-motion";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/5 bg-red-500/10 p-4 text-sm text-red-200 shadow-sm backdrop-blur-sm"
    >
      <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]" />
      <span>Error: {message}</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-all hover:bg-red-500/20"
      >
        Reload
      </button>
    </motion.div>
  );
}
