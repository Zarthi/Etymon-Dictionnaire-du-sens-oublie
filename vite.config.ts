import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icone.svg"],
      manifest: {
        name: "Étymon : dictionnaire du sens oublié",
        short_name: "Étymon",
        description: "Le sens premier des mots français.",
        lang: "fr",
        start_url: ".",
        display: "standalone",
        background_color: "#faf8f3",
        theme_color: "#faf8f3",
        icons: [{ src: "icone.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,json,woff2}"],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    passWithNoTests: true,
  },
});
