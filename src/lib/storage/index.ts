import { ImageKitStorageProvider } from "./imagekit";
import type { StorageProvider } from "./types";

export type { StorageProvider, UploadInput, UploadResult, Transformation, ClientUploadAuth } from "./types";

let instance: StorageProvider | null = null;

/** The only entry point feature code should use for file storage. */
export function getStorage(): StorageProvider {
  if (!instance) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error(
        "Missing ImageKit env vars: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT"
      );
    }
    instance = new ImageKitStorageProvider({ publicKey, privateKey, urlEndpoint });
  }
  return instance;
}
