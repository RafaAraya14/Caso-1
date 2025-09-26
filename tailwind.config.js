/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9", // barra superior como tu ejemplo
          800: "#5b21b6",
          900: "#4c1d95",
        }
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(0,0,0,.25)'
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
}
