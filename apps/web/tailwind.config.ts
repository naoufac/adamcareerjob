import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adam: {
          DEFAULT: "#0f4c5c",
          accent: "#e36414",
        },
      },
    },
  },
  plugins: [],
};

export default config;
