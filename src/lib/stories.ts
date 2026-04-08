// Gera imagem formatada para Instagram Stories (1080x1920)
// Layout: antes/depois lado a lado + marca NB + metricas

export async function generateStoryImage(
  beforeUrl: string,
  afterUrl: string,
  clientName: string,
  flowScore: number
): Promise<string> {
  const W = 1080;
  const H = 1920;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradiente rosa
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#FD7F99");
  grad.addColorStop(1, "#E5627A");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Load images
  const [before, after] = await Promise.all([
    loadImage(beforeUrl),
    loadImage(afterUrl),
  ]);

  // Header
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Natalia Beauty", W / 2, 120);

  ctx.font = "300 28px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("Flow Analysis", W / 2, 165);

  // Linha decorativa
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.moveTo(W * 0.3, 195);
  ctx.lineTo(W * 0.7, 195);
  ctx.stroke();

  // Labels "Antes" e "Depois"
  ctx.font = "600 26px sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("ANTES", W * 0.25, 260);
  ctx.fillText("DEPOIS", W * 0.75, 260);

  // Fotos lado a lado com bordas arredondadas
  const photoW = (W - 60) / 2 - 10;
  const photoH = 650;
  const photoY = 285;

  // Antes
  drawRoundedImage(ctx, before, 20, photoY, photoW, photoH, 20);
  // Depois
  drawRoundedImage(ctx, after, W / 2 + 10, photoY, photoW, photoH, 20);

  // Divisor central
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.moveTo(W / 2, photoY);
  ctx.lineTo(W / 2, photoY + photoH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Score section
  const scoreY = photoY + photoH + 80;

  // Circulo do score
  ctx.beginPath();
  ctx.arc(W / 2, scoreY, 60, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();

  ctx.font = "bold 52px sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${flowScore}`, W / 2, scoreY - 5);

  ctx.font = "300 18px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("Flow Score", W / 2, scoreY + 35);

  ctx.textBaseline = "alphabetic";

  // Nome da cliente
  if (clientName) {
    ctx.font = "500 30px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(clientName, W / 2, scoreY + 120);
  }

  // Footer
  ctx.font = "300 22px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("nataliabeauty.com.br", W / 2, H - 80);

  ctx.font = "500 18px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText("Powered by NB Flow", W / 2, H - 45);

  return canvas.toDataURL("image/jpeg", 0.92);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();

  // Cover fit
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, x - (sw - w) / 2, y - (sh - h) / 2, sw, sh);

  ctx.restore();
}
