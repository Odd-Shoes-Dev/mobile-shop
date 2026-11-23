import ImageKit from "@imagekit/nodejs";
import type {
  ClientUploadAuth,
  StorageProvider,
  Transformation,
  UploadInput,
  UploadResult,
} from "./types";

/**
 * ImageKit-backed implementation of StorageProvider.
 * This is the ONLY file in the codebase allowed to import "@imagekit/nodejs".
 * Swapping providers later means rewriting this file and the one below it
 * in index.ts — nothing else in the app changes.
 */
export class ImageKitStorageProvider implements StorageProvider {
  private client: ImageKit;
  private publicKey: string;
  private urlEndpoint: string;
  private baseFolder: string | null;

  constructor(config: { publicKey: string; privateKey: string; urlEndpoint: string; baseFolder?: string }) {
    this.client = new ImageKit({ privateKey: config.privateKey });
    this.publicKey = config.publicKey;
    this.urlEndpoint = config.urlEndpoint;
    this.baseFolder = config.baseFolder ? config.baseFolder.replace(/^\/+|\/+$/g, "") : null;
  }

  /** Scopes every upload under the account's base media-library folder (e.g. "mobile-shop"), so this app never writes outside its own space. */
  private resolveFolder(folder: string): string {
    const trimmed = folder.replace(/^\/+|\/+$/g, "");
    if (!this.baseFolder) return "/" + trimmed;
    return trimmed ? `/${this.baseFolder}/${trimmed}` : `/${this.baseFolder}`;
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const response = await this.client.files.upload({
      file: input.file as never,
      fileName: input.fileName,
      folder: this.resolveFolder(input.folder),
      useUniqueFileName: input.uniqueFileName ?? true,
      tags: input.tags,
    });

    return {
      id: response.fileId ?? "",
      url: response.url ?? "",
      path: response.filePath ?? "",
      name: response.name ?? input.fileName,
      width: response.width,
      height: response.height,
      size: response.size,
    };
  }

  async delete(id: string): Promise<void> {
    await this.client.files.delete(id);
  }

  getUrl(path: string, transformation?: Transformation): string {
    return this.client.helper.buildSrc({
      urlEndpoint: this.urlEndpoint,
      src: path,
      transformation: transformation
        ? [
            {
              width: transformation.width,
              height: transformation.height,
              quality: transformation.quality,
              format: transformation.format,
            },
          ]
        : undefined,
    });
  }

  getClientUploadAuth(): ClientUploadAuth {
    const auth = this.client.helper.getAuthenticationParameters();
    return {
      token: auth.token,
      expire: auth.expire,
      signature: auth.signature,
      publicKey: this.publicKey,
    };
  }
}
