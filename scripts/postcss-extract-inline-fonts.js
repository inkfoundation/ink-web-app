// PostCSS plugin that moves base64 fonts out of @font-face rules into separate
// files, so they load on demand instead of inflating render-blocking CSS
// (@inkonchain/ink-kit's style.css embeds ~196 KB of them).
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// `next build` keeps .next/cache (and Vercel restores it), so these files live
// exactly as long as the webpack cache entries that reference them.
const OUT_DIR = path.join(__dirname, "..", ".next", "cache", "inline-fonts");

const EXTENSIONS = {
  "font/otf": "otf",
  "font/ttf": "ttf",
  "font/woff": "woff",
  "font/woff2": "woff2",
};

const DATA_URL =
  /url\(\s*(["']?)data:(font\/[a-z0-9]+);base64,([A-Za-z0-9+/=]+)\1\s*\)/g;

function writeFont(bytes, extension) {
  const hash = crypto
    .createHash("sha256")
    .update(bytes)
    .digest("hex")
    .slice(0, 16);
  const file = path.join(OUT_DIR, `${hash}.${extension}`);

  if (!fs.existsSync(file)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    // Concurrent builds may extract the same font; never expose a partial file.
    const temp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(temp, bytes);
    fs.renameSync(temp, file);
  }

  return file;
}

module.exports = () => ({
  postcssPlugin: "extract-inline-fonts",
  AtRule: {
    "font-face": (rule, { result }) => {
      const from = result.opts.from;
      if (!from) return;

      rule.walkDecls("src", (decl) => {
        decl.value = decl.value.replace(
          DATA_URL,
          (match, _quote, mime, data) => {
            const extension = EXTENSIONS[mime];
            if (!extension) return match;

            const file = writeFont(Buffer.from(data, "base64"), extension);
            const relative = path
              .relative(path.dirname(from), file)
              .split(path.sep)
              .join("/");

            return `url(${relative})`;
          }
        );
      });
    },
  },
});

module.exports.postcss = true;
