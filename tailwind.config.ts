// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ... tus colores y fuentes ...
    },
  },
  plugins: [
     require('@tailwindcss/typography'), // Asegúrate que esta línea esté presente
  ],
};
export default config;