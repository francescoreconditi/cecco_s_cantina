import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          50: '#fdf2f3',
          100: '#fce7e9',
          200: '#f9d0d7',
          300: '#f4a8b5',
          400: '#ec758d',
          500: '#e04968',
          600: '#cc2952',
          700: '#ab1f45',
          800: '#8f1c3f',
          900: '#7a1c3b',
          950: '#450b1d',
        },
      },
    },
  },
  plugins: [],
};

export default config;
