// covers are shown at most ~150px wide (300px on 2x screens), so anything past this is wasted storage and bandwidth
const COVER_WIDTH = 1000;
const COVER_HEIGHT = 1400;
export const COVER_ASPECT = COVER_WIDTH / COVER_HEIGHT;
const QUALITY = 0.82;

// a region of the source image, in its natural (EXIF-rotated) pixels
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// images within 1% of 5:7 skip the cropper; the difference wouldn't be visible
export const needsCrop = async (file: File) => {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const ratio = bitmap.width / bitmap.height;
  bitmap.close();
  return Math.abs(ratio / COVER_ASPECT - 1) > 0.01;
};

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

// crops to the given area (default: centered 5:7, the same crop the cards apply), scales down
// without upscaling, and re-encodes as webp. a multi-megabyte phone photo typically ends up around 100-200 KB
export const compressCover = async (file: File, area?: CropArea): Promise<File> => {
  // honours EXIF rotation so phone photos aren't stored sideways
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  const cropWidth = area?.width ?? Math.min(bitmap.width, bitmap.height * COVER_ASPECT);
  const cropHeight = area?.height ?? cropWidth / COVER_ASPECT;
  const cropX = area?.x ?? (bitmap.width - cropWidth) / 2;
  const cropY = area?.y ?? (bitmap.height - cropHeight) / 2;
  const scale = Math.min(1, COVER_WIDTH / cropWidth);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cropWidth * scale);
  // derive height from the ratio; the cropper's whole-pixel area can be a pixel off 5:7
  canvas.height = Math.round(canvas.width / COVER_ASPECT);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image in this browser.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // browsers that can't encode webp silently hand back png, which is far bigger; fall back to jpeg instead
  let blob = await toBlob(canvas, "image/webp");
  if (blob?.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg");
  if (!blob) throw new Error("Couldn't process the image in this browser.");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `cover.${ext}`, { type: blob.type });
};
