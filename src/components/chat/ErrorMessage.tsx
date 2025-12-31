import { motion } from "framer-motion";

interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/5 text-red-200 text-sm flex items-center gap-2 backdrop-blur-sm shadow-sm"
        >
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]" />
            <span>Error: {message}</span>
            <button
                onClick={() => window.location.reload()}
                className="ml-auto hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all text-xs font-medium uppercase tracking-wide"
            >
                Reload
            </button>
        </motion.div>
    );
}
