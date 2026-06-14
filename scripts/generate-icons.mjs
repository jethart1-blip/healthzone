import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 140, b: 90, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#FF8C5A"/>
      <text x="50%" y="54%" font-family="Arial" font-size="${size * 0.45}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">HZ</text>
    </svg>`),
    top: 0,
    left: 0
  }])
  .png()
  .toFile(`public/icons/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 255, g: 140, b: 90, alpha: 1 }
  }
})
.png()
.toFile('public/icons/icon-maskable-512.png');
console.log('Generated icon-maskable-512.png');
