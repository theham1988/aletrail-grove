/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          primary: "#21432A",
          light: "#3A6B48",
          secondary: "#B4C5B8",
          cream: "#F5F4EF",
          text: "#122617",
          muted: "#687D6D",
          border: "#DCD9CD",
        },
        carnival: {
          red: "#B91C1C",
          gold: "#F5C24D",
          cream: "#FDF8E7",
          dark: "#2C1A12",
        },
      },
    },
  },
  plugins: [],
};
