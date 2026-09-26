"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircle,
  Info,
  SpinnerGap,
  Warning,
  XCircle,
} from "@phosphor-icons/react";

/**
 * Toaster MAISARA.
 *
 * Tema toast ditakrifkan dalam `globals.css` pada `[data-sonner-toaster]`,
 * jadi komponen ini tidak menetapkan warna secara inline. Itu mengelakkan
 * dua sumber kebenaran untuk palet yang sama, dan memastikan notifikasi
 * cart serta borang kekal dalam sistem warna MAISARA.
 *
 * Aplikasi ini paparan cerah sahaja (tiada ThemeProvider dipasang), jadi
 * tema dikunci kepada "light" dan bukan dibaca daripada next-themes.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CheckCircle className="size-4" />,
        info: <Info className="size-4" />,
        warning: <Warning className="size-4" />,
        error: <XCircle className="size-4" />,
        loading: <SpinnerGap className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
