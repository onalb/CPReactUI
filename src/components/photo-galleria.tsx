import React, { useState, useRef, useEffect } from 'react';
import '../styles/photo-galleria.css'; // Import the CSS file

interface PhotoGalleriaProps {
  images: any[];
  setIsGalleriaClosed: React.Dispatch<React.SetStateAction<boolean>>;
}

const PhotoGalleria: React.FC<PhotoGalleriaProps> = ({ images, setIsGalleriaClosed }) => {
  const [selectedImage, setSelectedImage] = useState<string>(images[0].path);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const thumbnailReelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const container = document.querySelector('.container-fluid') as HTMLDivElement;
    if (container) {
      container.style.transition = 'opacity 0.15s ease-in-out';
      setTimeout(() => {
        container.style.opacity = '1';
      }, 150);
    }
  }, []);

  const handleThumbnailClick = (path: string, index: number) => {
    setSelectedImage(path);
    setSelectedIndex(index);
    centerThumbnail(index);
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if ( direction === 'left' ) {
      if (selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
        handleThumbnailClick(images[selectedIndex - 1].path, selectedIndex - 1);
      }
    } else { 
      if (selectedIndex < images.length - 1) {
        setSelectedIndex(selectedIndex + 1);
        handleThumbnailClick(images[selectedIndex + 1].path, selectedIndex + 1);
      }
    }
  };

  const centerThumbnail = (index: number) => {
    if (thumbnailReelRef.current) {
      const reelWidth = thumbnailReelRef.current.clientWidth;
      let cumulativeWidth = 0;
      for (let i = 0; i < index; i++) {
        cumulativeWidth += thumbnailReelRef.current.children[i].clientWidth + 10;
      }
      const thumbnailWidth = thumbnailReelRef.current.children[index].clientWidth + 10;
      const scrollPosition = cumulativeWidth - reelWidth / 2 + thumbnailWidth / 2;
      thumbnailReelRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="container-fluid position-absolute vh-100 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50 p-0" 
      style={{ zIndex: 9999, backdropFilter: 'blur(10px)', opacity: 0 }}>
        <button 
          className="btn-close btn-close-white position-absolute top-0 end-0 m-4"
          aria-label="Close" 
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'scale(1.3)';
              target.classList.add('text-white');
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'scale(1)';
            target.style.zIndex = '0';
            setTimeout(() => {
              target.querySelector('i')!.classList.remove('text-white');
            }, 100); // Delay border change to match the transition duration
          }} 
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
        </button>

        <button className="col nav-button left btn rounded-circle w-1 d-inline-block position-fixed start-0 me-3"           
          style={{ 
            transition: 'transform 0.3s ease-in-out',
          }}      
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'scale(1.3)';
              target.querySelector('i')!.classList.add('text-white');
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'scale(1)';
            target.style.zIndex = '0';
            setTimeout(() => {
              target.querySelector('i')!.classList.remove('text-white');
            }, 100); // Delay border change to match the transition duration
          }} 
          onClick={() => scrollThumbnails('left')}>
            <i className="bi bi-chevron-compact-left text-secondary" style={{ fontSize: '3em' }}></i>
        </button>
      
      <div className="row">
        <img src={selectedImage} alt="Selected" className="col p-0" style={{ minWidth:'50vh', maxWidth: '70vw', minHeight: '50vh', maxHeight: '70vh', border: '15px solid rgba(0, 0, 0, 0.70)' }}/>
      </div>
      <div className="row position-absolute bottom-0 start-50 translate-middle-x m-0 my-4" style={{ width: '100%' }}>
      <button className="col nav-button left btn rounded-circle w-50 d-inline-block"           
                style={{ 
                  transition: 'transform 0.3s ease-in-out'
                }}      
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.transform = 'scale(1.3)';
                    target.querySelector('i')!.classList.add('text-white');
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.transform = 'scale(1)';
                  target.style.zIndex = '0';
                  setTimeout(() => {
                    target.querySelector('i')!.classList.remove('text-white');
                  }, 100); // Delay border change to match the transition duration
                }} onClick={() => scrollThumbnails('left')}>
          <i className="pi pi-chevron-circle-left text-secondary"></i>
        </button>
        <div className="col-10 d-flex overflow-hidden thumbnail-reel p-0" ref={thumbnailReelRef}>
            {images.map((image, index) => (
              <img
                key={index}
                src={image.path}
                alt={`Thumbnail ${index}`}
                className="thumbnail mx-1 cursor-pointer"
                onClick={() => handleThumbnailClick(image.path, index)}
                style={{ 
                  border: index === selectedIndex ? '4px solid deeppink' : '4px solid rgba(0, 0, 0, 0.70)',
                  transform: 'scale(1)',
                  transition: 'transform 0.3s ease-in-out, border 0.3s ease-in-out'
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
                style={{ 
                  transition: 'transform 0.3s ease-in-out'
                }}      
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.transform = 'scale(1.3)';
                    target.querySelector('i')!.classList.add('text-white');
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.transform = 'scale(1)';
                  target.style.zIndex = '0';
                  setTimeout(() => {
                    target.querySelector('i')!.classList.remove('text-white');
                  }, 100); // Delay border change to match the transition duration
                }} onClick={() => scrollThumbnails('right')}>
          <i className="pi pi-chevron-circle-right text-secondary"></i>
        </button>
      </div>

      <button className="col nav-button right btn rounded-circle w-1 d-inline-block position-fixed end-0 me-3"           
          style={{ 
            transition: 'transform 0.3s ease-in-out'
          }}      
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'scale(1.3)';
              target.querySelector('i')!.classList.add('text-white');
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'scale(1)';
            target.style.zIndex = '0';
            setTimeout(() => {
              target.querySelector('i')!.classList.remove('text-white');
            }, 100); // Delay border change to match the transition duration
          }} onClick={() => scrollThumbnails('right')}>
            <i className="bi bi-chevron-compact-right text-secondary" style={{ fontSize: '3em' }}></i>
        </button>
    </div>
  );
};

export default PhotoGalleria;