export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const maxEdge = 256;
      let { width, height } = img;

      if (width > height) {
        if (width > maxEdge) {
          height = Math.round((height / width) * maxEdge);
          width = maxEdge;
        }
      } else {
        if (height > maxEdge) {
          width = Math.round((width / height) * maxEdge);
          height = maxEdge;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress'));
        },
        'image/webp',
        0.5
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
