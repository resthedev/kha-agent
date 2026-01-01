import { motion } from "framer-motion";

export function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
        >
            <h2 className="text-3xl font-serif text-[#c0caf5]">Kha's Agent</h2>
            <p className="text-[#565f89] max-w-md">
                I can help you with calculations, check the weather, and more.<br />
                Just ask freely.
            </p>
        </motion.div>
    );
}
