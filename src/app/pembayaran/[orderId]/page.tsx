import { redirect } from "next/navigation";

import { MockFpxActions } from "@/components/shop/mock-fpx-actions";
import { db } from "@/lib/db";
import { formatRM } from "@/lib/format";
import { requireUser } from "@/server/guards";

export const dynamic = "force-dynamic";

interface PaymentPageProps {
  params: Promise<{ orderId: string }>;
}

/** Pilihan bank simulasi FPX (text sahaja). */
const BANKS = ["Maybank", "CIMB Bank", "Public Bank", "Bank Islam"] as const;

/**
 * Halaman pembayaran mock FPX (API.md section 5).
 * Bersih, TIADA motif (kawasan transaksi). User hanya boleh lihat order
 * sendiri; PAID -> success, FAILED -> papar cuba semula.
 * Restyle sahaja — guard, query dan aliran mock kekal sama.
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
    <div className="shell py-(--space-section)">
      <div className="mx-auto w-full max-w-lg border border-line bg-paper-lift p-6 sm:p-8">
        <p className="meta-label text-cocoa">Pembayaran Selamat</p>
        <h1 className="mt-3 text-h2 text-ink">Bayaran melalui FPX</h1>

        <div className="mt-6 border border-line bg-bone p-6 text-center">
          <p className="meta-label text-cocoa">Jumlah Bayaran</p>
          <p className="mt-3 font-display text-h1 tabular-nums text-ink">
            {formatRM(order.total)}
          </p>
          <p className="mt-3 font-mono text-body-sm tabular-nums text-cocoa">
            Rujukan: {reference}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="meta-label text-cocoa">Pilih Bank Anda</h2>
          <ul className="mt-3 divide-y divide-line border border-line">
            {BANKS.map((bank) => (
              <li
                key={bank}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <span className="text-body-sm text-ink">{bank}</span>
                <span
                  aria-hidden="true"
                  className="size-3.5 rounded-full border border-line-strong"
                />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-body-sm text-cocoa">
            Halaman simulasi untuk demo. Tiada wang sebenar dipindahkan.
          </p>
        </div>

        <MockFpxActions
          orderId={order.id}
          reference={reference}
          paymentStatus={order.paymentStatus}
        />
      </div>
    </div>
  );
}
