import React, { useEffect, useState, useRef } from 'react';
import { pictures } from './pictures';
import '../styles/ImageZoom.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createParticles } from './create-particles';
import applyMouseAndTouchEvents from './apply-mouse-and-touch-events';
import  { startTimer, stopTimer} from './timer-functions';

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
  const [isLongTouch, setIsLongTouch] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState<number | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const squareRef = useRef<HTMLDivElement | null>(null);

  // Side Effects
  useEffect(() => {
    const cleanup = applyMouseAndTouchEvents(setZoomScale, setIsDragging, setIsLongTouch, squareRef, handleMouseUp, squareSelection);
    return cleanup;
  }, []);

  useEffect(() => {
    console.log('selectedImageIds:', selectedImageIds);
  }, [selectedImageIds]);

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        if (squareRef.current) {
          document.body.removeChild(squareRef.current);
          squareRef.current = null;
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {

      if (!event.ctrlKey && !isDragging && !isLongTouch && ((event.pointerType && event.pointerType === 'mouse') || (event.type === 'touchend'))) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'IMG' && target.tagName !== 'BUTTON' && target.tagName !== 'I' && !target.classList.contains('no-selection-removal-on-click')) {
          setSelectedImageIds([]);
          setCurrentSelectedIndex(null);
        }
      };
    }
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isDragging, isLongTouch]);

  // Functions
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

  const updateImages = (images: any[]) => {
    // Here we will make a call to DB. 
    // If the call is successful, we will keep the state as updated if wrong we will invalidate the query for images.
  }

  const squareSelection = (event: any) => {
    const square = document.createElement('div');
    square.id = 'mouse-square';
    square.style.position = 'absolute';
    square.style.border = '2px solid blue';
    square.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
    square.style.left = `${event.clientX}px`;
    square.style.top = `${event.clientY}px`;
    square.onmousemove = (e) => handleMouseMove(e, { x: event.clientX, y: event.clientY });
    squareRef.current = square;
    document.body.appendChild(square);
  }

  // User-Event handlers
  const handleKeepOnClick = (e: any, image: any) => {
    const isKept: boolean = image.isKept ? false : true;
    const updatedImage = { ...image, isKept };
    const updatedImages: any[] = images.map(img => img.id === updatedImage.id ? updatedImage : img);

    setImages(updatedImages);
    updateImages(updatedImages);

    if (!image.isKept) {
      createParticles(e.clientX, e.clientY, zoomScale, 'keep');
    }
  }

  const handleImageClick = (imageId: number, index: number, event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) {
      if (event.shiftKey && currentSelectedIndex !== null) {
        const start = Math.min(currentSelectedIndex, index);
        const end = Math.max(currentSelectedIndex, index);
        const newSelectedImageIds = images.slice(start, end + 1).map(img => img.id);
        setSelectedImageIds(prevIds => Array.from(new Set([...prevIds, ...newSelectedImageIds])));
        setCurrentSelectedIndex(index);
      } else if(event.shiftKey && currentSelectedIndex === null) {
        setCurrentSelectedIndex(index);
        setSelectedImageIds(prevIds =>  [...prevIds, imageId]);
      } else {
        if (currentSelectedIndex === index || selectedImageIds.includes(imageId)) {
          setCurrentSelectedIndex(null);
        } else {
          setCurrentSelectedIndex(index);
        }
        
        setSelectedImageIds(prevIds =>
          prevIds.includes(imageId)
            ? prevIds.filter(id => id !== imageId) // Deselect if already selected
            : [...prevIds, imageId] // Select if not already selected
        );
      }
    }
  };

  const handleDeleteOnClick = (e: any, image: any) => {
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
        if(currentSelectedIndex === images.findIndex(img => img.id === image.id)) {
          setCurrentSelectedIndex(null);
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
            if (isAClick && selectedImageIds.includes(image.id) && currentSelectedIndex === index) {
              setCurrentSelectedIndex(null);
              deselectedImages.push(image.id);
              return false;
            } else if (isAClick && selectedImageIds.includes(image.id) && currentSelectedIndex !== index) {
              deselectedImages.push(image.id);
              return false;
            } else {
              setCurrentSelectedIndex(index);
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
    <div 
      id='main-element'
      style={{
        backgroundColor: 'black',
        color: 'white',
        width: firstRowWidth + 'px',
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: columnGap + 'px',
        padding: padding + 'px',
        boxSizing: 'border-box',
        transform: 'matrix(1, 0, 0, 0, 0, 0)', // Scale down to 0
        transition: 'transform 0.2s ease-out',
        transformOrigin: origin, // Dynamic transform-origin based on mouse position
        userSelect: 'none',
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
            className="no-drag"
            onTouchEnd={(event) => {  
              return !isDragging ? handleImageClick(image.id, index, event) : null
            }}
            onMouseUp={(event) => {  
              return !isDragging ? handleImageClick(image.id, index, event) : null
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '0.8em',
              border: '4px solid rgba(255, 255, 255, 0.5)',
              borderColor: currentSelectedIndex === index ? 'deeppink' : selectedImageIds.includes(image.id) ? 'blue' : image.isKept ? 'orange' : 'rgba(255, 255, 255, 0.5)',
              opacity: selectedImageIds.includes(image.id) ? 0.5 : 1,
              height: defaultRowHeight + 'px',
              width: 'fit-content',
              userSelect: 'none',
              display: 'flex',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <button 
              id={`delete-button-${image.id}`} 
              type="button" 
              className={`btn btn-dark py-1.5 my-1 ${image.isKept ? ' disabled' : ''}`}
              style={{
                flex: 'none',
                // transition: 'color 0.5s ease, transform 0.2s ease', // Add smooth transition
              }}
              onClick={(e) => {
                handleDeleteOnClick(e, image);
              }}>
              <i
                id={`delete-icon-${image.id}`} 
                style={{
                  fontSize: '1.2em',
                  zIndex: 10,
                  transition: 'color 0.5s ease, transform 0.2s ease', // Add smooth transition
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
              style={{flex: 'none'}}
              onClick={(e) => {
                handleKeepOnClick(e, image);
              }}>
              <i 
              id={`keep-icon-${image.id}`}
              style={{
                fontSize: '1.2em',
                zIndex: 10,
                transition: 'color 0.5s ease, transform 0.3s ease', // Add smooth transition
              }} 
              className={`bi bi-bag-plus-fill pointer${image.isKept ? ' clicked' : ''}`}
              data-bs-toggle="tooltip"
              data-bs-placement="top" 
              title='KEEP'
              ></i>
            </button>
            <span 
              style={{
                flex: 'auto', 
                textAlign: 'right', 
                alignSelf: 'center', 
                marginRight: '15px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                marginLeft: 'auto',
              }}
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
  );
};

export default DraggableBox;