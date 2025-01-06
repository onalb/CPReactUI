import React, { useEffect, useState, useRef } from 'react';
import { pictures } from './pictures';
import '../styles/ImageZoom.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createParticles } from './create-particles';
import applyMouseAndTouchEvents from './mouse-and-touch-events';
import { addTrackedEventListener, removeTrackedEventListeners } from './tracked-event-handler';
import  { startTimer, stopTimer} from './timer-functions';
import PhotoGalleria from './photo-galleria';

const DraggableBox: React.FC = () => {
  //User Editable Paramters
  const numberOfColumns = 5;

  // Constants
  const padding = 10;
  const columnGap = 2;
  const defaultRowHeight = 300;

  // States
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  const [images, setImages] = useState(pictures);
  const [zoomScale, setZoomScale] = useState(1);
  const [firstRowWidth, setFirstRowWidth] = useState(calculateFirstRowWidth()); // Initial transform-origin
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [currentSelectedImage, setCurrentSelectedImage] = useState<number | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [isGalleriaClosed, setIsGalleriaClosed] = useState<boolean | null>(null);
  const squareRef = useRef<HTMLDivElement | null>(null);

  // Side Effects
  useEffect(() => {
    addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
    addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);

    const cleanup = applyMouseAndTouchEvents(
      setZoomScale, 
      setIsDragging, 
      setIsZooming, 
      setIsLongTouch, 
      squareRef, 
      handleMouseUp, 
      squareSelection);
    return cleanup;
  }, []);

  useEffect(() => {
    console.log('selectedImageIds:', selectedImageIds);
  }, [selectedImageIds]);

  useEffect(() => {
    if (isGalleriaClosed) {
      addTrackedEventListener(window, 'click', handleClickOutside);
      addTrackedEventListener(window, 'touchend', handleClickOutside);
      const cleanup = applyMouseAndTouchEvents(
        setZoomScale, 
        setIsDragging, 
        setIsZooming, 
        setIsLongTouch, 
        squareRef, 
        handleMouseUp, 
        squareSelection);
        addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
        addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);
      return cleanup;
    } else if (isGalleriaClosed === false) {
      removeTrackedEventListeners(window, 'mousedown');
      removeTrackedEventListeners(window, 'mousemove');
      removeTrackedEventListeners(window, 'mouseup');
      removeTrackedEventListeners(window, 'wheel');
      removeTrackedEventListeners(window, 'touchstart');
      removeTrackedEventListeners(window, 'touchmove');
      removeTrackedEventListeners(window, 'touchend');
      removeTrackedEventListeners(window, 'click');
      removeTrackedEventListeners(window, 'touchend');
    }

    return () => {
      removeTrackedEventListeners(window, 'keyup');
      removeTrackedEventListeners(window, 'keydown');
    };
  }, [setIsGalleriaClosed, isGalleriaClosed]);

  useEffect(() => {
    addTrackedEventListener(window, 'click', handleClickOutside);
    addTrackedEventListener(window, 'touchend', handleClickOutside);
    return () => {
      removeTrackedEventListeners(window, 'click');
      removeTrackedEventListeners(window,'touchend');
    };
  }, [isDragging, isLongTouch]);

  // Functions
  const handleKeyDown = (event: any) => {
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      setSelectedImageIds(images.map(img => img.id));
    }

    if (event.ctrlKey && event.key === 'g') {
      event.preventDefault();
      setIsGalleriaClosed(false);
    }
    
    if (event.key === 'Escape') {
      console.log(isGalleriaClosed);
      if(!isGalleriaClosed) {
        const container = document.querySelector('.container-fluid') as HTMLDivElement;
        if (container) {
            container.style.transition = 'opacity 0.2s ease-out';
            container.style.opacity = '0';
            setTimeout(() => {
            setIsGalleriaClosed(true);
            console.log('Close button clicked');
            }, 200);
        }
      } else {
        setSelectedImageIds([]);
        setCurrentSelectedImage(null);
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      if (squareRef.current) {
        document.body.removeChild(squareRef.current);
        squareRef.current = null;
      }
    }
  };

  function calculateFirstRowWidth () {
    let result = padding; 
    const ratio = defaultRowHeight / images[0]!.height;

    for (let i = 0; i < numberOfColumns; i++) {
      if (images[i]) {
        result += images[i]!.width * ratio + columnGap;
      }
    }

    result -= columnGap;
    return result;
  }

  const handleClickOutside = (event: any) => {
    if (!event.ctrlKey && !isDragging && !isLongTouch && ((event.pointerType && event.pointerType === 'mouse') || (event.type === 'touchend'))) {
      const target = event.target as HTMLElement;
      if (target.tagName !== 'IMG' && target.tagName !== 'BUTTON' && target.tagName !== 'I' && !target.classList.contains('no-selection-removal-on-click')) {
        setSelectedImageIds([]);
        setCurrentSelectedImage(null);
      }
    };
  }

  const updateImages = (images: any[]) => {
    // Here we will make a call to DB. 
    // If the call is successful, we will keep the state as updated if wrong we will invalidate the query for images.
  }

  const squareSelection = (event: any) => {
    const square = document.createElement('div');
    square.id = 'mouse-square';
    square.style.left = `${event.clientX}px`;
    square.style.top = `${event.clientY}px`;
    square.onmousemove = (e) => handleMouseMove(e, { x: event.clientX, y: event.clientY });
    squareRef.current = square;
    document.body.appendChild(square);
  }

  // User-Event handlers
  const handleImageClick = (imageId: number, index: number, event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !isZooming) {
      if (event.shiftKey && currentSelectedImage !== null) {
        const start = Math.min(currentSelectedImage, index);
        const end = Math.max(currentSelectedImage, index);
        const newSelectedImageIds = images.slice(start, end + 1).map(img => img.id);
        setSelectedImageIds(prevIds => Array.from(new Set([...prevIds, ...newSelectedImageIds])));
        setCurrentSelectedImage(index);
      } else if (event.shiftKey && currentSelectedImage === null) {
        setCurrentSelectedImage(index);
        setSelectedImageIds(prevIds =>  [...prevIds, imageId]);
      } else {
        if (currentSelectedImage === index || selectedImageIds.includes(imageId)) {
          setCurrentSelectedImage(null);
        } else {
          setCurrentSelectedImage(index);
        }

        setSelectedImageIds(prevIds =>
          prevIds.includes(imageId)
            ? prevIds.filter(id => id !== imageId) // Deselect if already selected
            : [...prevIds, imageId] // Select if not already selected
        );
      }
    }
  };

  const handleKeepOnClick = (e: any, image: any) => {
    if (isZooming) return;
    const isKept: boolean = image.isKept ? false : true;
    const updatedImage = { ...image, isKept };
    const updatedImages: any[] = images.map(img => img.id === updatedImage.id ? updatedImage : img);

    setImages(updatedImages);
    updateImages(updatedImages);

    if (!image.isKept) {
      createParticles(e.clientX, e.clientY, zoomScale, 'keep');
    }
  }

  const handleDeleteOnClick = (e: any, image: any, index: number) => {
    if (isZooming) return;
    const deleteIcon = e.currentTarget.querySelector(`i#delete-icon-${image.id}`);
    if(deleteIcon) {
      if(!image.deleteClickedOnce) {
        image.deleteClickedOnce = true;
        setImages(images.map(img => img.id === image.id ? image : img)); // updates the deleteClickedOnce property of the current image
        startTimer(image, setImages);
      } else {
        stopTimer(image);
        setImages(images.filter(img => img.id !== image.id)); // removes the deleted image from the array
        createParticles(e.clientX, e.clientY, zoomScale, 'delete');
        setSelectedImageIds(prevIds => prevIds.filter(id => id !== image.id));
        setCurrentSelectedImage((prevIndex: number | null) => { 
           if (prevIndex === index || prevIndex === null) {
             return null;
           } else if (prevIndex! > index) {
             return prevIndex - 1;
           } else {
              return prevIndex + 1;
           }
        });
        if(currentSelectedImage === images.findIndex(img => img.id === image.id)) {
          setCurrentSelectedImage(null);
        }
      }
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.ctrlKey && event.button === 0) { // Right mouse button
      setStartPoint({ x: event.clientX, y: event.clientY });
      squareSelection(event);
    }
  };

  const handleMouseMove = (event: React.MouseEvent | MouseEvent, startPoint: any) => {
    if (startPoint && squareRef.current) {
      const width = event.clientX - startPoint.x;
      const height = event.clientY - startPoint.y;
      squareRef.current.style.width = `${Math.abs(width)}px`;
      squareRef.current.style.height = `${Math.abs(height)}px`;
      squareRef.current.style.left = `${Math.min(event.clientX, startPoint.x)}px`;
      squareRef.current.style.top = `${Math.min(event.clientY, startPoint.y)}px`;
    }
  };

  const handleMouseUp = () => {
    if (squareRef.current) {
      const squareRect = squareRef.current.getBoundingClientRect();
      const isAClick = squareRect.right - squareRect.left === 4 && squareRect.bottom - squareRect.top === 4;
      const deselectedImages: number[] = [];
      const newSelectedImageIds = images.filter(image => {
        const index = images.findIndex(img => img.id === image.id);
        const imageElement = document.getElementById(`image-${image.id}`);

        if (imageElement) {
          const imageRect = imageElement.getBoundingClientRect();
          const isIntersecting = (
            squareRect.left < imageRect.right &&
            squareRect.right > imageRect.left &&
            squareRect.top < imageRect.bottom &&
            squareRect.bottom > imageRect.top
          );

          if (isIntersecting) {
            if (isAClick && selectedImageIds.includes(image.id) && currentSelectedImage === index) {
              setCurrentSelectedImage(null);
              deselectedImages.push(image.id);
              return false;
            } else if (isAClick && selectedImageIds.includes(image.id) && currentSelectedImage !== index) {
              deselectedImages.push(image.id);
              return false;
            } else {
              setCurrentSelectedImage(index);
            }

            return true;
          }
        }
        return false;
      }).map(image => image.id);
      
      setSelectedImageIds(prevIds => Array.from(new Set([...prevIds, ...newSelectedImageIds])).filter(id => !deselectedImages.includes(id)));
      document.body.removeChild(squareRef.current);
      squareRef.current = null;
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  return (
    <><div
      id='main-element'
      style={{
        gap: columnGap + 'px',
        padding: padding + 'px',
        width: firstRowWidth + 'px',
        transformOrigin: origin, // Dynamic transform-origin based on mouse position
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e, { x: startPoint?.x, y: startPoint?.y })}
      onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
    >
      {images.map((image, index) => (
        <div key={index} className='image-card'>
          <img
            id={`image-${image.id}`}
            src={image.path}
            alt={`Image ${index}`}
            className="img no-drag"
            onTouchEnd={(event) => {
              return !isDragging ? handleImageClick(image.id, index, event) : null;
            } }
            onMouseUp={(event) => {
              return !isDragging ? handleImageClick(image.id, index, event) : null;
            } }
            style={{
              borderColor: currentSelectedImage === index ? 'deeppink' : selectedImageIds.includes(image.id) ? 'blue' : image.isKept ? 'orange' : 'rgba(255, 255, 255, 0.5)',
              opacity: selectedImageIds.includes(image.id) ? 0.5 : 1,
              height: defaultRowHeight + 'px'
            }} />
          <div className='image-tool-area-container no-selection-removal-on-click' style={{ display: 'flex', flexWrap: 'wrap' }}>
            <button
              id={`delete-button-${image.id}`}
              type="button"
              className={`btn btn-dark py-1.5 my-1 ${image.isKept ? ' disabled' : ''}`}
              onMouseUp={(e) => {
                handleDeleteOnClick(e, image, index);
              } }
              onTouchEnd={(e) => {
                handleDeleteOnClick(e, image, index);
              } }>
              <i
                id={`delete-icon-${image.id}`}
                style={{
                  transform: image.deleteClickedOnce ? 'scale(1.2)' : 'scale(1)', // Scale icon on click
                }}
                className={`bi bi-trash3-fill pointer${image.deleteClickedOnce ? ' clicked' : ''}`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title='DELETE'
              ></i>
            </button>
            <button
              id={`keep-button-${image.id}`}
              type="button"
              className="btn btn-dark py-1.5 m-2 my-1"
              onMouseUp={(e) => {
                handleKeepOnClick(e, image);
              } }
              onTouchEnd={(e) => {
                handleKeepOnClick(e, image);
              } }>
              <i
                id={`keep-icon-${image.id}`}
                className={`bi bi-bag-plus-fill pointer${image.isKept ? ' clicked' : ''}`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title='KEEP'
              ></i>
            </button>
            <span
              className='image-tool-area-gap'
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title={image.fileName}
            >
              <span className='no-selection-removal-on-click'>{image.fileName.length > 10
                ? `${image.fileName.slice(0, 5)}...${image.fileName.slice(-5)}`
                : image.fileName}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
    {isGalleriaClosed === false && 
    <PhotoGalleria images={images} 
      setIsGalleriaClosed={setIsGalleriaClosed} 
      setCurrentSelectedImage={setCurrentSelectedImage} 
      currentSelectedImage={currentSelectedImage} />}
    </>
  );
};

export default DraggableBox;