import React, { useState, useRef, useEffect } from 'react';
import '../styles/photo-galleria.css'; // Import the CSS file
import { removeTrackedEventListeners } from './tracked-event-handler';

interface PhotoGalleriaProps {
  images: any[];
  setIsGalleriaClosed: React.Dispatch<React.SetStateAction<boolean | null>>;
  setCurrentSelectedImage: (imageId: number) => void;
  getCurrentSelectedImage: () => any;
  handleDeleteOnClick: (e: any, image: any, index: number, deleteIcon: any) => boolean;
  handleKeepOnClick: (e: any, image: any ) => boolean;
  isKeepButtonDisabled?: boolean;
}

const PhotoGalleria: React.FC<PhotoGalleriaProps> = ({ 
  images, 
  setIsGalleriaClosed, 
  setCurrentSelectedImage,
  getCurrentSelectedImage,
  handleDeleteOnClick, 
  handleKeepOnClick,
  isKeepButtonDisabled
}) => {
  const [imagesOnGalleria, setImagesOnGalleria] = useState<any[]>(images.filter((image) => !image.isDeleted));
  const [selectedImage, setSelectedImage] = useState<any>(imagesOnGalleria[getCurrentSelectedImage().id || 0]);
  const [isDraggingReel, setIsDraggingReel] = useState<boolean>(false);
  const [isAutoNextOn, setIsAutoNextOn] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSelectedImageIndexOnGalleria, setCurrentSelectedImageIndexOnGalleria] = useState<number>(0);
  const thumbnailReelRef = useRef<HTMLDivElement | null>(null);
  const deletedImageCount = imagesOnGalleria.filter((image) => image.isDeleted).length;
  let animationFrameId: number | null = null;
  let loadedImageCount = 0;
  let currentSelectedImageOnGalleria = getCurrentSelectedImage();
  let currentSelectedImageIndex: number = 0;

  useEffect(() => {
    if (currentSelectedImageOnGalleria.index === -1 && imagesOnGalleria.length > 0) {
      currentSelectedImageIndex = 0;
      setCurrentSelectedImage(imagesOnGalleria[0].id);
    } else {
      currentSelectedImageIndex = currentSelectedImageOnGalleria.index;
      setCurrentSelectedImageIndexOnGalleria(imagesOnGalleria.findIndex((image) => image.id === currentSelectedImageOnGalleria.id));
    }
  }, [currentSelectedImageOnGalleria, imagesOnGalleria, setCurrentSelectedImage]);

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

    if (getCurrentSelectedImage().index >= 0) {
      currentSelectedImageIndex = getCurrentSelectedImage().index;
    } else {
      setCurrentSelectedImage(imagesOnGalleria[0].id);
      currentSelectedImageIndex = 0;
    }

    centerThumbnail(currentSelectedImageIndex);
  }, []);

  useEffect(() => {
    setImagesOnGalleria(images.filter((image) => !image.isDeleted));

    setSelectedImage((prevSelectedImage: any) => {
      if (scale > 1) {
        return {...prevSelectedImage, path: prevSelectedImage.pathXXL};
      } else {
        return {...prevSelectedImage, path: prevSelectedImage.pathL};
      }
    });
  }, [images, scale]);

  const scrollThumbnails = (direction: 'left' | 'right', increment: number) => {
    if (direction === 'left') {
      if (currentSelectedImageIndexOnGalleria > 0) {
        if (currentSelectedImageIndexOnGalleria - increment < 0) {
          handleThumbnailClick(imagesOnGalleria[0], 0);
        } else {
          handleThumbnailClick(imagesOnGalleria[currentSelectedImageIndexOnGalleria - increment], currentSelectedImageIndexOnGalleria - increment);
        }
      }
    } else { 
      if (currentSelectedImageIndexOnGalleria + increment >= imagesOnGalleria.length) {
        handleThumbnailClick(imagesOnGalleria[imagesOnGalleria.length - 1], imagesOnGalleria.length - 1);
      } else if (currentSelectedImageIndexOnGalleria < imagesOnGalleria.length - increment && currentSelectedImageIndexOnGalleria + increment < imagesOnGalleria.length) {
        handleThumbnailClick(imagesOnGalleria[currentSelectedImageIndexOnGalleria + increment], currentSelectedImageIndexOnGalleria + increment);
      }
    }
  };

  const centerThumbnail = (index: number) => {
    if (thumbnailReelRef.current) {
      const reelWidth = thumbnailReelRef.current.clientWidth;
      let cumulativeWidth = 0;
      const thumbnailExterior = 16;
      for (let i = 0; i < index; i++) {
        if (images[i].isDeleted) {
          index++;
          continue;
        }
        const children = Array.from(thumbnailReelRef.current.children)
        const child = children.find(
          (child) => {
            return Number(child.id) === i
          }
        ) as HTMLElement;

        if (child) {
          cumulativeWidth += child.clientWidth + thumbnailExterior;
        }
      }
      const child = Array.from(thumbnailReelRef.current.children).find(
        (child) => Number(child.id) === index
      ) as HTMLElement;

      if (child) {
        const thumbnailWidth = child.clientWidth + thumbnailExterior;
        const scrollPosition = cumulativeWidth - reelWidth / 2 + thumbnailWidth / 2;
        thumbnailReelRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  };

  const handleThumbnailClick = (image: any, index: number) => {
    setSelectedImage(image);
    setCurrentSelectedImage(image.id);
    centerThumbnail(index);
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
    if (e.type !== 'touchstart') e.preventDefault();
    const reel = thumbnailReelRef.current;
    if (reel) {
      reel.style.cursor = 'grabbing';
      reel.style.userSelect = 'none';
      const startX = e.pageX || e.touches[0].pageX;
      const scrollLeft = reel.scrollLeft;
      let velocity = 0;
      let lastX = startX;

      // Cancel any ongoing animation
      if (animationFrameId) {
        console.log('Canceling animation frame');
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const x = (moveEvent instanceof MouseEvent ? moveEvent.pageX : moveEvent.touches[0].pageX) - startX;
        if (Math.abs(x) > 20) { // Only move if the mouse move is more than 20 pixels
          setIsDraggingReel(true);
          velocity = (moveEvent instanceof MouseEvent ? moveEvent.pageX : moveEvent.touches[0].pageX) - lastX;
          lastX = moveEvent instanceof MouseEvent ? moveEvent.pageX : moveEvent.touches[0].pageX;
          reel.scrollLeft = scrollLeft - x;
        }
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
            animationFrameId = requestAnimationFrame(continueDragging);
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
  }

  const handleThumbnailMouseEnter = (e: any) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.transform = 'scale(1)';

    if (Number(target.id) !== selectedImage.id) {
      target.style.border = '4px solid grey';
    }
  }

  const handleThumbnailMouseLeave = (e: any) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.transform = 'scale(1)';
    setTimeout(() => {
      if (Number(target.id) !== selectedImage.id) { //get image index from the target element and compare with currentSelectedImageIndex
        target.style.border = `4px solid ${imagesOnGalleria.find(img => img.id === Number(target.id))?.isKept ? 'rgb(150, 255, 175)' : 'rgba(0, 0, 0, 0.70)'}`;
      }
    }, 300); // Delay border change to match the transition duration
  }

  const handleSelectedImageOnWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    const img = e.currentTarget as HTMLImageElement;
    // const rect = img.getBoundingClientRect();
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
      let nextImage;
      if (index === imagesOnGalleria.at(-1)?.id) {
        nextImage = imagesOnGalleria[imagesOnGalleria.findIndex((img) => img.id === image.id) -1]
        if (nextImage) {
          currentSelectedImageIndex = index - 1;
          setCurrentSelectedImage(nextImage.id);
          setSelectedImage(nextImage);
        }
      } else {
        nextImage = imagesOnGalleria[imagesOnGalleria.findIndex((img) => img.id === image.id) + 1]
          currentSelectedImageIndex = index;
          setCurrentSelectedImage(nextImage.id);
          setSelectedImage(image);
      }
    }
  }
  
  const handleThumbnailImageClick = (image: any, index: any) => {
    if (!isDraggingReel) {
      handleThumbnailClick(image, index)
    }
  }

  const handleImageLoad = (index: number) => {
    loadedImageCount++;
    if (loadedImageCount === imagesOnGalleria.length - deletedImageCount) {
      setLoading(false);
    }
  };

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
      <button
        className="position-absolute top-0 end-0 m-4 btn"
        style={{ zIndex: '2' }}
        aria-label="Close" 
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onClick={handleGalleriaClose}
      >
        <i className="bi bi-x text-secondary" style={{ fontSize: '3em' }}></i>
      </button>
      <div className='row h-25 mt-8'>
        <div className='col' onMouseDown={handleSelectedImageOnMouseDown}>
          <img 
            id={`image-${getCurrentSelectedImage().id}`}
            src={selectedImage.path} 
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
          />
        </div>
      </div>
      <div id="reel" className="row position-absolute bottom-0 start-50 translate-middle-x m-0 my-4" style={{ width: '100%' }}>
        <div className="container">
          <div className="row justify-content-center">
            <button className={`col-1 btn py-1.5 my-2 fs-3 me-auto no-focus-border ${getCurrentSelectedImage().id === 0 ? 'disabled' : ''}`}              
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              onClick={() => scrollThumbnails('left', 10)}>
              <i className="pi bi-arrow-left-circle-fill text-secondary"></i>
            </button>
            <button className={`nav-button col-1 btn py-1.5 my-2 d-flex justify-content-center align-items-center ${getCurrentSelectedImage().id === 0 ? 'disabled' : ''}`}            
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
                handleDeleteOnClickOnGalleria(e, currentSelectedImageOnGalleria, currentSelectedImageIndex, e.currentTarget.querySelector(`i#delete-icon-${currentSelectedImageOnGalleria.id}`));
              }}
              onTouchEnd={(e) => {
                handleDeleteOnClickOnGalleria(e, currentSelectedImageOnGalleria, currentSelectedImageIndex, e.currentTarget.querySelector(`i#delete-icon-${currentSelectedImageOnGalleria.id}`));
              }}>
                <i 
                id={`delete-icon-${currentSelectedImageOnGalleria.id}`}
                style={{
                  fontSize: '3vh'
                }}
                className={`bi bi-trash3-fill pointer${currentSelectedImageOnGalleria.deleteClickedOnce ? ' clicked-red' : ''}`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title='DELETE'
                ></i>
            </button>
            <div className="col-1 align-self-center ml-2 d-flex justify-content-center align-items-center form-check form-switch p-0"
              style={{ height: '8vh', width: '8vh' }}>
              <input className="form-check-input m-0"
                style={{
                  width: '6vh',
                  height: '6vh',
                }} 
                type="checkbox" 
                id="flexSwitchCheckDefault" 
                checked={isAutoNextOn} 
                onChange={() => setIsAutoNextOn(!isAutoNextOn)} 
                title='AUTO NEXT'
              />
            </div>
            <button
              id={`keep-button-${currentSelectedImageOnGalleria.id}`}
              type="button"
              style={{ height: '8vh', width: '8vh'}}
              className="keep-btn col-1 btn btn-dark align-self-center ml-2"
              disabled={isKeepButtonDisabled}
              onMouseUp={(e) => {
                handleKeepOnClick(e, currentSelectedImageOnGalleria) &&
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
                className={`bi ${currentSelectedImageOnGalleria.isKept ? 'bi-bag-dash-fill' : 'bi-bag-plus-fill'} pointer${currentSelectedImageOnGalleria.isKept ? ' clicked-green' : ''}`}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title={`${currentSelectedImageOnGalleria.isKept ? 'UNKEEP' : 'KEEP'}`}
              ></i>
            </button>
            <button className={`nav-button col-1 btn py-1.5 my-2 d-flex justify-content-center align-items-center ${currentSelectedImageIndexOnGalleria === imagesOnGalleria.length - 1 ? 'disabled' : ''}`}       
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              onClick={() => scrollThumbnails('right', 1)}>
                <i className="bi bi-chevron-compact-right text-secondary" style={{ fontSize: '3em' }}></i>
            </button>
            <button className={`col-1 btn py-1.5 my-2 fs-3 ms-auto ${currentSelectedImageIndexOnGalleria === imagesOnGalleria.length - 1 ? 'disabled' : ''}`}           
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
              {imagesOnGalleria.map((image, index) => !image['isDeleted'] && (
                <img
                  id={image.id}
                  key={index}
                  src={image.path}
                  alt={`Thumbnail ${index}`}
                  className="thumbnail mx-1 cursor-pointer"
                  onClick={() => handleThumbnailImageClick(image, index)}
                  style={{ 
                    border: image.id === currentSelectedImageOnGalleria.id ? '4px solid deeppink' : image.isKept ? '4px solid rgb(150, 255, 175)' : '4px solid rgba(0, 0, 0, 0.70)',
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease-in-out, border 0.3s ease-in-out'
                  }}
                  onMouseEnter={handleThumbnailMouseEnter}
                  onMouseLeave={handleThumbnailMouseLeave}
                  onLoad={() => handleImageLoad(index)} // Add this line
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>)</>
  );
};

export default PhotoGalleria;