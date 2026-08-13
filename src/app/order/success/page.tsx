import Link from "next/link";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
export const dynamic = "force-dynamic";

interface OrderSuccessPageProps {
  searchParams: Promise<{ order?: string; status?: string }>;
}

/** ID order ringkas untuk paparan (cuid penuh terlalu panjang). */
function shortOrderId(orderId: string | undefined): string {
  return orderId && orderId.length > 8 ? orderId.slice(0, 8).toUpperCase() : "";
}

/**
 * Pengesahan order (UX.md Flow A & B, DESIGN.md 8).
 * ?status=failed -> mesej pembayaran gagal + Cuba Semula.
 * Selain itu -> terima kasih + status menunggu pemprosesan.
 */
export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { order, status } = await searchParams;
  const isFailed = status === "failed";
  const shortId = shortOrderId(order);

  if (isFailed) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger">
          <XCircle size={30} />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-ink">Pembayaran tidak berjaya</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Jangan risau, jumlah tidak akan dicaj. Anda boleh cuba semula pembayaran
          {shortId ? (
            <>
              {" "}
              untuk order <span className="font-medium text-ink">#{shortId}</span>
            </>
          ) : null}
          .
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {order && (
            <Button asChild size="lg">
              <Link href={`/pembayaran/${order}`}>Cuba Semula</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link href="/koleksi">Teruskan Membeli</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-gold-tint text-gold">
        <CheckCircle size={30} />
      </div>
      <h1 className="mt-6 font-serif text-3xl text-ink">Terima kasih!</h1>
      <p className="mt-2 text-sm text-ink-soft">Order anda telah diterima.</p>
      {shortId && (
        <p className="mt-4 rounded-full border border-line px-4 py-1.5 text-sm text-ink tabular-nums">
          No. Order <span className="font-medium">#{shortId}</span>
        </p>
      )}
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-tint/60 px-4 py-1.5 text-xs font-medium text-gold-deep">
        Menunggu pemprosesan
      </p>
      <p className="mt-4 max-w-sm text-sm text-ink-soft">
        Kami akan mengesahkan pembayaran dan menyediakan pesanan anda. Maklumat
        penuh order boleh dilihat di akaun anda.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/akaun/order">Lihat Order Saya</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/koleksi">Teruskan Membeli</Link>
        </Button>
      </div>
    </div>
  );
}
