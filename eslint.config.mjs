import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import svgJsx from "eslint-plugin-svg-jsx";
import unusedImports from "eslint-plugin-unused-imports";

const config = [
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "public/",
      // Plain Node build/tooling scripts, never linted under `next lint` either.
      "scripts/",
      "next-env.d.ts",
      "src/app/icon.svg",
    ],
  },
  ...nextCoreWebVitals,
  prettier,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "svg-jsx": svgJsx,
      "unused-imports": unusedImports,
    },
    rules: {
      "react-hooks/exhaustive-deps": "error",
      // React Compiler-derived rules introduced by eslint-plugin-react-hooks v7
      // (via eslint-config-next@16). Surfaced as warnings until the existing
      // call sites are refactored.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "import/newline-after-import": ["error", { count: 1 }],
      "unused-imports/no-unused-imports": "warn",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react", "^@?\\w"],
            ["^(@)(/.*|$)"],
            ["^\\u0000"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.?(css)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "svg-jsx/camel-case-dash": "error",
      "svg-jsx/camel-case-colon": "error",
      "svg-jsx/no-style-string": "error",
      // We don't use the pages directory for routing.
      "@next/next/no-html-link-for-pages": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message:
                "Use @/routing instead of next/link to have proper localization and typing.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
