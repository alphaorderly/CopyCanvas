export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

export const stripBackground = (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement | undefined,
  hex: string
) => {
  if (!ctx || !canvas || !hex) return;
  const target = hexToRgb(hex);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    if (
      data[i] === target.r &&
      data[i + 1] === target.g &&
      data[i + 2] === target.b
    ) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(image, 0, 0);
};

export const fillBackground = (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement | undefined,
  background: string,
  transparentBg: boolean
) => {
  if (!ctx || !canvas) return;
  if (transparentBg) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};

export const copyCanvasToClipboard = async (
  canvas: HTMLCanvasElement | undefined,
  format: ExportFormat
) => {
  if (!canvas?.toBlob) return;
  return new Promise<void>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve();
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      } catch (err) {
        console.error("Clipboard write failed", err);
      }
      resolve();
    }, format);
  });
};

export const exportCanvasImage = ({
  canvas,
  background,
  transparentBg,
  format,
  name,
  scale,
  quality = 0.92,
}: {
  canvas: HTMLCanvasElement | undefined;
  background: string;
  transparentBg: boolean;
  format: ExportFormat;
  name: string;
  scale: number;
  quality?: number;
}) => {
  if (!canvas) return;
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = Math.round(canvas.width * Math.max(scale, 1));
  exportCanvas.height = Math.round(canvas.height * Math.max(scale, 1));
  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) return;

  if (!transparentBg) {
    exportCtx.fillStyle = background;
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  }

  exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
  const url = exportCanvas.toDataURL(format, quality);
  const link = document.createElement("a");
  link.download = `${name || "canvas"}.${format.replace("image/", "")}`;
  link.href = url;
  link.click();
};
