import React, { useEffect, useState, useRef } from 'react';
import { pictures } from './pictures';
import '../styles/ImageZoom.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createParticles } from './createParticles';

const DraggableBox: React.FC = () => {
  //user editable paramters
  const numberOfColumns = 5;

  // Constants
  const padding = 10;
  const columnGap = 2;
  const defaultRowHeight = 300;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerMap = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // States
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  const [zoomLevel, setZoomLevel] = useState(0); // Initial zoom level
  const [images, setImages] = useState(pictures);
  const [zoomScale, setZoomScale] = useState(1);

  // Variables
  let isDragging = false;
  let lastPosX = 0;
  let lastPosY = 0;

  const updateImages = (image: any) => {
    setImages(images.map(img => img.id === image.id ? image : img));
    // Here we will make a call to DB. 
    // If the call is successful, we will keep the state as updated if wrong we will invalidate the query for images.
  }

  const calculateFirstRowWidth = () => { 
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

  const [firstRowWidth, setFirstRowWidth] = useState(calculateFirstRowWidth()); // Initial transform-origin

  useEffect(() => {
    const handleMouseDown = (event: any) => {
      isDragging = true;
      lastPosX = event.clientX;
      lastPosY = event.clientY;
    };

    const handleMouseMove = (event: any) => {
      if (isDragging) {
        const dx = event.clientX - lastPosX;
        const dy = event.clientY - lastPosY;
        view.pan({ x: dx, y: dy });
        view.applyTo(document.getElementById('main-element'));
        lastPosX = event.clientX;
        lastPosY = event.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (event: any) => {
      // Prevent the default zoom
      event.preventDefault();
      // Determine the zoom point (e.g., the current mouse position)
      const at = { x: event.clientX, y: event.clientY };
      // Determine the zoom amount based on the wheel delta
      const amount = event.deltaY < 0 ? 1.1 : 0.9;
      // Call the scaleAt function
      view.scaleAt(at, amount);
      // Apply the transformation to the element you want to zoom
      view.applyTo(document.getElementById('main-element'));
    };

    window.addEventListener('load', (event) => {
      const mainElement = document.getElementById('main-element');
      const windowWidth = window.innerWidth;

      if (mainElement) {
        const rect = mainElement.getBoundingClientRect();
        
        if(rect.width < windowWidth) {
          const x = (windowWidth - rect.width) / 2;
          view.move({ x, y: 0 });
          view.applyTo(mainElement);
          // mainElement.style.justifyContent = 'center';
        } else {
          view.move({ x: 0, y: 0 });
          view.applyTo(mainElement);
        }
      }
    });

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('wheel', handleWheel);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const view = (() => {
    const matrix = [1, 0, 0, 1, 0, 0]; // current view transform
    var m = matrix;             // alias 
    var scale = 1;              // current scale
    const pos = { x: 0, y: 0 }; // current position of origin
    var dirty = true;
    const API = {
      applyTo(el: any) {
        if (dirty) { this.update() }
        el.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
        // No changes needed here, as this already applies the transformation allowing for movement out of viewport
      },
      update() {
        dirty = false;
        m[3] = m[0] = scale; // Scale X and Y equally
        m[2] = m[1] = 0; // No skew
        m[4] = pos.x; // Translate X
        m[5] = pos.y; // Translate Y
      },
      move(amount: any) {
        if (dirty) { this.update() }
        pos.x += amount.x;
        pos.y += amount.y;
        dirty = true;
      },
      pan(amount: any) {
        if (dirty) { this.update() }
        pos.x += amount.x;
        pos.y += amount.y;
        dirty = true;
      },
      scaleAt(at: any, amount: any) {
        if (dirty) { this.update() }
        scale *= amount;
        console.log(scale);
        setZoomScale(scale);
        pos.x = at.x - (at.x - pos.x) * amount;
        pos.y = at.y - (at.y - pos.y) * amount;
        dirty = true;
      },
    };
    return API;
  })();

  const startTimer = (image: any) => {
    if (timerMap.current.has(image.id)) {
      clearTimeout(timerMap.current.get(image.id)!); // Clear any existing timer for this ID
    }

    const timer = setTimeout(() => {
      if (image) {
        image.deleteClickedOnce = false;
        setImages(prevImages => prevImages.map(img => img.id === image.id ? image : img));
        console.log(`Timer finished for image ${image.id}`);
      }
      timerMap.current.delete(image.id); // Remove the timer from the map after it finishes
    }, 1000); // 2 seconds timer

    timerMap.current.set(image.id, timer); // Store the timer in the map
  };

  const stopTimer = (image: any) => {
    if (timerMap.current.has(image.id)) {
      clearTimeout(timerMap.current.get(image.id)!);
      timerMap.current.delete(image.id); // Remove the timer from the map
      console.log(`Timer stopped for image ${image.id}`);
    }
  };

  return (
    <div 
      id='main-element'
      style={{
        backgroundColor: 'black',
        color: 'white',
        // width: '50vw',
        // height: '200vh',
        width: firstRowWidth + 'px',
        // height: '100%',
        display: 'inline-flex',
        flexWrap: 'wrap',
        // justifyContent: 'center', // Center images vertically
        // gridTemplateRows: `repeat(${rows}, 1fr)`,
        // gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: columnGap + 'px',
        padding: padding + 'px',
        boxSizing: 'border-box',
        // overflow: 'auto',
        transform: 'matrix(1, 0, 0, 0, 0, 0)', // Scale down to 0
        // transform: `scale(${zoomLevel})`,
        transition: 'transform 0.2s ease-out',
        transformOrigin: origin, // Dynamic transform-origin based on mouse position
        userSelect: 'none',
        // position: 'absolute',
        // right: '200px',
      }}
    >
      {images.map((image, index) => (
        <div key={index}>
          <img
            id={`image-${image.id}`}
            src={image.path}
            alt={`Image ${index}`}
            className="no-drag"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '0.8em',
              border: '1px solid rgba(255, 255, 255, 0.5)',
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
              className="btn btn-dark py-1.5 my-1"
              style={{flex: 'none'}}
              onClick={(e) => {
                  // const deleteIcon = document.getElementById(`delete-icon-${image.id}`);
                  const deleteIcon = e.currentTarget.querySelector(`i#delete-icon-${image.id}`);
                if(deleteIcon) {
                  if(!image.deleteClickedOnce) {
                    image.deleteClickedOnce = true;
                    setImages(images.map(img => img.id === image.id ? image : img));
                    startTimer(image);
                  } else {
                    stopTimer(image);
                    setImages(images.filter(img => img.id !== image.id));
                    createParticles(e.clientX, e.clientY, zoomScale, 'delete');
                  }
                }
              }}>
              <i
                id={`delete-icon-${image.id}`} 
                style={{
                fontSize: '1.2em',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'color 0.5s ease, transform 0.3s ease', // Add smooth transition
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
                const isKept: boolean = image.isKept ? false : true;
                updateImages({ ...image, isKept });

                const imageElement = document.getElementById(`image-${image.id}`);
                const keepIcon = document.getElementById(`keep-icon-${image.id}`);

                if (keepIcon && imageElement) {
                  keepIcon.style.color = isKept ? 'orange' : 'white'
                  imageElement.style.borderColor = isKept ? 'orange' : 'white';
                }

                const deleteIcon = document.getElementById(`delete-icon-${image.id}`);
                const deleteButton = document.getElementById(`delete-button-${image.id}`);
                if (deleteIcon && deleteButton) {
                  deleteButton.classList.toggle('disabled', isKept);
                }
                console.log(isKept);
                if(!image.isKept) {
                  createParticles(e.clientX, e.clientY, zoomScale, 'keep');
                }
              }}>
              <i 
              id={`keep-icon-${image.id}`}
              style={{
                color: 'white',
                fontSize: '1.2em',
                zIndex: 10,
              }} 
              className="bi bi-bag-plus-fill"
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
              {/* {image.fileName} */}
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