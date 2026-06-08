// src\components\dashboard\LogoutModal.tsx

import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";

interface LogoutModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onCancel, onConfirm }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#13151B] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
          >
            <h3
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 600,
                fontSize: "18px",
              }}
              className="text-white mb-2"
            >
              Confirm Logout
            </h3>
            <p
              style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
              className="text-white/50 mb-6"
            >
              Your progress is saved. You can continue any time.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl"
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
