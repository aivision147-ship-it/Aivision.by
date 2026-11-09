export async function preparePhoto(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const low = Math.max(bitmap.width, bitmap.height) < 1200;
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return { src: "", low };
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { src: canvas.toDataURL("image/jpeg", 0.72), low };
}
