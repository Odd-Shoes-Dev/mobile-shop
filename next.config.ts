import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      // Matches any ImageKit URL endpoint; narrow this to your own
      // IMAGEKIT_URL_ENDPOINT host once it's set.
      { protocol: "https", hostname: "ik.imagekit.io" },
      // Dev-only stock product photos (one per category) — remove once
      // real product images are uploaded via ImageKit.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
