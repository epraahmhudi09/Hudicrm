export function resizeImageToDataUrl(
  file: File,
  maxDim = 160,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = maxDim;
      canvas.height = maxDim;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(objectUrl);

      if (!ctx) {
        reject(new Error("Your browser doesn't support image processing."));
        return;
      }

      ctx.drawImage(img, sx, sy, size, size, 0, 0, maxDim, maxDim);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn't read that image file."));
    };

    img.src = objectUrl;
  });
}
