"use client";

import { Plus } from "@phosphor-icons/react";
import { createContext, useContext, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { GRID_SIZES } from "@/lib/image-sizes";
import type { ProductSummary } from "@/server/services/product.service";

import { ProductCard } from "./product-card";

/**
 * Set hasil koleksi (klien): grid produk, pagination "Muat lagi", kiraan hasil
 * dan tapisan ketersediaan.
 *
 * Ketersediaan bukan parameter `listProducts` (service tiada tapisan stok), jadi
 * ia ditapis pada set yang sudah dimuatkan. Grid, kiraan di tajuk dan butang
 * "Kosongkan" berkongsi satu context supaya ketiga-tiganya tidak pernah
 * menunjukkan angka yang bercanggah.
 */

const GRID_CLASSES =
  "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5";

export type KoleksiAvailability = "all" | "in-stock";

interface KoleksiResultsValue {
  /** Semua produk yang sudah dimuatkan (SSR + "Muat lagi"). */
  loaded: ProductSummary[];
  /** Produk yang lolos tapisan ketersediaan. */
  visible: ProductSummary[];
  /** Bilangan produk ada stok dalam set yang dimuatkan. */
  availableCount: number;
  availability: KoleksiAvailability;
  setAvailability: (next: KoleksiAvailability) => void;
  hasMore: boolean;
  loading: boolean;
  error: boolean;
  loadMore: () => void;
  /** Teks untuk aria-live selepas kelompok baharu dimuatkan. */
  announcement: string;
}

const KoleksiResultsContext = createContext<KoleksiResultsValue | null>(null);

export function useKoleksiResults(): KoleksiResultsValue {
  const value = useContext(KoleksiResultsContext);
  if (!value) {
    throw new Error("KoleksiResultsProvider diperlukan untuk komponen koleksi.");
  }
  return value;
}

interface KoleksiResultsProviderProps {
  initialItems: ProductSummary[];
  /** Query string tanpa page (cth. "category=tudung&sort=price-asc"). */
  queryString: string;
  nextPage: number;
  hasMore: boolean;
  children: React.ReactNode;
}

/**
 * Pemilik state hasil koleksi. Parent meletakkan `key` pada provider ini
 * (query string tanpa page) supaya setiap perubahan tapisan bermula dari set
 * server yang baharu — sama seperti corak lama pada komponen pagination.
 */
export function KoleksiResultsProvider({
  initialItems,
  queryString,
  nextPage: initialNextPage,
  hasMore: initialHasMore,
  children,
}: KoleksiResultsProviderProps) {
  const [loaded, setLoaded] = useState(initialItems);
  const [nextPage, setNextPage] = useState(initialNextPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [availability, setAvailability] = useState<KoleksiAvailability>("all");
  const [announcement, setAnnouncement] = useState("");

  // `minStock` sejajar dengan badge "Habis" pada ProductCard: 0 bermakna ada
  // varian yang kehabisan, jadi hanya produk > 0 dikira benar-benar ada stok.
  const available = useMemo(
    () => loaded.filter((product) => product.minStock > 0),
    [loaded],
  );
  const visible = availability === "in-stock" ? available : loaded;

  async function loadMore() {
    setLoading(true);
    setFailed(false);
    try {
      const query = queryString ? `${queryString}&page=${nextPage}` : `page=${nextPage}`;
      const response = await fetch(`/api/products?${query}`);
      if (!response.ok) throw new Error("Gagal memuat produk");
      const data: { items: ProductSummary[]; total: number } = await response.json();
      const shown = loaded.length + data.items.length;
      setLoaded((prev) => [...prev, ...data.items]);
      setNextPage((prev) => prev + 1);
      setHasMore(shown < data.total);
      setAnnouncement(
        `${data.items.length} produk lagi dimuatkan. ${shown} daripada ${data.total} produk dipaparkan.`,
      );
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KoleksiResultsContext.Provider
      value={{
        loaded,
        visible,
        availableCount: available.length,
        availability,
        setAvailability,
        hasMore,
        loading,
        error: failed,
        loadMore,
        announcement,
      }}
    >
      {children}
    </KoleksiResultsContext.Provider>
  );
}

/** Kiraan mono hasil: jumlah sebenar dari server, atau pecahan bila ketersediaan ditapis. */
export function KoleksiResultCount({ total }: { total: number }) {
  const { availability, availableCount, loaded } = useKoleksiResults();

  const label =
    availability === "in-stock"
      ? `${availableCount} ada stok · ${loaded.length} dimuatkan`
      : `${total} produk`;

  return (
    <p aria-live="polite" className="font-mono text-body-sm tabular-nums text-cocoa">
      {label}
    </p>
  );
}

function CardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-4/5 w-full rounded-sm" />
      <Skeleton className="mt-4 h-5 w-3/4 rounded-xs" />
      <Skeleton className="mt-2 h-4 w-1/3 rounded-xs" />
    </div>
  );
}

/** Grid produk + pagination. Keadaan kosong peringkat server di luar komponen ini. */
export function KoleksiResults() {
  const { visible, loaded, availability, setAvailability, loading } =
    useKoleksiResults();

  // Tapisan ketersediaan klien boleh mengosongkan grid walaupun kategori ada
  // produk — keadaan ini berbeza daripada "tiada hasil untuk tapisan ini".
  if (availability === "in-stock" && visible.length === 0 && loaded.length > 0) {
    return (
      <EmptyState
        eyebrow="Ketersediaan"
        title="Tiada produk ada stok dalam senarai ini"
        description={`Kesemua ${loaded.length} produk yang dimuatkan tiada stok. Muat lagi untuk menyemak baki koleksi.`}
      >
        <Button variant="outline" type="button" onClick={() => setAvailability("all")}>
          Tunjukkan semua produk
        </Button>
      </EmptyState>
    );
  }

  return (
    <>
      {/* Tajuk tersembunyi: halaman menetapkan h1 (SHOP ALL) dan kad produk
          menggunakan h3, jadi aras h2 perlu wujud supaya hierarki tajuk tidak
          melangkau. Ia juga memberi nama kepada kawasan grid untuk pembaca
          skrin. */}
      <h2 className="sr-only">Hasil carian produk</h2>
      <div className={GRID_CLASSES}>
        {visible.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            sizes={GRID_SIZES}
            eager={index < 4}
          />
        ))}
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <CardSkeleton key={`skeleton-${index}`} />
            ))
          : null}
      </div>
      <LoadMore />
    </>
  );
}

/**
 * "Muat lagi": hantar permintaan page seterusnya ke /api/products dan tambah
 * hasil tanpa navigation. Set baharu diumumkan melalui aria-live supaya
 * pengguna pembaca skrin tahu grid bertambah.
 */
export function LoadMore() {
  const { hasMore, loading, error, loadMore, announcement } = useKoleksiResults();

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {error ? (
        <div role="alert" className="mt-12 flex flex-col items-center gap-4">
          <p className="text-body-sm text-cocoa">
            Gagal memuat produk. Sambungan mungkin terganggu.
          </p>
          <Button variant="outline" type="button" onClick={() => void loadMore()}>
            Cuba semula
          </Button>
        </div>
      ) : null}

      {!error && hasMore && !loading ? (
        <div className="mt-12 flex justify-center">
          <Button variant="outline" type="button" onClick={() => void loadMore()}>
            <Plus size={15} aria-hidden="true" />
            Muat lagi
          </Button>
        </div>
      ) : null}
    </>
  );
}