import { AdminOrderList } from "@/components/admin/admin-order-status";
import { listAllOrders } from "@/server/services/order.service";

/**
 * Pengurusan order admin (UX.md section 4 - Order).
 * Senarai semua order + detail expand + dropdown status (transition sah sahaja).
 */
export default async function AdminOrderPage() {
  const orders = await listAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium text-ink">Order</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {orders.length} order keseluruhan
        </p>
      </div>

      <AdminOrderList orders={orders} />
    </div>
  );
}
