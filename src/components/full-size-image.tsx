import React, { useEffect, useRef, useState } from 'react';
import applyMouseAndTouchEvents from './mouse-and-touch-events';
import { removeTrackedEventListeners } from './tracked-event-handler';
import { useParams } from 'react-router-dom';
import { openFolder } from '../services/PhotoService';

const FullSizeImage: React.FC = () => {
  const { imagePath, originalImagePath } = useParams<{
    imagePath: string;
    originalImagePath: string;
  }>();
  
  // States
  const [origin, setOrigin] = useState('0 0');
  const [isLoadingCompletedAtStart, setIsLoadingCompletedAtStart] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);

  // Double tap detection hook
  function useDoubleTap(callback: () => void, delay = 300) {
    const lastTap = useRef<number | null>(null);

    function onTouchEnd(e: React.TouchEvent) {
      // Only trigger on single-finger tap
      if (e.touches.length > 0 || e.changedTouches.length !== 1) return;

      const now = Date.now();
      if (lastTap.current && now - lastTap.current < delay) {
        callback();
        lastTap.current = null;
      } else {
        lastTap.current = now;
      }
    }

    return { onTouchEnd };
  }

  const { onTouchEnd } = useDoubleTap(() => {
    originalImagePath && openFolder(originalImagePath)
  });

  useEffect(() => {
    if (isLoadingCompletedAtStart) {
      const cleanup = applyMouseAndTouchEvents(
        'full-size-image',
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
    {imagePath && originalImagePath && (<div
      id='full-size-image'
      style={{
        position: 'fixed',
        transformOrigin: origin,
        transform: 'matrix(1, 0, 0, 1, 0, 0)',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'black',
        zIndex: 1000,
      }}
    >
      <img
        alt='img'
        src={imagePath}
        style={{
          padding: '25px',
          margin: '100px',
          color: 'white',
          border: '25px solid rgba(128,128,128,0.5)',
          maxWidth: '75%',
          maxHeight: '75%',
        }}
        onDoubleClick={() => openFolder(originalImagePath)}
        onTouchEnd={onTouchEnd}
      />
    </div>)}
    </>
  );
};

export default FullSizeImage;