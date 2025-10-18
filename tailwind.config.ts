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
      colors: {
        brand: {
          blue: '#4385B8', 
          green: '#377825', 
          gray: '#595959' 
        }
      },
      fontFamily: {
        // Fuentes aproximadas
        gothamRounded: ['Arial Rounded MT Bold', 'Helvetica Neue', 'Arial', 'sans-serif'],
        gothamBook: ['Helvetica Neue', 'Arial', 'sans-serif'],
        alleana: ['cursive'] 
      }
    },
  },
  plugins: [
     require('@tailwindcss/typography'), // Plugin para estilos de 'prose'
  ],
};
export default config;