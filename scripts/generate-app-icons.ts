/**
 * Genera favicon.ico, logo-192.png y logo-512.png desde public/LogoRedes.png
 * Ejecutar: npx tsx scripts/generate-app-icons.ts
 */
import * as fs from "fs";
import * as path from "path";

async function main() {
  const sharp = await import("sharp");
  const toIcoMod = await import("to-ico");
  const toIco = typeof toIcoMod.default === "function" ? toIcoMod.default : toIcoMod;

  const publicDir = path.join(process.cwd(), "public");
  const inputPath = path.join(publicDir, "LogoRedes.png");

  if (!fs.existsSync(inputPath)) {
    console.error("No se encuentra LogoRedes.png en public/");
    process.exit(1);
  }

  const inputBuffer = fs.readFileSync(inputPath);

  // Logo 192 y 512 para PWA
  await sharp.default(inputBuffer)
    .resize(192, 192, { fit: "cover", position: "center" })
    .png()
    .toFile(path.join(publicDir, "logo-192.png"));
  console.log("✓ logo-192.png");

  await sharp.default(inputBuffer)
    .resize(512, 512, { fit: "cover", position: "center" })
    .png()
    .toFile(path.join(publicDir, "logo-512.png"));
  console.log("✓ logo-512.png");

  // Favicon.ico (16, 32, 48)
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp.default(inputBuffer)
        .resize(size, size, { fit: "cover", position: "center" })
        .png()
        .toBuffer()
    )
  );

  const icoBuffer = await toIco(pngBuffers);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  console.log("✓ favicon.ico");

  console.log("\nIconos generados correctamente.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
