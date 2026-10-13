/**
 * Build a storage filename for a screenshot upload.
 * Pattern: {emailLocal}_{phone}.{ext}
 *
 * emailLocal = part before @, lowercased, chars outside [a-z0-9._-] → '-'
 * phone = digits only
 * Collision: appends -2, -3, … so files are never overwritten.
 */

export function buildBaseName(email: string, phone: string): string {
  const local = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-");
  const digits = phone.replace(/\D/g, "");
  return `${local}_${digits}`;
}

export function buildFilename(
  email: string,
  phone: string,
  ext: string,
  existingPaths: string[]
): string {
  const base = buildBaseName(email, phone);
  const candidate = `${base}.${ext}`;

  // Check for collision
  if (!existingPaths.includes(candidate)) {
    return candidate;
  }

  let n = 2;
  while (true) {
    const variant = `${base}-${n}.${ext}`;
    if (!existingPaths.includes(variant)) {
      return variant;
    }
    n++;
  }
}

const MAGIC: Record<string, number[][]> = {
  png: [[0x89, 0x50, 0x4e, 0x47]],
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  webp: [
    // RIFF????WEBP
    [0x52, 0x49, 0x46, 0x46],
  ],
};

export function checkMagicBytes(
  buffer: Uint8Array,
  ext: string
): boolean {
  const signatures = MAGIC[ext.toLowerCase()];
  if (!signatures) return false;

  if (ext.toLowerCase() === "webp") {
    // RIFF at 0 and WEBP at 8
    const riff = [0x52, 0x49, 0x46, 0x46];
    const webp = [0x57, 0x45, 0x42, 0x50];
    return (
      riff.every((b, i) => buffer[i] === b) &&
      webp.every((b, i) => buffer[8 + i] === b)
    );
  }

  return signatures.some((sig) => sig.every((b, i) => buffer[i] === b));
}

export function extFromMime(mime: string): string | null {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };
  return map[mime] ?? null;
}
