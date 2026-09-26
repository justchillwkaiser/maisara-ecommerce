/**
 * Saiz imej responsif yang dikongsi.
 *
 * Nilai ini MESTI sama antara `sizes` pada <Image> dan `imageSizes` pada
 * pautan preload imej LCP (`CriticalImagePreload`). Jika berbeza, pelayar
 * memilih calon srcset yang berlainan untuk preload dan untuk <img>, lalu
 * memuat turun dua varian imej yang sama.
 */
/** Kad produk dalam grid katalog: 4 kolum desktop, 3 tablet, 2 mudah alih. */
export const GRID_SIZES = "(min-width: 1024px) 20vw, (min-width: 768px) 31vw, 46vw";
/** Imej galeri utama PDP: 7/12 kolum desktop, penuh pada mudah alih. */
export const PDP_MAIN_SIZES = "(min-width: 1024px) 52vw, 100vw";
