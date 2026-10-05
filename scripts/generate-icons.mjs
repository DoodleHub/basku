// Renders every app icon from the leaf logo (components/ui/icons.tsx).
// Run with `npm run icons` after changing the logo or brand colours.
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import { writeFileSync } from "node:fs";

// --color-brand-600 and --color-canvas (light theme).
const BRAND = "#2f653e";
const CANVAS = "#faf8f4";

const LEAF = "M28.5 3.5C16.4 3.3 7.6 9 7.1 19.6c-.1 2.4.4 4.4 1.3 5.8 10.4-.6 18.4-8.3 20.1-21.9Z";
const VEIN = "M9.5 24c3.6-5.6 8.4-10.8 14.5-15";
const STEM = "M8.4 25.4 4 29";

const leaf = (size) =>
  h(
    "svg",
    { width: size, height: size, viewBox: "0 0 32 32", fill: "none" },
    h("path", { fill: CANVAS, d: LEAF }),
    h("path", { stroke: BRAND, strokeWidth: 1.5, strokeLinecap: "round", d: VEIN }),
    h("path", { stroke: CANVAS, strokeWidth: 2, strokeLinecap: "round", d: STEM }),
  );

// leafRatio: share of the canvas the glyph fills. Maskable icons keep it
// inside the 80% safe zone; Apple applies its own corner mask, so no radius.
async function png(size, { leafRatio, radius }) {
  const res = new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND,
          borderRadius: radius * size,
        },
      },
      leaf(Math.round(size * leafRatio)),
    ),
    { width: size, height: size },
  );
  return Buffer.from(await res.arrayBuffer());
}

/** Packs PNGs into a .ico (PNG-compressed entries, supported everywhere). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const rounded = { leafRatio: 0.62, radius: 0.22 };
// Small sizes get a bigger glyph so the leaf stays readable in a tab.
const favicon = { leafRatio: 0.78, radius: 0.22 };

writeFileSync("public/icons/icon-192.png", await png(192, rounded));
writeFileSync("public/icons/icon-512.png", await png(512, rounded));
writeFileSync("public/icons/icon-maskable-512.png", await png(512, { leafRatio: 0.5, radius: 0 }));
writeFileSync("app/apple-icon.png", await png(180, { leafRatio: 0.58, radius: 0 }));
writeFileSync(
  "app/favicon.ico",
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size, favicon) })))),
);

// Scalable favicon for modern browsers, crisp at any zoom level.
writeFileSync(
  "app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${BRAND}"/>
  <g transform="translate(3.5 3.5) scale(0.78)">
    <path fill="${CANVAS}" d="${LEAF}"/>
    <path fill="none" stroke="${BRAND}" stroke-width="1.5" stroke-linecap="round" d="${VEIN}"/>
    <path fill="none" stroke="${CANVAS}" stroke-width="2" stroke-linecap="round" d="${STEM}"/>
  </g>
</svg>
`,
);

console.log("Icons written.");
