"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Kelewatan stagger dalam saat (DESIGN.md 9: stagger 60-80ms). */
  delay?: number;
  /** Tempoh animasi dalam saat. */
  duration?: number;
  className?: string;
}

/**
 * Fade-up reveal (DESIGN.md section 9): animate transform + opacity sahaja,
 * custom bezier 0.16,1,0.3,1, whileInView sekali sahaja. Reduced motion -> statik.
 * Client leaf sahaja; dipanggil dari Server Components.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  className,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
