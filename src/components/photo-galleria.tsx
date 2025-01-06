import React, { useState, useRef, useEffect } from 'react';
import '../styles/photo-galleria.css'; // Import the CSS file

interface PhotoGalleriaProps {
  images: any[];
  setIsGalleriaClosed: React.Dispatch<React.SetStateAction<boolean | null>>;
  setCurrentSelectedImage: React.Dispatch<React.SetStateAction<number | null>>;
  currentSelectedImage: number | null;
}

const PhotoGalleria: React.FC<PhotoGalleriaProps> = ({ images, setIsGalleriaClosed, setCurrentSelectedImage, currentSelectedImage}) => {
  const currentSelectedImageOnGalleria = currentSelectedImage || 0;
  const [selectedImage, setSelectedImage] = useState<string>(images[currentSelectedImageOnGalleria].path);
  const [isDraggingReel, setIsDraggingReel] = useState<boolean>(false);
  const thumbnailReelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const container = document.querySelector('.container-fluid') as HTMLDivElement;
    if (container) {
      container.style.transition = 'opacity 0.15s ease-in-out';
      setTimeout(() => {
        container.style.opacity = '1';
      }, 150);
    }
    if (currentSelectedImage === null) {
      setCurrentSelectedImage(0);
    }
    centerThumbnail(currentSelectedImageOnGalleria);
  }, []);

  const handleThumbnailClick = (path: string, index: number) => {
    setSelectedImage(path);
    setCurrentSelectedImage(index);
    centerThumbnail(index);
  };

  const scrollThumbnails = (direction: 'left' | 'right', increment: number) => {
    if ( direction === 'left' ) {
      if (currentSelectedImageOnGalleria > 0) {
        if (currentSelectedImageOnGalleria - increment < 0) {
          setCurrentSelectedImage(0);
          handleThumbnailClick(images[0].path, 0);
        } else {
          setCurrentSelectedImage(currentSelectedImageOnGalleria - increment);
          handleThumbnailClick(images[currentSelectedImageOnGalleria - increment].path, currentSelectedImageOnGalleria - increment);
        }
      }
    } else { 
      if (currentSelectedImageOnGalleria + increment >= images.length) {
        setCurrentSelectedImage(images.length - 1);
        handleThumbnailClick(images[images.length - 1].path, images.length - 1);
      } else if (currentSelectedImageOnGalleria < images.length - increment && currentSelectedImageOnGalleria + increment < images.length) {
        setCurrentSelectedImage(currentSelectedImageOnGalleria + increment);
        handleThumbnailClick(images[currentSelectedImageOnGalleria + increment].path, currentSelectedImageOnGalleria + increment);
      }
    }
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

  return (
    <div className="container-fluid position-absolute vh-100 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50 p-0" 
      style={{ zIndex: 9999, backdropFilter: 'blur(10px)', opacity: 0 }}>
      <button
        className="position-absolute top-0 end-0 m-4 btn"
        aria-label="Close" 
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onClick={() => {
          const container = document.querySelector('.container-fluid') as HTMLDivElement;
          if (container) {
              container.style.transition = 'opacity 0.2s ease-out';
              container.style.opacity = '0';
              setTimeout(() => {
                setIsGalleriaClosed(true);
              }, 200);
          }
          console.log('Close button clicked');
          }}
      >
        <i className="bi bi-x text-secondary" style={{ fontSize: '3em' }}></i>
      </button>

      <button className="col nav-button left btn rounded-circle w-1 d-inline-block position-fixed start-0 me-3"                
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onClick={() => scrollThumbnails('left', 1)}>
          <i className="bi bi-chevron-compact-left text-secondary" style={{ fontSize: '3em' }}></i>
      </button>
      <div className="row">
        <img src={selectedImage} 
        alt="Selected" 
        className="col p-0" 
        style={{ minWidth:'50vh', maxWidth: '70vw', minHeight: '50vh', maxHeight: '70vh', border: '15px solid rgba(0, 0, 0, 0.70)' }}/>
      </div>
      <button className="col nav-button right btn rounded-circle w-1 d-inline-block position-fixed end-0 me-3"           
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onClick={() => scrollThumbnails('right', 1)}>
          <i className="bi bi-chevron-compact-right text-secondary" style={{ fontSize: '3em' }}></i>
      </button>

      <div className="row position-absolute bottom-0 start-50 translate-middle-x m-0 my-4" style={{ width: '100%' }}>
        <button className="col nav-button left btn rounded-circle w-50 d-inline-block"              
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
          onClick={() => scrollThumbnails('left', 10)}>
          <i className="pi bi-arrow-left-circle-fill text-secondary"></i>
        </button>
        <div 
          className="col-10 d-flex overflow-hidden thumbnail-reel p-0" 
          ref={thumbnailReelRef}
          onMouseDown={(e) => {
            e.preventDefault();
            const reel = thumbnailReelRef.current;
            if (reel) {
              reel.style.cursor = 'grabbing';
              reel.style.userSelect = 'none';
              const startX = e.pageX;
              const scrollLeft = reel.scrollLeft;

              const onMouseMove = (moveEvent: MouseEvent) => {
                setIsDraggingReel(true);
                const x = moveEvent.pageX - startX;
                reel.scrollLeft = scrollLeft - x;
              };

              const onMouseUp = () => {
                reel.style.cursor = 'grab';
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                setTimeout(() => setIsDraggingReel(false), 0); // Delay to ensure click event is not triggered
              };

              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }
          }}
          onMouseEnter={(e) => {
            const reel = thumbnailReelRef.current;
            if (reel) {
              reel.style.cursor = 'grab';
            }
          }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image.path}
              alt={`Thumbnail ${index}`}
              className="thumbnail mx-1 cursor-pointer"
              onClick={() => {
                if (!isDraggingReel) {
                  handleThumbnailClick(image.path, index)
                }
              }}
              style={{ 
                border: index === currentSelectedImage ? '4px solid deeppink' : '4px solid rgba(0, 0, 0, 0.70)',
                transform: 'scale(1)',
                transition: 'transform 0.3s ease-in-out, border 0.3s ease-in-out',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.transform = 'scale(1)';
                target.style.zIndex = '10';
                if (selectedImage !== target.src) {
                  target.style.border = '4px solid grey';
                }
              }}
              onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.transform = 'scale(1)';
              target.style.zIndex = '0';
              setTimeout(() => {
                if (selectedImage !== target.src) {
                  target.style.border = '4px solid rgba(0, 0, 0, 0.70)';
                }
              }, 300); // Delay border change to match the transition duration
              }}
            />
          ))}
        </div>
        <button className="col nav-button right btn rounded-circle w-50 d-inline-block"           
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
          onClick={() => scrollThumbnails('right', 10)}>
          <i className="pi bi-arrow-right-circle-fill text-secondary"></i>
        </button>
      </div>
    </div>
  );
};

export default PhotoGalleria;