import React, { useState, useRef, useEffect } from 'react';
import '../styles/photo-galleria.css'; // Import the CSS file

interface PhotoGalleriaProps {
  images: any[];
  setIsGalleriaClosed: React.Dispatch<React.SetStateAction<boolean | null>>;
  setCurrentSelectedImageId: React.Dispatch<React.SetStateAction<number | null>>;
  currentSelectedImageId: number | null;
  handleDeleteOnClick: (e: any, image: any, index: number, deleteIcon: any) => boolean;
  handleKeepOnClick: (e: any, image: any ) => boolean;
}

const PhotoGalleria: React.FC<PhotoGalleriaProps> = ({ images, setIsGalleriaClosed, setCurrentSelectedImageId, currentSelectedImageId, handleDeleteOnClick, handleKeepOnClick}) => {
  const currentSelectedImageIndexOnGalleria = currentSelectedImageId || 0;
  const currentSelectedImageOnGalleria = images[currentSelectedImageIndexOnGalleria];
  const [selectedImage, setSelectedImage] = useState<string>(images[currentSelectedImageIndexOnGalleria].path);
  const [isDraggingReel, setIsDraggingReel] = useState<boolean>(false);
  const [isAutoNextOn, setIsAutoNextOn] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const thumbnailReelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = document.querySelector('.container-fluid') as HTMLDivElement;
    if (container) {
      container.style.transition = 'opacity 0.15s ease-in-out';
      setTimeout(() => {
        container.style.opacity = '1';
      }, 150);
    }
    if (currentSelectedImageId === null) {
      setCurrentSelectedImageId(0);
    }
    centerThumbnail(currentSelectedImageIndexOnGalleria);
  }, []);

  const scrollThumbnails = (direction: 'left' | 'right', increment: number) => {
    if ( direction === 'left' ) {
      if (currentSelectedImageIndexOnGalleria > 0) {
        if (currentSelectedImageIndexOnGalleria - increment < 0) {
          handleThumbnailClick(images[0].path, 0);
        } else {
          handleThumbnailClick(images[currentSelectedImageIndexOnGalleria - increment].path, currentSelectedImageIndexOnGalleria - increment);
        }
      }
    } else { 
      if (currentSelectedImageIndexOnGalleria + increment >= images.length) {
        handleThumbnailClick(images[images.length - 1].path, images.length - 1);
      } else if (currentSelectedImageIndexOnGalleria < images.length - increment && currentSelectedImageIndexOnGalleria + increment < images.length) {
        handleThumbnailClick(images[currentSelectedImageIndexOnGalleria + increment].path, currentSelectedImageIndexOnGalleria + increment);
      }
    }
  };

  const handleThumbnailClick = (path: string, index: number) => {
    setSelectedImage(path);
    setCurrentSelectedImageId(index);
    centerThumbnail(index);
  };

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

  const handleOnMouseEnter = (e: any) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.transform = 'scale(1.3)';
    target.querySelector('i')!.classList.add('text-white');
  }

  const handleOnMouseLeave = (e: any) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.zIndex = '0';
    target.style.transform = 'scale(1)';
    target.querySelector('i')!.classList.remove('text-white');
  }

  const handleReelOnMouseDown = (e: any) => {
    e.preventDefault();
    const reel = thumbnailReelRef.current;
    if (reel) {
      reel.style.cursor = 'grabbing';
      reel.style.userSelect = 'none';
      const startX = e.pageX || e.touches[0].pageX;
      const scrollLeft = reel.scrollLeft;
      let velocity = 0;
      let lastX = startX;

      const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        setIsDraggingReel(true);
        const x = (moveEvent instanceof MouseEvent ? moveEvent.pageX : moveEvent.touches[0].pageX) - startX;
        velocity = (moveEvent instanceof MouseEvent ? moveEvent.pageX : moveEvent.touches[0].pageX) - lastX;
        lastX = moveEvent instanceof MouseEvent ? moveEvent.pageX : moveEvent.touches[0].pageX;
        reel.scrollLeft = scrollLeft - x;
      };

      const onEnd = () => {
        reel.style.cursor = 'grab';
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
        setTimeout(() => setIsDraggingReel(false), 0); // Delay to ensure click event is not triggered

        // Continue dragging for a while with decreasing velocity
        const continueDragging = () => {
          if (Math.abs(velocity) > 0.1) {
            reel.scrollLeft -= velocity;
            velocity *= 0.95; // Decrease velocity
            requestAnimationFrame(continueDragging);
          }
        };
        continueDragging();
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onEnd);
    }
  };

  const handleGalleriaClose = () => {
    const container = document.querySelector('.photo-galleria') as HTMLDivElement;
    if (container) {
        container.style.transition = 'opacity 0.2s ease-out';
        container.style.opacity = '0';
        setTimeout(() => {
          setIsGalleriaClosed(true);
        }, 200);
    }
    console.log('Close button clicked');
  }

  const handleThumbnailMouseEnter = (e: any) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.transform = 'scale(1)';
    // target.style.zIndex = '10';
    if (target.src !== selectedImage) {
      target.style.border = '4px solid grey';
    }
  }

  const handleThumbnailMouseLeave = (e: any) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.transform = 'scale(1)';
    // target.style.zIndex = '0';
    setTimeout(() => {
      if (Number(target.id) !== currentSelectedImageIndexOnGalleria) { //get image index from the target element and compare with currentSelectedImageIndexOnGalleria
        target.style.border = `4px solid ${images.find(img => img.id === Number(target.id))?.isKept ? 'orange' : 'rgba(0, 0, 0, 0.70)'}`;
      }
    }, 300); // Delay border change to match the transition duration
  }

  const handleSelectedImageOnWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    const img = e.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    const scaleRatio = 0.003;
    let newScale = scale;
    if (!(scale + e.deltaY * -scaleRatio < 1 || scale + e.deltaY * -scaleRatio > 3)) {
      newScale = scale + e.deltaY * -scaleRatio;
      setScale(newScale);
    }
  };

  const handleReelOnWheel = (e: any) => {
    if (thumbnailReelRef.current) {
      const reel = thumbnailReelRef.current;
      const scrollAmount = -8 * e.deltaY;
      const startScrollLeft = reel.scrollLeft;
      const endScrollLeft = startScrollLeft + scrollAmount;
      const duration = 300; // duration of the animation in ms
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        reel.scrollLeft = startScrollLeft + (endScrollLeft - startScrollLeft) * easeInOutQuad(progress);
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  }

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

  const handleDeleteOnClickOnGalleria = (e: any, image: any, index: number, deleteIcon: any) => {

    if (handleDeleteOnClick(e, image, index, deleteIcon)) {
      // setIsGalleriaClosed(true);
      const nextImage = images.find((img, idx) => idx > index && img.id !== image.id);
      if (nextImage) {
        console.log('Next image:', nextImage);
        setCurrentSelectedImageId(index);
        setSelectedImage(nextImage.path);
      }
    }
  }
  
  const handleThumbnailImageClick = (image: any, index: any) => {
    if (!isDraggingReel) {
      handleThumbnailClick(image.path, index)
    }
  }

  return (
    <div className="photo-galleria container-fluid position-absolute vh-100 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50 p-0" 
      style={{ zIndex: 2, backdropFilter: 'blur(10px)', opacity: 0 }}>
      <button
        className="position-absolute top-0 end-0 m-4 btn"
        aria-label="Close" 
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onClick={handleGalleriaClose}
      >
        <i className="bi bi-x text-secondary" style={{ fontSize: '3em' }}></i>
      </button>
      <div className='row h-25 mt-8'>
        <div className='col'>
          <img 
            src={selectedImage} 
            alt="Selected" 
            className="col p-0 position-absolute" 
            style={{ 
              maxWidth: '70vw', 
              maxHeight: '70vh', 
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
      <div id="reel" className="row position-absolute bottom-0 start-50 translate-middle-x m-0 my-4" style={{ width: '100%' }}>
        <div className="container">
          <div className="row justify-content-center">
            <button className="col-1 btn py-1.5 my-2 fs-3 me-auto no-focus-border"              
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              onClick={() => scrollThumbnails('left', 10)}>
              <i className="pi bi-arrow-left-circle-fill text-secondary"></i>
            </button>
            <button className="nav-button col-1 btn py-1.5 my-2 d-flex justify-content-center align-items-center"                
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              onClick={() => scrollThumbnails('left', 1)}
              >
                <i className="bi bi-chevron-compact-left text-secondary" style={{ fontSize: '3em' }}></i>
            </button> 
            <button
              id={`delete-button-${currentSelectedImageOnGalleria.id}`}
              type="button"
              style={{ height: '8vh', width: '8vh' }}
              className={`delete-btn col-1 btn btn-dark align-self-center mx-1 ${currentSelectedImageOnGalleria.isKept ? ' disabled' : ''}`}
              onMouseUp={(e) => {
                handleDeleteOnClickOnGalleria(e, currentSelectedImageOnGalleria, currentSelectedImageIndexOnGalleria, e.currentTarget.querySelector(`i#delete-icon-${currentSelectedImageOnGalleria.id}`));
              } }
              onTouchEnd={(e) => {
                handleDeleteOnClickOnGalleria(e, currentSelectedImageOnGalleria, currentSelectedImageIndexOnGalleria, e.currentTarget.querySelector(`i#delete-icon-${currentSelectedImageOnGalleria.id}`));
              } }>
                <i 
                id={`delete-icon-${currentSelectedImageOnGalleria.id}`}
                style={{
                  fontSize: '3vh'
                }}
                className={`bi bi-trash3-fill pointer${currentSelectedImageOnGalleria.deleteClickedOnce ? ' clicked' : ''}`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title='DELETE'
                ></i>
            </button>
            <div className="col-1 align-self-center ml-2 d-flex justify-content-center align-items-center form-check form-switch p-0"
              style={{ height: '8vh', width: '8vh' }}>
              <input className="form-check-input m-0"
              style={{
                // fontSize: '3vh',
                width: '6vh',
                height: '6vh',
                // backgroundColor: 'white',
                // borderColor: 'grey'
              }} 
              type="checkbox" 
              id="flexSwitchCheckDefault" 
              checked={isAutoNextOn} 
              onChange={() => setIsAutoNextOn(!isAutoNextOn)} />
            </div>
            <button
              id={`keep-button-${currentSelectedImageOnGalleria.id}`}
              type="button"
              style={{ height: '8vh', width: '8vh'}}
              className="keep-btn col-1 btn btn-dark align-self-center ml-2"
              onMouseDown={(e) => handleKeepOnClick(e, currentSelectedImageOnGalleria) }
              onMouseUp={(e) => {
                isAutoNextOn && scrollThumbnails('right', 1);
              }}
              onTouchStart={(e) => handleKeepOnClick(e, currentSelectedImageOnGalleria) }
              onTouchEnd={(e) => {
                isAutoNextOn && scrollThumbnails('right', 1);
              }}
              >
              <i
                id={`keep-icon-${currentSelectedImageOnGalleria.id}`}
                style={{
                  fontSize: '3vh'
                }}
                className={`bi ${currentSelectedImageOnGalleria.isKept ? 'bi-bag-dash-fill' : 'bi-bag-plus-fill'} pointer${currentSelectedImageOnGalleria.isKept ? ' clicked' : ''}`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title={`${currentSelectedImageOnGalleria.isKept ? 'UNKEEP' : 'KEEP'}`}
              ></i>
            </button>
            <button className="nav-button col-1 btn py-1.5 my-2 d-flex justify-content-center align-items-center"           
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              onClick={() => scrollThumbnails('right', 1)}>
                <i className="bi bi-chevron-compact-right text-secondary" style={{ fontSize: '3em' }}></i>
            </button>
            <button className="col-1 btn py-1.5 my-2 fs-3 ms-auto"            
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              onClick={() => scrollThumbnails('right', 10)}>
              <i className="pi bi-arrow-right-circle-fill text-secondary"></i>
            </button>
          </div>
          <div className="row">
            <div 
              className="col-10 d-flex overflow-hidden thumbnail-reel p-0 w-100"
              ref={thumbnailReelRef}
              onMouseDown={handleReelOnMouseDown}
              onTouchStart={handleReelOnMouseDown}
              onWheel={handleReelOnWheel}
            >
              {images.map((image, index) => (
                <img
                  id={index.toString()}
                  key={index}
                  src={image.path}
                  alt={`Thumbnail ${index}`}
                  className="thumbnail mx-1 cursor-pointer"
                  onClick={() => handleThumbnailImageClick(image, index)}
                  style={{ 
                    border: index === currentSelectedImageId ? '4px solid deeppink' : image.isKept ? '4px solid orange' : '4px solid rgba(0, 0, 0, 0.70)',
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease-in-out, border 0.3s ease-in-out',
                  }}
                  onMouseEnter={handleThumbnailMouseEnter}
                  onMouseLeave={handleThumbnailMouseLeave}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoGalleria;