"use client";

import { useEffect } from "react";

/**
 * Sempadan ralat akar. Fail ini menggantikan seluruh dokumen apabila ralat
 * berlaku di peringkat root layout, jadi ia TIDAK boleh bergantung pada
 * komponen aplikasi atau token CSS — semuanya digayakan secara inline dengan
 * nilai MAISARA supaya paparan kekal betul walaupun stylesheet gagal dimuat.
 *
 * Ia juga tidak di-render di dalam layout, jadi ia menyediakan landmark
 * <main> sendiri. Ralat di-log ke konsol pelayar untuk diagnosis; butiran
 * teknikal tidak pernah dipaparkan kepada pelanggan (hanya `digest`).
 * Pautan pemulihan ialah <a> biasa, bukan next/link: router mungkin tidak
 * tersedia apabila layout akar gagal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ms">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#f4efe8",
          color: "#1c1916",
          fontFamily:
            "var(--font-bricolage), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#6b5143",
            }}
          >
            MAISARA
          </p>

          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 400 }}>
            Laman tidak dapat dimuatkan.
          </h1>

          <p style={{ margin: 0, maxWidth: "28rem", color: "#6b5143" }}>
            Sila muat semula halaman. Jika masalah berterusan, hubungi kami di
            salam@maisara.my.
          </p>

          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: "44px",
                padding: "0 1.5rem",
                borderRadius: "2px",
                border: "1px solid transparent",
                background: "#1c1916",
                color: "#f4efe8",
                fontSize: "0.6875rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Cuba lagi
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "0 1.5rem",
                borderRadius: "2px",
                border: "1px solid #1c1916",
                background: "transparent",
                color: "#1c1916",
                fontSize: "0.6875rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Kembali ke utama
            </a>
          </div>

          {error.digest ? (
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6b5143",
              }}
            >
              Rujukan: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
