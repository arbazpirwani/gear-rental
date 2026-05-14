// Minimal inline EXIF parser for JPEG. No external dependency.
// Pulls out the bits useful for identifying where/when/with what a photo was
// taken: GPS lat/lng/altitude, camera make/model, lens, date taken, ISO, etc.
// Returns null for non-JPEG files (HEIC/PNG); the upload still proceeds.

export interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  lensModel?: string;
  dateTimeOriginal?: string;
  orientation?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  gpsTimestamp?: string;
  focalLength?: number;
  iso?: number;
  fNumber?: number;
  exposureTime?: number;
}

export async function parseExif(file: File): Promise<ExifData | null> {
  // Only JPEG has the simple APP1 segment structure we parse. iPhone HEIC is
  // skipped (the photo still uploads, we just lose EXIF). Safari often
  // re-encodes HEIC to JPEG on file-input upload anyway, so most iOS uploads
  // still land here.
  const isJpeg =
    file.type === 'image/jpeg' || file.type === 'image/jpg' || /\.jpe?g$/i.test(file.name);
  if (!isJpeg) return null;

  const bytesToRead = Math.min(file.size, 512 * 1024);
  const buf = await file.slice(0, bytesToRead).arrayBuffer();
  const view = new DataView(buf);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;

  let pos = 2;
  while (pos + 4 < view.byteLength) {
    if (view.getUint8(pos) !== 0xff) return null;
    const marker = view.getUint8(pos + 1);
    const size = view.getUint16(pos + 2);
    if (marker === 0xe1 && pos + 10 < view.byteLength) {
      // APP1 — confirm "Exif\0\0"
      if (
        view.getUint32(pos + 4) === 0x45786966 &&
        view.getUint16(pos + 8) === 0x0000
      ) {
        try {
          return parseTiff(view, pos + 10);
        } catch {
          return null;
        }
      }
    }
    if (size < 2) return null;
    pos += 2 + size;
  }
  return null;
}

function parseTiff(view: DataView, tiffStart: number): ExifData | null {
  const order = view.getUint16(tiffStart);
  const little = order === 0x4949;
  if (!little && order !== 0x4d4d) return null;
  if (read16(view, tiffStart + 2, little) !== 0x002a) return null;
  const ifd0 = tiffStart + read32(view, tiffStart + 4, little);

  const out: ExifData = {};
  let exifIfd: number | null = null;
  let gpsIfd: number | null = null;

  walkIfd(view, tiffStart, ifd0, little, (tag, value) => {
    if (tag === 0x010f) out.make = asString(value);
    else if (tag === 0x0110) out.model = asString(value);
    else if (tag === 0x0131) out.software = asString(value);
    else if (tag === 0x0112) out.orientation = asNumber(value);
    else if (tag === 0x8769) exifIfd = tiffStart + asNumber(value);
    else if (tag === 0x8825) gpsIfd = tiffStart + asNumber(value);
  });

  if (exifIfd != null) {
    walkIfd(view, tiffStart, exifIfd, little, (tag, value) => {
      if (tag === 0x9003) out.dateTimeOriginal = asString(value);
      else if (tag === 0xa433) out.lensModel = asString(value);
      else if (tag === 0x920a) out.focalLength = asNumber(value);
      else if (tag === 0x8827) out.iso = asNumber(value);
      else if (tag === 0x829d) out.fNumber = asNumber(value);
      else if (tag === 0x829a) out.exposureTime = asNumber(value);
    });
  }

  if (gpsIfd != null) {
    let latRef: string | undefined;
    let lat: number[] | undefined;
    let lngRef: string | undefined;
    let lng: number[] | undefined;
    let altRef: number | undefined;
    let alt: number | undefined;
    let timeStamp: number[] | undefined;
    walkIfd(view, tiffStart, gpsIfd, little, (tag, value) => {
      if (tag === 0x0001) latRef = asString(value);
      else if (tag === 0x0002) lat = asNumberArray(value);
      else if (tag === 0x0003) lngRef = asString(value);
      else if (tag === 0x0004) lng = asNumberArray(value);
      else if (tag === 0x0005) altRef = asNumber(value);
      else if (tag === 0x0006) alt = asNumber(value);
      else if (tag === 0x0007) timeStamp = asNumberArray(value);
    });
    if (lat && lng && latRef && lngRef && lat.length === 3 && lng.length === 3) {
      let latDeg = lat[0] + lat[1] / 60 + lat[2] / 3600;
      let lngDeg = lng[0] + lng[1] / 60 + lng[2] / 3600;
      if (latRef === 'S') latDeg = -latDeg;
      if (lngRef === 'W') lngDeg = -lngDeg;
      out.gpsLatitude = latDeg;
      out.gpsLongitude = lngDeg;
    }
    if (alt != null) out.gpsAltitude = altRef === 1 ? -alt : alt;
    if (timeStamp && timeStamp.length === 3) {
      const h = String(Math.floor(timeStamp[0])).padStart(2, '0');
      const m = String(Math.floor(timeStamp[1])).padStart(2, '0');
      const s = String(Math.floor(timeStamp[2])).padStart(2, '0');
      out.gpsTimestamp = `${h}:${m}:${s}`;
    }
  }

  return out;
}

type IfdValue = string | number | number[];

function walkIfd(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  little: boolean,
  cb: (tag: number, value: IfdValue) => void,
) {
  if (ifdOffset + 2 > view.byteLength) return;
  const entryCount = read16(view, ifdOffset, little);
  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) return;
    const tag = read16(view, entryOffset, little);
    const type = read16(view, entryOffset + 2, little);
    const count = read32(view, entryOffset + 4, little);
    const value = readValue(view, tiffStart, entryOffset + 8, type, count, little);
    if (value !== null) cb(tag, value);
  }
}

const TYPE_SIZE: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  7: 1, // UNDEFINED
  9: 4, // SLONG
  10: 8, // SRATIONAL
};

function readValue(
  view: DataView,
  tiffStart: number,
  valOrOffsetField: number,
  type: number,
  count: number,
  little: boolean,
): IfdValue | null {
  const size = TYPE_SIZE[type] ?? 0;
  if (!size) return null;
  const total = size * count;
  const dataOffset = total <= 4 ? valOrOffsetField : tiffStart + read32(view, valOrOffsetField, little);
  if (dataOffset + total > view.byteLength) return null;

  if (type === 2) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const c = view.getUint8(dataOffset + i);
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s.trim();
  }
  if (type === 1 || type === 7) return view.getUint8(dataOffset);
  if (type === 3) {
    if (count === 1) return read16(view, dataOffset, little);
    const arr: number[] = [];
    for (let i = 0; i < count; i++) arr.push(read16(view, dataOffset + i * 2, little));
    return arr;
  }
  if (type === 4) {
    if (count === 1) return read32(view, dataOffset, little);
    const arr: number[] = [];
    for (let i = 0; i < count; i++) arr.push(read32(view, dataOffset + i * 4, little));
    return arr;
  }
  if (type === 9) return readInt32(view, dataOffset, little);
  if (type === 5 || type === 10) {
    if (count === 1) {
      const num = type === 5 ? read32(view, dataOffset, little) : readInt32(view, dataOffset, little);
      const den = type === 5 ? read32(view, dataOffset + 4, little) : readInt32(view, dataOffset + 4, little);
      return den === 0 ? 0 : num / den;
    }
    const arr: number[] = [];
    for (let i = 0; i < count; i++) {
      const off = dataOffset + i * 8;
      const num = type === 5 ? read32(view, off, little) : readInt32(view, off, little);
      const den = type === 5 ? read32(view, off + 4, little) : readInt32(view, off + 4, little);
      arr.push(den === 0 ? 0 : num / den);
    }
    return arr;
  }
  return null;
}

function read16(v: DataView, o: number, little: boolean) {
  return v.getUint16(o, little);
}
function read32(v: DataView, o: number, little: boolean) {
  return v.getUint32(o, little);
}
function readInt32(v: DataView, o: number, little: boolean) {
  return v.getInt32(o, little);
}
function asString(v: IfdValue): string {
  return typeof v === 'string' ? v : String(v);
}
function asNumber(v: IfdValue): number {
  return typeof v === 'number' ? v : Array.isArray(v) ? Number(v[0]) : Number(v);
}
function asNumberArray(v: IfdValue): number[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'number') return [v];
  return [];
}
