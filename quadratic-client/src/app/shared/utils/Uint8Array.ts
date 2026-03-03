export const toUint8Array = (data: any): Uint8Array => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));
  return encoded;
};

export const fromUint8Array = <T>(data: Uint8Array): T => {
  const decoder = new TextDecoder();
  const decoded = decoder.decode(data);
  if (!decoded || decoded.length === 0) {
    return [] as unknown as T;
  }
  try {
    return JSON.parse(decoded) as T;
  } catch (_e) {
    // Silently handle corrupt/empty data from WASM core to prevent render worker crashes
    return [] as unknown as T;
  }
};
