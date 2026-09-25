import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import { grammaire, messages } from "./src/i18n/index.ts";

export default defineConfig({
  // Chemins relatifs : le site fonctionne à la racine comme dans un sous-dossier (GitHub Pages).
  base: "./",
  plugins: [
    svelte(),
    // La page d'accueil et le manifeste prennent leurs textes dans la langue de l'application (src/i18n).
    {
      name: "langue-de-l-application",
      transformIndexHtml: (html) =>
        html.replace("%LANGUE%", grammaire.code).replace("%DESCRIPTION%", messages.description).replace("%TITRE%", messages.titreDocument),
    },
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icone.svg", "apple-touch-icon.png"],
      manifest: {
        name: messages.titreDocument,
        short_name: messages.titre,
        description: messages.devise,
        lang: grammaire.code,
        start_url: ".",
        display: "standalone",
        background_color: "#faf8f3",
        theme_color: "#faf8f3",
        icons: [
          { src: "icone-192.png", sizes: "192x192", type: "image/png" },
          { src: "icone-512.png", sizes: "512x512", type: "image/png" },
          { src: "icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "icone.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,woff2}"],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    passWithNoTests: true,
  },
});
