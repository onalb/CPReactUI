import React, { useEffect, useState, useRef } from 'react';
import { pictures } from './pictures';
import '../styles/ImageZoom.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createParticles } from './create-particles';
import applyMouseEvents from './zoom-pan';
import  { startTimer, stopTimer} from './timer-functions';

const DraggableBox: React.FC = () => {
  //user editable paramters
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
  const [clickedImageIds, setClickedImageIds] = useState<number[]>([]);
  const [firstClickedIndex, setFirstClickedIndex] = useState<number | null>(null);

  useEffect(() => {
    applyMouseEvents(setZoomScale, setIsDragging);
  }, []);

  useEffect(() => {
    console.log('clickedImageIds:', clickedImageIds);
  }, [clickedImageIds]);

  // functions
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

  const handleImageClick = (imageId: number, index: number, event: React.MouseEvent) => {
    // console.log('imageId:', imageId);
    if (!isDragging) {
      if (event.shiftKey && firstClickedIndex !== null) {
        const start = Math.min(firstClickedIndex, index);
        const end = Math.max(firstClickedIndex, index);
        const newClickedImageIds = images.slice(start, end + 1).map(img => img.id);
        setClickedImageIds(prevIds => Array.from(new Set([...prevIds, ...newClickedImageIds])));
      } else {
        if(firstClickedIndex === index || clickedImageIds.includes(imageId)) {
          setFirstClickedIndex(null);
        } else {
          setFirstClickedIndex(index);
        }
        
        setClickedImageIds(prevIds =>
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
        setImages(images.filter(img => img.id !== image.id)); //removes the deleted image from the array
        createParticles(e.clientX, e.clientY, zoomScale, 'delete');
        setClickedImageIds(prevIds => prevIds.filter(id => id !== image.id));
      }
    }
  }

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
    >
      {images.map((image, index) => (
        <div key={index} className='image-card'>
          <img
            id={`image-${image.id}`}
            src={image.path}
            alt={`Image ${index}`}
            className="no-drag"
            onMouseUp={(event) => {  
              return !isDragging ? handleImageClick(image.id, index, event) : null
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '0.8em',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderColor: image.isKept ? 'orange' : 'rgba(255, 255, 255, 0.5)',
              opacity: clickedImageIds.includes(image.id) ? 0.5 : 1,
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
              {image.fileName.length > 10 
                ? `${image.fileName.slice(0, 5)}...${image.fileName.slice(-5)}` 
                : image.fileName}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DraggableBox;