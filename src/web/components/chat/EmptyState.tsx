import { motion } from "framer-motion";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center"
    >
      <h2 className="font-serif text-3xl text-[#c0caf5]">Kha&apos;s Agent</h2>
      <p className="max-w-md text-[#565f89]">
        I can help you with calculations, check the weather, and more.
        <br />
        Just ask freely.
      </p>
    </motion.div>
  );
}
