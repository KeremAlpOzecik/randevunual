'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

type Props = {
  visible: boolean;
  message?: string;
  onClose?: () => void;
};

export default function CopyToast({ visible, message = "Kopyalandı", onClose }: Props) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose?.(), 1800);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className="fixed right-6 bottom-6 z-50"
        >
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
