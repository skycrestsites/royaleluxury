/**
 * Generates favicons, the header monogram and the social share image from Logo.png.
 * Run with `npm run brand` whenever the logo changes.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SOURCE = 'Logo.png';
const PUBLIC = 'public';
const BRAND = 'src/assets/brand';
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

await mkdir(BRAND, { recursive: true });

// The crown and "R" sit in the upper centre of the source artwork.
const monogram = await cropToVisible(
  await sharp(SOURCE).extract({ left: 460, top: 0, width: 780, height: 700 }).png().toBuffer(),
);
const fullLogo = await cropToVisible(await sharp(SOURCE).png().toBuffer());

await sharp(monogram).resize({ height: 240 }).toFile(`${BRAND}/monogram.png`);
await sharp(fullLogo).resize({ width: 1200 }).toFile(`${BRAND}/logo.png`);

const square = async (size, padding, background) => {
  const inner = await sharp(monogram)
    .resize(size - padding * 2, size - padding * 2, { fit: 'contain', background: CLEAR })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toBuffer();
};

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map((size) => square(size, 0, CLEAR)));
await writeFile(`${PUBLIC}/favicon.ico`, encodeIco(icoSizes, icoImages));

await writeFile(`${PUBLIC}/favicon-32x32.png`, await square(32, 0, CLEAR));
await writeFile(`${PUBLIC}/apple-touch-icon.png`, await square(180, 22, WHITE));
await writeFile(`${PUBLIC}/icon-192.png`, await square(192, 24, WHITE));
await writeFile(`${PUBLIC}/icon-512.png`, await square(512, 64, WHITE));

const shareLogo = await sharp(fullLogo).resize({ height: 420 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: WHITE } })
  .composite([{ input: shareLogo, gravity: 'center' }])
  .jpeg({ quality: 88 })
  .toFile(`${PUBLIC}/og-image.jpg`);

console.log('Brand assets generated.');

/** Crops to pixels that are clearly visible, ignoring faint glow left in the artwork. */
async function cropToVisible(input, minAlpha = 96) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = 0, bottom = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] < minAlpha) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  return sharp(input)
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toBuffer();
}

/** Packs PNG buffers into a single .ico container. */
function encodeIco(sizes, images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map((image, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(sizes[i] % 256, 0);
    entry.writeUInt8(sizes[i] % 256, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images]);
}
