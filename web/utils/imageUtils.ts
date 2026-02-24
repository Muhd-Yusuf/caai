/**
 * Compresses an image file using Canvas API
 * @param file - The image file to compress (File object or data URL string)
 * @param maxWidth - Maximum width for the compressed image (default: 800)
 * @param maxHeight - Maximum height for the compressed image (default: 600)
 * @param quality - JPEG quality (0-1, default: 0.7)
 * @returns Promise<string> - Data URL of the compressed image
 */
export const compressImage = (
  file: File | string,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG data URL with specified quality
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Handle both File objects and data URL strings
    if (typeof file === 'string') {
      // If it's already a data URL, use it directly
      img.src = file;
    } else {
      // If it's a File object, create object URL
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      // Clean up object URL after image loads
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG data URL with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
    }
  });
};