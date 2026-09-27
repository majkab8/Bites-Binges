/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  experimentalTernaries: true,

  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["clsx", "cn", "cva", "tw", "twMerge"],
  tailwindAttributes: ["classList"],

  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: { printWidth: 80, proseWrap: "always" },
    },
  ],
};

export default config;
