const PROFILE_PICTURE_SIZE = 256

export async function resizeImageToDataUrl(file: File, size = PROFILE_PICTURE_SIZE): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  if (!context) throw new Error('The image could not be processed because canvas rendering is not available.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return canvas.toDataURL('image/webp', 0.9)
}
