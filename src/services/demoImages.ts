/** Browser-only preview storage. Production upload/EXIF removal belongs to the API. */
export async function readDemoImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Choose a JPG, PNG or WEBP file.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image preview is unavailable.');
    context.fillStyle = '#faf8f4';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Could not read this image. Try another file.',
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
