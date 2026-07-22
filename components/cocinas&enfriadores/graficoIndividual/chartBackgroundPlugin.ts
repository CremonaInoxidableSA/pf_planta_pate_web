import type { Plugin } from "chart.js";

interface BackgroundImagePluginOptions {
  src: string;
  widthRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
  alpha?: number;
}

const imageCache: Record<string, HTMLImageElement> = {};

const getImage = (src: string): HTMLImageElement => {
  if (!imageCache[src]) {
    const image = new Image();
    image.src = src;
    imageCache[src] = image;
  }
  return imageCache[src];
};

export const createBackgroundImagePlugin = ({
  src,
  widthRatio = 0.5,
  maxWidth,
  maxHeight,
  alpha = 0.5,
}: BackgroundImagePluginOptions): Plugin<"line"> => {
  const image = getImage(src);

  return {
    id: `customCanvasBackgroundImage-${src}`,
    beforeDraw: (chart) => {
      if (!chart.chartArea) return;

      if (!image.complete) {
        image.onload = () => {
          chart.draw();
        };
        return;
      }

      const { ctx, chartArea } = chart;
      const { top, left, width, height } = chartArea;
      const aspectRatio =
        image.width && image.height ? image.width / image.height : 1;

      const maxAllowedWidth = maxWidth ?? width * widthRatio;
      const maxAllowedHeight = maxHeight ?? height * 0.5;

      let targetWidth = Math.min(width * widthRatio, maxAllowedWidth);
      let targetHeight = targetWidth / aspectRatio;

      if (targetHeight > maxAllowedHeight) {
        targetHeight = maxAllowedHeight;
        targetWidth = targetHeight * aspectRatio;
      }

      const x = left + (width - targetWidth) / 2;
      const y = top + (height - targetHeight) / 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, x, y, targetWidth, targetHeight);
      ctx.restore();
    },
  };
};
