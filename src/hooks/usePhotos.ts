import { useState, useCallback } from 'react';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<string[]>([]);

  const addPhoto = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPhotos((prev) => [...prev, dataUrl]);
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const addPhotos = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const promises = fileArray.map((file) => {
      if (!file.type.startsWith('image/')) {
        return Promise.reject(new Error(`${file.name} is not an image`));
      }
      return addPhoto(file);
    });
    return Promise.all(promises);
  }, [addPhoto]);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  return {
    photos,
    addPhoto,
    addPhotos,
    removePhoto,
    clearPhotos
  };
};

