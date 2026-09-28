/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}": ["eslint --fix --max-warnings=0 --no-warn-ignored"],
  "*": ["prettier --write --ignore-unknown"],
};

export default config;
