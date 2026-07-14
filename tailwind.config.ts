import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f766e",
        ink: "#172554"
      }
    }
  },
  plugins: []
};

export default config;
