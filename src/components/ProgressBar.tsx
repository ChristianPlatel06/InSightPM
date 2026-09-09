"use client";
import { motion } from "framer-motion";

export default function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-blue-500"
      />
    </div>
  );
}
