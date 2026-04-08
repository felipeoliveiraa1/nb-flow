// Aplica marca d'agua NB na imagem via Canvas API (client-side, zero custo)

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function applyWatermark(imageUrl: string): Promise<string> {
  const img = await loadImg(imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // Desenhar imagem original
  ctx.drawImage(img, 0, 0);

  // Faixa semi-transparente no rodape
  const barHeight = canvas.height * 0.06;
  ctx.fillStyle = "rgba(253, 127, 153, 0.75)";
  ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

  // Texto "Natalia Beauty" na faixa
  const fontSize = Math.round(barHeight * 0.5);
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Natalia Beauty",
    canvas.width / 2,
    canvas.height - barHeight / 2
  );

  // Logo no canto superior direito
  try {
    const logo = await loadImg("/logo.svg");
    const logoSize = canvas.width * 0.1;
    const margin = canvas.width * 0.03;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(logo, canvas.width - logoSize - margin, margin, logoSize, logoSize);
    ctx.globalAlpha = 1;
  } catch {
    // Logo nao carregou, segue sem
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}
