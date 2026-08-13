import { redirect } from "next/navigation";

import { MockFpxActions } from "@/components/shop/mock-fpx-actions";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/format";
import { requireUser } from "@/server/guards";

interface PaymentPageProps {
  params: Promise<{ orderId: string }>;
}

/** Pilihan bank simulasi FPX (text sahaja, DESIGN.md 8). */
const BANKS = ["Maybank", "CIMB Bank", "Public Bank", "Bank Islam"] as const;

/**
 * Halaman pembayaran mock FPX (API.md section 5, DESIGN.md 8).
 * Bersih, TIADA motif (kawasan transaksi). User hanya boleh lihat order
 * sendiri; PAID -> success, FAILED -> papar cuba semula.
 */
export default async function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = await params;

  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    redirect(`/log-masuk?next=/pembayaran/${orderId}`);
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || order.userId !== userId) {
    redirect("/");
  }
  if (order.paymentStatus === "PAID") {
    redirect(`/order/success?order=${orderId}`);
  }

  const reference = order.payment?.reference ?? "";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-12">
      <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <p className="text-xs tracking-wide text-ink-soft uppercase">Pembayaran Selamat</p>
        <h1 className="mt-1 font-serif text-2xl text-ink">Bayaran melalui FPX</h1>

        <div className="mt-6 rounded-xl bg-gold-tint/50 p-5 text-center">
          <p className="text-xs text-ink-soft">Jumlah Bayaran</p>
          <p className="mt-1 font-serif text-4xl text-ink tabular-nums">
            {formatRM(order.total)}
          </p>
          <p className="mt-2 text-xs text-ink-soft tabular-nums">Rujukan: {reference}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
            Pilih Bank Anda
          </h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {BANKS.map((bank) => (
              <li key={bank} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-ink">{bank}</span>
                <span className="size-4 rounded-full border border-line" aria-hidden />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Halaman simulasi untuk demo. Tiada wang sebenar dipindahkan.
          </p>
        </div>

        <MockFpxActions orderId={order.id} reference={reference} paymentStatus={order.paymentStatus} />
      </div>
    </div>
  );
}
