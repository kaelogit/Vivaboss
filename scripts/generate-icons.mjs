import sharp from "sharp";
import fs from "fs/promises";

const src = "public/brand/logo-mark.png";
const meta = await sharp(src).metadata();
console.log("source", meta.width, meta.height, meta.hasAlpha);

await fs.mkdir("public/icons", { recursive: true });

async function squarePng(size, out, background) {
  const buf = await sharp(src)
    .resize(size, size, {
      fit: "contain",
      background,
    })
    .png()
    .toBuffer();
  await fs.writeFile(out, buf);
  console.log("wrote", out, buf.length);
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
// Apple touch icons look better on solid brand charcoal
const charcoal = { r: 18, g: 17, b: 16, alpha: 1 };

await squarePng(32, "src/app/icon.png", transparent);
await squarePng(180, "src/app/apple-icon.png", charcoal);
await squarePng(16, "public/icons/icon-16.png", transparent);
await squarePng(32, "public/icons/icon-32.png", transparent);
await squarePng(48, "public/icons/icon-48.png", transparent);
await squarePng(192, "public/icons/icon-192.png", charcoal);
await squarePng(512, "public/icons/icon-512.png", charcoal);

// Build a multi-size ICO from PNGs (manual ICO packing)
async function pngToIco(pngPaths, outIco) {
  const images = [];
  for (const p of pngPaths) {
    const png = await fs.readFile(p);
    // Prefer raw bitmap for classic ICO — use sharp to get raw RGBA + encode as PNG in ICO
    images.push(png);
  }

  // ICO with PNG-compressed images (Vista+)
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const img of images) {
    const meta = await sharp(img).metadata();
    const w = meta.width === 256 ? 0 : meta.width;
    const h = meta.height === 256 ? 0 : meta.height;
    entries.push({ w, h, size: img.length, offset, img });
    offset += img.length;
  }

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0); // reserved
  buf.writeUInt16LE(1, 2); // type icon
  buf.writeUInt16LE(count, 4);
  let entryAt = 6;
  for (const e of entries) {
    buf.writeUInt8(e.w, entryAt);
    buf.writeUInt8(e.h, entryAt + 1);
    buf.writeUInt8(0, entryAt + 2); // color palette
    buf.writeUInt8(0, entryAt + 3);
    buf.writeUInt16LE(1, entryAt + 4); // planes
    buf.writeUInt16LE(32, entryAt + 6); // bit count
    buf.writeUInt32LE(e.size, entryAt + 8);
    buf.writeUInt32LE(e.offset, entryAt + 12);
    e.img.copy(buf, e.offset);
    entryAt += 16;
  }
  await fs.writeFile(outIco, buf);
  console.log("wrote", outIco, buf.length);
}

await pngToIco(
  ["public/icons/icon-16.png", "public/icons/icon-32.png", "public/icons/icon-48.png"],
  "src/app/favicon.ico"
);

console.log("done");
