"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

type InfoModalProps = {
  isOpen: boolean;
  children: ReactNode;
  closeButton: ReactNode;
};

export default function InfoModal({
  isOpen,
  children,
  closeButton,
}: InfoModalProps) {
  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <motion.div
              className="text-white p-2 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.3 }}
            >
              <div className="flex justify-end p-8">{closeButton}</div>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
