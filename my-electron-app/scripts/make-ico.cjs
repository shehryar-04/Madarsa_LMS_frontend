/**
 * Wraps a PNG file into a valid .ico container.
 * Windows Vista+ supports PNG-compressed ICO images natively.
 * This creates a single-image ICO with the full PNG embedded.
 */
const fs = require('fs')
const path = require('path')

const srcPng = path.join(__dirname, '../src/assets/\u0645\u0648\u0646\u0648\u062c\u0627\u0645\u0639\u06c1 \u062f\u0627\u0631\u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u0627\u0633\u0644\u0627\u0645\u06cc\u06c1.png')
const destIco = path.join(__dirname, '../build/icon.ico')

const pngData = fs.readFileSync(srcPng)

// Read width/height from PNG IHDR chunk (bytes 16-23)
const width  = pngData.readUInt32BE(16)
const height = pngData.readUInt32BE(20)

// ICO format:
//   6 bytes  — ICONDIR header
//   16 bytes — ICONDIRENTRY for each image
//   N bytes  — image data
const ICONDIR_SIZE   = 6
const DIRENTRY_SIZE  = 16
const imageOffset    = ICONDIR_SIZE + DIRENTRY_SIZE  // 22

const buf = Buffer.alloc(imageOffset + pngData.length)

// ICONDIR
buf.writeUInt16LE(0,      0)  // reserved
buf.writeUInt16LE(1,      2)  // type: 1 = ICO
buf.writeUInt16LE(1,      4)  // image count

// ICONDIRENTRY
// width/height: 0 means 256 in ICO spec
buf.writeUInt8(width  >= 256 ? 0 : width,  6)
buf.writeUInt8(height >= 256 ? 0 : height, 7)
buf.writeUInt8(0,  8)   // color count (0 = no palette)
buf.writeUInt8(0,  9)   // reserved
buf.writeUInt16LE(1, 10) // color planes
buf.writeUInt16LE(32, 12) // bits per pixel
buf.writeUInt32LE(pngData.length, 14) // size of image data
buf.writeUInt32LE(imageOffset,    18) // offset of image data

// PNG data
pngData.copy(buf, imageOffset)

fs.writeFileSync(destIco, buf)
console.log(`✅ icon.ico created (${width}x${height}, ${(buf.length/1024).toFixed(1)} KB) → ${destIco}`)
