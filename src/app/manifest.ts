import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Viste.ai",
    short_name: "Viste.ai",
    description: "AI implementation for established businesses",
    start_url: "/",
    display: "standalone",
    background_color: "#071415",
    theme_color: "#071415",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
