import Link from "next/link";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
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
 * Pengesahan order (UX.md Flow A & B).
 * ?status=failed -> mesej pembayaran gagal + Cuba Semula.
 * Selain itu -> terima kasih + status menunggu pemprosesan.
 * Restyle sahaja — id order ringkas dan status sebenar kekal sama.
 */
export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { order, status } = await searchParams;
  const isFailed = status === "failed";
  const shortId = shortOrderId(order);

  if (isFailed) {
    return (
      <div className="shell flex flex-col items-center py-(--space-section) text-center">
        <span className="flex size-14 items-center justify-center rounded-xs border border-oxblood/40 text-oxblood">
          <XCircle size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-8 text-h1 text-ink">Pembayaran tidak berjaya</h1>
        <p className="mt-5 max-w-md text-body-lg text-cocoa">
          Jangan risau, jumlah tidak akan dicaj. Anda boleh cuba semula pembayaran
          {shortId ? (
            <>
              {" "}
              untuk order{" "}
              <span className="font-mono text-ink">#{shortId}</span>
            </>
          ) : null}
          .
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
    <div className="shell flex flex-col items-center py-(--space-section) text-center">
      <span className="flex size-14 items-center justify-center rounded-xs border border-line bg-bone text-ink">
        <CheckCircle size={26} aria-hidden="true" />
      </span>
      <h1 className="mt-8 text-h1 text-ink">Terima kasih!</h1>
      <p className="mt-5 text-body-lg text-cocoa">Order anda telah diterima.</p>

      {shortId ? (
        <p className="mt-8 inline-flex items-baseline gap-3 rounded-xs border border-line px-4 py-2.5">
          <span className="meta-label text-cocoa">No. Order</span>
          <span className="font-mono text-body-sm tabular-nums text-ink">
            #{shortId}
          </span>
        </p>
      ) : null}

      <Badge variant="muted" className="mt-4">
        Menunggu pemprosesan
      </Badge>

      <p className="mt-5 max-w-md text-body-sm text-cocoa">
        Kami akan mengesahkan pembayaran dan menyediakan pesanan anda. Maklumat
        penuh order boleh dilihat di akaun anda.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
