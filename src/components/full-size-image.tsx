import React, { useEffect, useState } from 'react';
import '../styles/ImageZoom.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import applyMouseAndTouchEvents from './mouse-and-touch-events';
import { removeTrackedEventListeners } from './tracked-event-handler';

const ImageGrid: React.FC = () => {
  // States
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  const [zoomScale, setZoomScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);
  const [isLoadingCompletedAtStart, setIsLoadingCompletedAtStart] = useState<boolean>(true);

  // Functions
  useEffect(() => {
    if (isLoadingCompletedAtStart) {
      const cleanup = applyMouseAndTouchEvents(
        'main-element',
        null, 
        1,
        setZoomScale, 
        setIsDragging,
        setIsZooming, 
        setIsLongTouch,
      );

      return () => {
        cleanup();
        removeTrackedEventListeners(window, 'keyup');
        removeTrackedEventListeners(window, 'keydown');
      };
    }
  }, [isLoadingCompletedAtStart]);

  return (
    <>  
    <div
      id='main-element'
      style={{
        transformOrigin: origin,
        transform: 'matrix(1, 0, 0, 1, 0, 0)',
      }}
    >
      asdasds
    </div>
    </>
  );
};

export default ImageGrid;