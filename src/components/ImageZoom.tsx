import React, { useEffect, useState, useRef } from 'react';
import { pictures } from './pictures';
import '../styles/ImageZoom.css';

const BlueSquare: React.FC = () => {
  const rows = 20;
  const numberOfColumns = 5;
  const padding = 10;
  const columnGap = 2;
  const defaultRowHeight = 100;
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  const [zoomLevel, setZoomLevel] = useState(0); // Initial zoom level
  const [images, setImages] = useState(pictures);
  let isDragging = false;
  let lastPosX = 0;
  let lastPosY = 0;

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

    window.addEventListener('load', (event) => {
      debugger;
      const mainElement = document.getElementById('main-element');
      if (mainElement) {
        const rect = mainElement.getBoundingClientRect();
        const x = (window.innerWidth - rect.width) / 2;
        debugger;
        view.move({ x, y: 0 });
        view.applyTo(mainElement);
      }
    });

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // document.addEventListener('DOMContentLoaded', () => { view.pan({ x: 200, y: 0 }); });

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);



  document.addEventListener('wheel', (event) => {
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
  });




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
        debugger;
        if (dirty) { this.update() }
        pos.x += amount.x;
        pos.y += amount.y;
        dirty = true;
      },
      pan(amount: any) {
        debugger;
        if (dirty) { this.update() }
        pos.x += amount.x;
        pos.y += amount.y;
        dirty = true;
      },
      scaleAt(at: any, amount: any) {
        if (dirty) { this.update() }
        scale *= amount;
        pos.x = at.x - (at.x - pos.x) * amount;
        pos.y = at.y - (at.y - pos.y) * amount;
        dirty = true;
      },
    };
    return API;
  })();

  // const zoomStyle = {
  //   transform: `scale(${zoomLevel})`,
  //   transition: 'transform 0.2s ease-out', // Smooth transition for zoom effect
  // };

  return (
    <div 
      id='main-element'
      style={{
        backgroundColor: 'blue',
        color: 'white',
        // width: '50vw',
        // height: '200vh',
        width: calculateFirstRowWidth() + 'px',
        // height: '100%',
        display: 'inline-flex',
        flexWrap: 'wrap',
        justifyContent: 'center', // Center images vertically
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
        <img 
        key={index}
        src={image.path}
        alt={`Image ${index}`} 
        className="no-drag"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          fontSize: '0.8em',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          height: defaultRowHeight + 'px',
          userSelect: 'none'
        }} 
      />
      ))}
    </div>
  );
};

export default BlueSquare;