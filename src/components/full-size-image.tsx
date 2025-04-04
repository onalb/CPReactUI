import React, { useState, useRef, useEffect } from 'react';
import '../styles/photo-galleria.css'; // Import the CSS file
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { removeTrackedEventListeners } from './tracked-event-handler';

const FullSizeImage: React.FC<any> = () => {
  debugger;
  const folder='C:\\Users\\burak\\Pictures\\Lansdale\\23'
  const name = '0H7A6252.JPG';
  const imageHeight = 364.8;
  const image = `http://localhost:3080/api/photos?folder=${folder}&image=${name}&height=${imageHeight * 10}`
  const [selectedImage, setSelectedImage] = useState<any>(image);
  const [scale, setScale] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const thumbnailReelRef = useRef<HTMLDivElement | null>(null);

  removeTrackedEventListeners(window, 'mousedown');
  removeTrackedEventListeners(window, 'mousemove');
  removeTrackedEventListeners(window, 'mouseup');
  removeTrackedEventListeners(window, 'wheel');
  removeTrackedEventListeners(window, 'touchstart');
  removeTrackedEventListeners(window, 'touchmove');
  removeTrackedEventListeners(window, 'touchend');
  removeTrackedEventListeners(window, 'click');

  useEffect(() => {
    const container = document.querySelector('.container-fluid') as HTMLDivElement;

    if (container) {
      container.style.transition = 'opacity 0.15s ease-in-out';
      setTimeout(() => {
        container.style.opacity = '1';
      }, 150);
    }
  }, []);

  const centerThumbnail = (index: number) => {
    if (thumbnailReelRef.current) {
      const reelWidth = thumbnailReelRef.current.clientWidth;
      let cumulativeWidth = 0;
      const thumbnailExterior = 16;
      for (let i = 0; i < index; i++) {
        cumulativeWidth += thumbnailReelRef.current.children[i].clientWidth + thumbnailExterior;
      }
      const thumbnailWidth = thumbnailReelRef.current.children[index].clientWidth + thumbnailExterior;
      const scrollPosition = cumulativeWidth - reelWidth / 2 + thumbnailWidth / 2;
      thumbnailReelRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  const handleSelectedImageOnWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    const img = e.currentTarget as HTMLImageElement;
    const scaleRatio = 0.003;
    let newScale = scale;
    if (!(scale + e.deltaY * -scaleRatio < 1 || scale + e.deltaY * -scaleRatio > 6)) {
      newScale = scale + e.deltaY * -scaleRatio;
      setScale(newScale);
    }
  };

  const handleSelectedImageOnMouseDown = (e: any) => {
    e.preventDefault();
    const img = e.currentTarget as HTMLImageElement;
    img.style.cursor = 'grabbing';
    const startX = e.pageX;
    const startY = e.pageY;
    const startLeft = img.offsetLeft;
    const startTop = img.offsetTop;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.pageX - startX;
      const deltaY = moveEvent.pageY - startY;
      img.style.left = `${startLeft + deltaX}px`;
      img.style.top = `${startTop + deltaY}px`;
    };

    const onMouseUp = () => {
      img.style.cursor = 'grab';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  return (
    <>
    {loading && (<div className='loading-spinner' style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        backdropFilter: 'blur(5px)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading images...</p>
        </div>
      </div>
    )}
    (<div className="photo-galleria container-fluid position-absolute vh-100 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50 p-0" 
      style={{ zIndex: 2, backdropFilter: 'blur(10px)', opacity: 0 }}>
      <div className='row h-25 mt-8'>
        <div className='col'>
          <img 
            id={selectedImage}
            src={selectedImage} 
            alt="Selected" 
            className="col p-0 position-absolute" 
            style={{
              height: '600px',
              border: '15px solid rgba(0, 0, 0, 0.70)',
              transition: 'transform 0.3s ease-in-out',
              cursor: 'grab',
              transform: `translate(-50%, -50%) scale(${scale})`,
              objectFit: 'contain',
            }}
            onWheel={handleSelectedImageOnWheel}
            onMouseDown={handleSelectedImageOnMouseDown}
          />
        </div>
      </div>
    </div>)</>
  );
};

export default FullSizeImage;