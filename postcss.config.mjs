import path from 'node:path';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // Turbopack evaluates this file from its build output, where relative
    // paths and import.meta.url don't point here, so resolve from the root.
    [path.resolve('scripts/postcss-extract-inline-fonts.js')]: {},
  },
};

export default config;
