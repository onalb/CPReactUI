interface Image {
  id: number;
  deleteClickedOnce: boolean;
}

const timerMap = new Map<number, NodeJS.Timeout>();

export const startTimer = (image: Image, setImages: React.Dispatch<React.SetStateAction<Image[]>>) => {
  if (timerMap.has(image.id)) {
    clearTimeout(timerMap.get(image.id)!); // Clear any existing timer for this ID
  }

  const timer = setTimeout(() => {
    if (image) {
      image.deleteClickedOnce = false;
      setImages(prevImages => prevImages.map(img => img.id === image.id ? image : img));
      console.log(`Timer finished for image ${image.id}`);
    }
    timerMap.delete(image.id); // Remove the timer from the map after it finishes
  }, 5000); // 5 seconds timer

  timerMap.set(image.id, timer); // Store the timer in the map
};

export const stopTimer = (image: Image) => {
  if (timerMap.has(image.id)) {
    clearTimeout(timerMap.get(image.id)!);
    timerMap.delete(image.id); // Remove the timer from the map
    console.log(`Timer stopped for image ${image.id}`);
  }
};