/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./guestterms/**/*.html",
    "./cookie-policy/**/*.html",
    "./scripts/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1da851",
        secondary: "#25d366",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};
