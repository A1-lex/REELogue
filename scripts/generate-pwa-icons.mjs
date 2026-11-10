import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { access } from "node:fs/promises";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const publicDir = path.join(root, "public");
const sourcePath = path.join(publicDir, "reelogue-svg.svg");

// Matching REELogue dark slate background palette (#080A24)
const BRAND_BACKGROUND = {
  r: 8,
  g: 10,
  b: 36,
  alpha: 1,
};

async function generateIcon(size, filename, scale = 0.82) {
  const outputPath = path.join(publicDir, filename);

  const logoBuffer = await sharp(sourcePath, {
    density: 300,
  })
    .resize(
      Math.round(size * scale),
      Math.round(size * scale),
      {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      }
    )
    .png()
    .toBuffer();

  const result = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BACKGROUND,
    },
  })
    .composite([
      {
        input: logoBuffer,
        gravity: "centre",
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(
    `Generated ${filename}: ${result.width}x${result.height}, ${result.size} bytes`
  );
}

async function main() {
  await access(sourcePath);

  // Standard PWA icons
  await generateIcon(192, "icon-192.png");
  await generateIcon(512, "icon-512.png");

  // Android Maskable icon with safe central radius
  await generateIcon(512, "icon-maskable-512.png", 0.54);

  // iOS Apple Touch Icon
  await generateIcon(180, "apple-touch-icon.png");

  console.log("✨ REELogue PWA icons generated successfully!");
}

main().catch((error) => {
  console.error("❌ Icon generation failed:", error);
  process.exitCode = 1;
});