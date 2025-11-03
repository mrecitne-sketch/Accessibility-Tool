import { gzipSync } from 'zlib'

// Minimal ustar tar implementation for small text files
// Limitation: filenames <= 100 chars, size < 8GB (fits octal)

function padRight(str: string, length: number): Buffer {
  const buf = Buffer.alloc(length, 0)
  const src = Buffer.from(str)
  src.copy(buf)
  return buf
}

function octal(value: number, length: number): Buffer {
  const str = value.toString(8)
  const buf = Buffer.alloc(length, 0)
  buf.write(str, length - str.length - 1) // leave trailing NUL
  return buf
}

function checksum(header: Buffer): number {
  let sum = 0
  for (let i = 0; i < header.length; i++) {
    sum += header[i]
  }
  return sum
}

function createHeader(name: string, size: number): Buffer {
  const header = Buffer.alloc(512, 0)
  padRight(name, 100).copy(header, 0) // name
  octal(0o644, 8).copy(header, 100) // mode
  octal(0, 8).copy(header, 108) // uid
  octal(0, 8).copy(header, 116) // gid
  octal(size, 12).copy(header, 124) // size
  octal(Math.floor(Date.now() / 1000), 12).copy(header, 136) // mtime
  // checksum placeholder (8 spaces)
  Buffer.from('        ').copy(header, 148)
  header[156] = '0'.charCodeAt(0) // typeflag '0' = file
  padRight('ustar', 6).copy(header, 257) // magic
  padRight('00', 2).copy(header, 263) // version
  padRight('allyfix', 32).copy(header, 265) // uname
  padRight('allyfix', 32).copy(header, 297) // gname

  // compute checksum
  const sum = checksum(header)
  octal(sum, 8).copy(header, 148)
  return header
}

export function createTar(files: { name: string; content: string | Buffer }[]): Buffer {
  const parts: Buffer[] = []
  for (const file of files) {
    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content)
    const header = createHeader(file.name, content.length)
    parts.push(header)
    parts.push(content)
    const remainder = content.length % 512
    if (remainder !== 0) {
      parts.push(Buffer.alloc(512 - remainder, 0))
    }
  }
  // Two 512-byte zero blocks to end the archive
  parts.push(Buffer.alloc(1024, 0))
  return Buffer.concat(parts)
}

export function createTarGz(files: { name: string; content: string | Buffer }[]): Buffer {
  const tar = createTar(files)
  return gzipSync(tar)
}


