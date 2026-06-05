import { motion, AnimatePresence } from "motion/react";

export function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 bg-[#13151B]/95 border border-white/10 text-white px-4 py-2 rounded-xl shadow-xl"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
