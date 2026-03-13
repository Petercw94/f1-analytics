import { useEffect, useRef } from "react";

type LineChartProps<T extends Record<string, number>> = {
  data: T[];
  xKey: keyof T;
  aKey: keyof T;
  bKey: keyof T;
  aColor: string;
  bColor: string;
  width?: number;
  height?: number;
};

export function LineChart<T extends Record<string, number>>({
  data,
  xKey,
  aKey,
  bKey,
  aColor,
  bColor,
  width = 560,
  height = 200,
}: LineChartProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = 22;
    const allX = data.map((entry) => Number(entry[xKey]));
    const allY = data.flatMap((entry) => [Number(entry[aKey]), Number(entry[bKey])]);

    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const toPoint = (entry: T, key: keyof T) => {
      const x =
        pad +
        ((Number(entry[xKey]) - minX) / (maxX - minX || 1)) * (canvas.width - pad * 2);
      const y = pad + ((maxY - Number(entry[key])) / (maxY - minY || 1)) * (canvas.height - pad * 2);
      return { x, y };
    };

    const drawLine = (key: keyof T, color: string) => {
      ctx.beginPath();
      data.forEach((entry, index) => {
        const point = toPoint(entry, key);
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#2a3444";
    ctx.strokeRect(pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);
    drawLine(aKey, aColor);
    drawLine(bKey, bColor);
  }, [aColor, aKey, bColor, bKey, data, xKey]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
