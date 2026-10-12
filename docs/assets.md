# Asset provenance

All product images are local WebP files in `public/images`, sourced from DummyJSON's public demonstration catalog on 2026-10-12. Each fixture records its original `sourceId` and `sourceImage` URL in `supabase/functions/_shared/catalog.ts`. The original API is https://dummyjson.com/products?limit=0. Names, prices, descriptions, ratings and stock are illustrative demo content. The store makes no claims about these being actual purchasable products.

The hero photograph is from Unsplash: https://images.unsplash.com/photo-1600210492486-724fe5c67fb0 (local `hero.jpg`), used as illustrative interior photography. Before commercial publication, review the source's current license and attribution requirements.

Manrope is locally bundled using `@fontsource/manrope` (SIL Open Font License). Icons use Lucide (ISC). Brand mark and favicon are project SVGs.

Runtime browsing never requests DummyJSON, Unsplash or Google Fonts.
