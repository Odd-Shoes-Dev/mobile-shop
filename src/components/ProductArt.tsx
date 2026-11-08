import { ArtIcon, type ArtCategory } from "./ArtIcon";

/** The prototype's `art(p)` placeholder box — image when one exists, else a procedural icon. */
export function ProductArt({
  category,
  seed,
  imageUrl,
  alt,
  isSample,
}: {
  category: ArtCategory;
  seed: string;
  imageUrl?: string | null;
  alt: string;
  isSample?: boolean;
}) {
  return (
    <div className="art">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- fixed-size decorative art box, not worth next/image config here
        <img src={imageUrl} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <ArtIcon category={category} seed={seed} />
      )}
      {isSample && <span className="tag-sample">SAMPLE ART</span>}
    </div>
  );
}
