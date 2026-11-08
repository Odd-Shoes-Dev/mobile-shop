/**
 * Provider-agnostic storage contract. Feature code must depend on this
 * interface (via `./index`), never on a concrete provider SDK.
 */

export interface UploadInput {
  /** File contents: Buffer, base64 string, or a readable stream. */
  file: Buffer | string | NodeJS.ReadableStream;
  /** Name to store the file as. */
  fileName: string;
  /** Logical folder path, e.g. "/products" or "/mission". */
  folder: string;
  /** If false, keeps the exact fileName instead of appending a unique suffix. */
  uniqueFileName?: boolean;
  tags?: string[];
}

export interface UploadResult {
  /** Provider-specific id, needed to delete the file later. */
  id: string;
  /** Publicly reachable URL to the stored file. */
  url: string;
  /** Provider-specific path, for reference/debugging. */
  path: string;
  name: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface Transformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "jpg" | "png" | "avif";
}

export interface ClientUploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(id: string): Promise<void>;
  /** Build a delivery URL for a stored file, with optional transformations. */
  getUrl(path: string, transformation?: Transformation): string;
  /** Short-lived credentials so the browser can upload directly to the provider. */
  getClientUploadAuth(): ClientUploadAuth;
}
