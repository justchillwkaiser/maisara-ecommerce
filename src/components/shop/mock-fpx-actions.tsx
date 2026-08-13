"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Aksi simulasi FPX (DESIGN.md 8, UX.md Flow B).
 * "Bayaran Berjaya" -> POST /api/payments/callback (paid) -> /order/success.
 * "Bayaran Gagal" -> POST /api/payments/callback (failed) -> /order/success?status=failed.
 * Jika order FAILED (cuba semula): POST /api/payments/[orderId] untuk
 * reference baru, kemudian kembali ke halaman pembayaran.
 */

interface MockFpxActionsProps {
  orderId: string;
  reference: string;
  paymentStatus: "PENDING" | "FAILED" | "PAID";
}

export function MockFpxActions({ orderId, reference, paymentStatus }: MockFpxActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function sendCallback(status: "paid" | "failed") {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/payments/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, status }),
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(
          typeof body?.error?.message === "string"
            ? body.error.message
            : "Pembayaran gagal diproses. Sila cuba lagi.",
        );
        return;
      }
      if (status === "paid") {
        router.push(`/order/success?order=${orderId}`);
      } else {
        router.push(`/order/success?status=failed&order=${orderId}`);
      }
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  async function retryPayment() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch(`/api/payments/${orderId}`, {
        method: "POST",
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(
          typeof body?.error?.message === "string"
            ? body.error.message
            : "Gagal memulakan semula pembayaran.",
        );
        return;
      }
      const result = (await response.json()) as { redirectUrl: string };
      router.push(result.redirectUrl);
      router.refresh();
    } catch {
      toast.error("Ralat dalaman. Sila cuba sebentar lagi.");
    } finally {
      setPending(false);
    }
  }

  if (paymentStatus === "FAILED") {
    return (
      <div className="mt-6 rounded-xl border border-danger/30 bg-danger/5 p-4 text-center">
        <p className="text-sm font-medium text-danger">Pembayaran tidak berjaya</p>
        <p className="mt-1 text-xs text-ink-soft">
          Jangan risau, jumlah tidak akan dicaj. Anda boleh cuba semula.
        </p>
        <Button type="button" size="lg" className="mt-4 w-full" disabled={pending} onClick={() => void retryPayment()}>
          {pending ? "Memproses..." : "Cuba Semula"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={pending || !reference}
        onClick={() => void sendCallback("paid")}
      >
        {pending ? "Memproses..." : "Bayaran Berjaya"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full border-danger/40 text-danger hover:border-danger hover:bg-danger/5 hover:text-danger"
        disabled={pending || !reference}
        onClick={() => void sendCallback("failed")}
      >
        Bayaran Gagal
      </Button>
    </div>
  );
}
