import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { pictures } from './pictures';
import '../styles/ImageZoom.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createParticles } from './create-particles';
import applyMouseAndTouchEvents from './mouse-and-touch-events';
import { addTrackedEventListener, removeTrackedEventListeners } from './tracked-event-handler';
import  { startTimer, stopTimer} from './timer-functions';
import PhotoGalleria from './photo-galleria';
import ModalPopup from './model-popup';
import axios from 'axios';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import path from 'path';

const ImageGrid: React.FC = () => {
  const { isOpenOnlyKept } = useParams<{ isOpenOnlyKept: string }>();
  //User Editable Paramters
  const numberOfColumns = 5;

  // Constants
  const padding = 10;
  const columnGap = 2;
  const defaultRowHeight = 300;

  // States
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\25 Strasbourg train');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\22 italy');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\24 Boston');
  const [images, setImages] = useState([] as any[]);
  const [zoomScale, setZoomScale] = useState(1);
  const [prevZoomScale, setPrevZoomScale] = useState(1);
  const [zoomStop, setZoomStop] = useState(2);
  const [firstRowWidth, setFirstRowWidth] = useState<number>(0); // Initial transform-origin
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [currentSelectedImageId, setCurrentSelectedImageId] = useState<number | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [isGalleriaClosed, setIsGalleriaClosed] = useState<boolean | null>(null);
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState<boolean>(false);
  const [visibleImages, setVisibleImages] = useState([] as any[]);
  const squareRef = useRef<HTMLDivElement | null>(null);
  const imageHeight = Math.floor(zoomScale * 300);
  let numberOfKeptImages = images.filter(image => image.isKept).length;

  // Side Effects
  useEffect(() => {
    async function fetchData() {
        await axios.get(
            "http://localhost:3080/api/photoList?folder=" + folder
        ).then((res: any) => {
          let images: any = [];
          res.data.map((photo: any, i: any) => {
            const image: any = {};
            image['id'] = i;
            image['path'] = `http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}&height=${imageHeight}`;
            image['fileName'] = photo.name;
            image['height'] = photo.dimensions.height;
            image['width'] = photo.dimensions.width;
            image['isKept'] = false;
            image['deleteClickedOnce'] = false;

              if (isOpenOnlyKept === 'true') {
                if (image.isKept) images.push(image);
              } else {
                images.push(image);
              }

          });

          setImages(images)
        })
        .catch((e: any)=>{
            console.log(e)
        });
    }

    if (folder) {
        try {
            fetchData()
        } catch(e) {
            console.log(e)
        }
    }
  }, [folder]);

  useEffect(() => {

  }, [zoomScale])

  useEffect(() => {
    setImages((prevImages) => {
      console.log('zoomScale', zoomScale);
      console.log('prevZoomScale', prevZoomScale);
      console.log('zoomStop', zoomStop);

      // This means zooming out
      if (zoomScale < prevZoomScale && Math.ceil(zoomScale) < zoomStop) {
        setZoomStop(Math.ceil(zoomScale));
        return prevImages.map((image) => {
          if (visibleImages.some(visibleImage => visibleImage.id === 'image-' + image.id)) {
            console.log('visibleImage:');
            return {
              ...image,
              path: `http://localhost:3080/api/photos?folder=${folder}&image=${image.fileName}&height=${imageHeight}`
            };
          }
          return image;
        });
      }

      setPrevZoomScale(zoomScale);

      if (Math.ceil(zoomScale) > zoomStop) {
        setZoomStop(Math.ceil(zoomScale));
        return prevImages.map((image) => {
          if (visibleImages.some(visibleImage => visibleImage.id === 'image-' + image.id)) {
            console.log('visibleImage:');
            return {
              ...image,
              path: `http://localhost:3080/api/photos?folder=${folder}&image=${image.fileName}&height=${imageHeight}`
            };
          }
          return image;
        });
      }
      return [...prevImages];
    });
  }, [visibleImages]);

  useEffect(() => {
    addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
    addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);

    const cleanup = applyMouseAndTouchEvents(
      setZoomScale, 
      setIsDragging, 
      setIsZooming, 
      setIsLongTouch, 
      setVisibleImages,
      squareRef, 
      handleMouseUp, 
      squareSelection);
    return cleanup;
  }, []);

  useEffect(() => {
    console.log('selectedImageIds:', selectedImageIds);
  }, [selectedImageIds]);

  useEffect(() => {
    numberOfKeptImages = images.filter(image => image.isKept).length;
    if (images.length > 0) setFirstRowWidth(calculateFirstRowWidth());
  }, [images]);

  useEffect(() => {
    if (isGalleriaClosed) {
      addTrackedEventListener(window, 'click', handleClickOutside);
      addTrackedEventListener(window, 'touchend', handleClickOutside);
      const cleanup = applyMouseAndTouchEvents(
        setZoomScale, 
        setIsDragging, 
        setIsZooming, 
        setIsLongTouch,
        setVisibleImages,
        squareRef, 
        handleMouseUp, 
        squareSelection);
        addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
        addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);
      return cleanup;
    } else if (isGalleriaClosed === false) {
      removeTrackedEventListeners(window, 'mousedown');
      removeTrackedEventListeners(window, 'mousemove');
      removeTrackedEventListeners(window, 'mouseup');
      removeTrackedEventListeners(window, 'wheel');
      removeTrackedEventListeners(window, 'touchstart');
      removeTrackedEventListeners(window, 'touchmove');
      removeTrackedEventListeners(window, 'touchend');
      removeTrackedEventListeners(window, 'click');
    }

    return () => {
      removeTrackedEventListeners(window, 'keyup');
      removeTrackedEventListeners(window, 'keydown');
    };
  }, [setIsGalleriaClosed, isGalleriaClosed]);

  useEffect(() => {
    addTrackedEventListener(window, 'click', handleClickOutside);
    addTrackedEventListener(window, 'touchend', handleClickOutside);
    return () => {
      removeTrackedEventListeners(window, 'click');
      // removeTrackedEventListeners(window,'touchend');
    };
  }, [isDragging, isLongTouch]);

  // Functions
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

  const openGalleria = (event: any) => {
    event.preventDefault();
    setIsGalleriaClosed(false);
  }

  const updateImages = (images: any[]) => {
    // Here we will make a call to DB. 
    // If the call is successful, we will keep the state as updated if wrong we will invalidate the query for images.
  }

  const squareSelection = (event: any) => {
    const square = document.createElement('div');
    square.id = 'mouse-square';
    square.style.left = `${event.clientX}px`;
    square.style.top = `${event.clientY}px`;
    square.onmousemove = (e) => handleMouseMove(e, { x: event.clientX, y: event.clientY });
    squareRef.current = square;
    document.body.appendChild(square);
  }

  // User-Event handlers
  const handleKeyDown = (event: any) => {
    console.log('Key pressed:', event.key);
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      selectAllImages();
    }

    if (event.ctrlKey && event.key === 'g') {
      openGalleria(event);
    }
    
    if (event.key === 'Escape') {
      console.log(isGalleriaClosed);
      if(!isGalleriaClosed) {
        const container = document.querySelector('.photo-galleria') as HTMLDivElement;
        if (container) {
            container.style.transition = 'opacity 0.2s ease-out';
            container.style.opacity = '0';
            setTimeout(() => {
            setIsGalleriaClosed(true);
            console.log('Close button clicked');
            }, 200);
        }
      } else {
        setSelectedImageIds([]);
        setCurrentSelectedImageId(null);
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      if (squareRef.current) {
        document.body.removeChild(squareRef.current);
        squareRef.current = null;
      }
    }
  };

  const handleClickOutside = (event: any) => {
    if (!event.ctrlKey && !isDragging && !isLongTouch && ((event.pointerType && event.pointerType === 'mouse') || (event.type === 'touchend'))) {
      const target = event.target as HTMLElement;
      if (target.tagName !== 'IMG' && target.tagName !== 'BUTTON' && target.tagName !== 'I' && !target.classList.contains('no-selection-removal-on-click')) {
        setSelectedImageIds([]);
        setCurrentSelectedImageId(null);
      }
    };
  };

  const handleImageClick = (imageId: number, index: number, event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !isZooming) {
      if (event.shiftKey && currentSelectedImageId !== null) {
        const start = Math.min(currentSelectedImageId, index);
        const end = Math.max(currentSelectedImageId, index);
        const newSelectedImageIds = images.slice(start, end + 1).map(img => img.id);
        setSelectedImageIds(prevIds => Array.from(new Set([...prevIds, ...newSelectedImageIds])));
        setCurrentSelectedImageId(index);
      } else if (event.shiftKey && currentSelectedImageId === null) {
        setCurrentSelectedImageId(index);
        setSelectedImageIds(prevIds =>  [...prevIds, imageId]);
      } else {
        if (currentSelectedImageId === index || selectedImageIds.includes(imageId)) {
          setCurrentSelectedImageId(null);
        } else {
          setCurrentSelectedImageId(index);
        }

        setSelectedImageIds(prevIds =>
          prevIds.includes(imageId)
            ? prevIds.filter(id => id !== imageId) // Deselect if already selected
            : [...prevIds, imageId] // Select if not already selected
        );
      }
    }
  };

  const handleKeepOnClick = (e: any, image: any) => {
    if (isZooming) return false;
    const isKept: boolean = image.isKept ? false : true;
    const updatedImage = { ...image, isKept };
    const updatedImages: any[] = images.map(img => img.id === updatedImage.id ? updatedImage : img);

    setImages(updatedImages);
    updateImages(updatedImages);

    if (!image.isKept) {
      createParticles(e.clientX, e.clientY, zoomScale, 'keep');
    }

    return true;
  }

  const handleDeleteOnClick = (e: any, image: any, index: number, deleteIcon: any) => {
    if (isZooming) return false;
    if (deleteIcon) {
      if(!image.deleteClickedOnce) {
        image.deleteClickedOnce = true;
        setImages(images.map(img => img.id === image.id ? image : img)); // updates the deleteClickedOnce property of the current image
        startTimer(image, setImages);
        return false;
      } else {
        stopTimer(image);
        setImages(images.filter(img => img.id !== image.id)); // removes the deleted image from the array
        createParticles(e.clientX, e.clientY, zoomScale, 'delete');
        setSelectedImageIds(prevIds => prevIds.filter(id => id !== image.id));
        setCurrentSelectedImageId((prevIndex: number | null) => { 
           if (prevIndex === index || prevIndex === null) {
             return null;
           } else if (prevIndex! > index) {
             return prevIndex - 1;
           } else {
              return prevIndex + 1;
           }
        });

        if (currentSelectedImageId === images.findIndex(img => img.id === image.id)) {
          setCurrentSelectedImageId(null);
        }
        return true;
      }
    }
    return false;
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.ctrlKey && event.button === 0) { // Right mouse button
      setStartPoint({ x: event.clientX, y: event.clientY });
      squareSelection(event);
    }
  };

  const handleMouseMove = (event: React.MouseEvent | MouseEvent, startPoint: any) => {
    if (startPoint && squareRef.current) {
      const width = event.clientX - startPoint.x;
      const height = event.clientY - startPoint.y;
      squareRef.current.style.width = `${Math.abs(width)}px`;
      squareRef.current.style.height = `${Math.abs(height)}px`;
      squareRef.current.style.left = `${Math.min(event.clientX, startPoint.x)}px`;
      squareRef.current.style.top = `${Math.min(event.clientY, startPoint.y)}px`;
    }
  };

  const handleMouseUp = () => {
    if (squareRef.current) {
      const squareRect = squareRef.current.getBoundingClientRect();
      const isAClick = squareRect.right - squareRect.left === 4 && squareRect.bottom - squareRect.top === 4;
      const deselectedImages: number[] = [];
      const newSelectedImageIds = images.filter(image => {
        const index = images.findIndex(img => img.id === image.id);
        const imageElement = document.getElementById(`image-${image.id}`);

        if (imageElement) {
          const imageRect = imageElement.getBoundingClientRect();
          const isIntersecting = (
            squareRect.left < imageRect.right &&
            squareRect.right > imageRect.left &&
            squareRect.top < imageRect.bottom &&
            squareRect.bottom > imageRect.top
          );

          if (isIntersecting) {
            if (isAClick && selectedImageIds.includes(image.id) && currentSelectedImageId === index) {
              setCurrentSelectedImageId(null);
              deselectedImages.push(image.id);
              return false;
            } else if (isAClick && selectedImageIds.includes(image.id) && currentSelectedImageId !== index) {
              deselectedImages.push(image.id);
              return false;
            } else {
              setCurrentSelectedImageId(index);
            }

            return true;
          }
        }
        return false;
      }).map(image => image.id);
      
      setSelectedImageIds(prevIds => Array.from(new Set([...prevIds, ...newSelectedImageIds])).filter(id => !deselectedImages.includes(id)));
      document.body.removeChild(squareRef.current);
      squareRef.current = null;
    }
  };

  const handleMouseEnterHeader = (e: any) => {
    e.currentTarget.style.transform = 'translateY(0%)';
    e.currentTarget.style.backgroundColor = 'rgba(32, 32, 32, .8)';
    const headerHandle: HTMLElement = document.querySelector('.header-handle') as HTMLElement;
    if (headerHandle) (headerHandle).style.backgroundColor = 'rgba(32, 32, 32, .8)';
  };

  const handleMouseLeaveHeader = (e: any) => {
    e.currentTarget.style.transform = 'translateY(-90%)';
    e.currentTarget.style.backgroundColor = 'rgba(32, 32, 32, .9)';
    const headerHandle: HTMLElement = document.querySelector('.header-handle') as HTMLElement;
    if (headerHandle) (headerHandle).style.backgroundColor = 'rgba(32, 32, 32, .9)';
  };

  const handleDeleteImages = () => {
    const updatedImages = images.filter(image => !selectedImageIds.includes(image.id) || image.isKept);
    setImages(updatedImages);
    setSelectedImageIds([]);
    setCurrentSelectedImageId((prevIndex: number | null) => {
      return null;
  })};

  const openKeptOnNewTab = () => {
    window.open('http://localhost:3000/true', '_blank'); // fix
  }

  const selectAllImages = () => {
    setSelectedImageIds(images.map(img => img.id))
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  return (
    <>
    <div
      className='header position-absolute vh-10 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center p-0'
      style={{
        backgroundColor: 'rgba(32, 32, 32, .9)',
        width: '100%',
        height: '100px',
        position: 'absolute',
        zIndex: 2,
        transition: 'transform 0.3s ease-in-out, background-color 0.3s ease', 
        transform: 'translateY(-90%)',
      }}
      onMouseEnter={handleMouseEnterHeader}
      onMouseLeave={handleMouseLeaveHeader}
    >
      <div
        className='header-handle'
        style={{
          width: '150px',
          height: '25px',
          borderBottomLeftRadius: '400px',
          borderBottomRightRadius: '400px',
          borderBottomWidth: '2px', 
          borderBottomColor: 'rgba(250, 250, 250, 1)',
          backgroundColor: 'rgba(32, 32, 32, .9)',
          position: 'absolute',
          left: '85%',
          bottom: '-25px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      ></div>
      <div className='row align-self-center w-100'>
        <div className='col-8 d-flex align-items-center' 
          style={{ justifyContent: 'flex-start' }}>
          <div
            className='px-3'
            style={{
              display: 'flex', fontSize: '25px', color: 'white', 
              transition: 'color 0.3s ease, background-color 0.3s ease',
              textAlign: 'center', // Center horizontally
              height: '100%', // Make height as much as the parent
              alignItems: 'center', // Center vertically
              justifyContent: 'center' // Center horizontally
            }}
            data-bs-placement="top"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            >
            SELECT FOLDER
          </div>
        </div>
        <div className='col-1 d-flex justify-content-center align-items-center'
          onClick={openGalleria}>
          <i
          className={`col bi bi-tv`}
          style={{        
            display: 'block', fontSize: '45px', color: 'white',
            transition: 'color 0.3s ease, background-color 0.3s ease',
            textAlign: 'center',
          }}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title='SELECT ALL'
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          ></i>
        </div>
        <div className='col-1 d-flex justify-content-center align-items-center'
          onClick={() => selectAllImages()}>
          <i
          className={`col bi bi-check2-all`}
          style={{        
            display: 'block', fontSize: '45px', color: 'white',
            transition: 'color 0.3s ease, background-color 0.3s ease',
            textAlign: 'center',
          }}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title='SELECT ALL'
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          ></i>
        </div>
        <div 
          className='col-1 d-flex justify-content-center align-items-center'
          style={{ pointerEvents: `${selectedImageIds.length > 0 ? 'auto' : 'none'}` }}
          onClick={() => setIsDeletePopupVisible(true)}
          data-toggle="modal" data-target="#exampleModalCenter">
          <i
          className={`col bi bi-trash3-fill`}
          style={{        
            display: 'block', fontSize: '45px', color: `${selectedImageIds.length > 0 ? 'white' : 'gray'}`,
            transition: 'color 0.3s ease, background-color 0.3s ease',
            textAlign: 'center',
          }}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title='DELETE SELECTED'
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          ></i>
        </div>
        <div className='col-1 d-flex justify-content-center align-items-center'
          style={{ pointerEvents: `${numberOfKeptImages > 0 ? 'auto' : 'none'}` }}
          onClick={() => openKeptOnNewTab()}>
          <i
          className={`col bi bi-bag-check`}
          style={{        
            fontSize: '45px', 
            color: `${numberOfKeptImages > 0 ? 'white' : 'gray'}`,
            transition: 'color 0.3s ease, background-color 0.3s ease',
            textAlign: 'center',
          }}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title='OPEN KEPT'
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          ></i>
        </div>
      </div>
    </div>
    <div
      id='main-element'
      style={{
        gap: columnGap + 'px',
        padding: padding + 'px',
        width: firstRowWidth + 'px',
        transformOrigin: origin, // Dynamic transform-origin based on mouse position
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e, { x: startPoint?.x, y: startPoint?.y })}
      onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
    >
      {images.map((image, index) => (
        <div key={index} className='image-card'>
          <LazyLoadImage
            id={`image-${image.id}`}
            src={image.path}
            alt={`Image ${index}`}
            className="img no-drag"
            onTouchEnd={(e: any) => {
              return !isDragging ? handleImageClick(image.id, index, e) : null;
            }}
            onMouseUp={(e: any) => {
              return !isDragging ? handleImageClick(image.id, index, e) : null;
            }}
            style={{
              borderColor: currentSelectedImageId === index ? 'deeppink' : selectedImageIds.includes(image.id) ? 'blue' : image.isKept ? 'orange' : 'rgba(255, 255, 255, 0.5)',
              opacity: selectedImageIds.includes(image.id) ? 0.5 : 1,
              height: defaultRowHeight + 'px'
            }} />
          <div className='image-tool-area-container no-selection-removal-on-click' style={{ display: 'flex', flexWrap: 'wrap' }}>
            <button
              id={`delete-button-${image.id}`}
              type="button"
              className={`btn btn-dark py-1.5 my-1 ${image.isKept ? ' disabled' : ''}`}
              onMouseUp={(e) => {
                handleDeleteOnClick(e, image, index, e.currentTarget.querySelector(`i#delete-icon-${image.id}`));
              }}
              onTouchEnd={(e) => {
                handleDeleteOnClick(e, image, index, e.currentTarget.querySelector(`i#delete-icon-${image.id}`));
              }}>
              <i
          id={`delete-icon-${image.id}`}
          style={{
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
              onMouseUp={(e) => {
                handleKeepOnClick(e, image);
              }}
              onTouchEnd={(e) => {
                handleKeepOnClick(e, image);
              }}>
              <i
          id={`keep-icon-${image.id}`}
          className={`bi ${image.isKept ? 'bi-bag-dash-fill' : 'bi-bag-plus-fill'} pointer${image.isKept ? ' clicked' : ''}`}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title={`${image.isKept ? 'UNKEEP' : 'KEEP'}`}
              ></i>
            </button>
            <span
              className='image-tool-area-gap'
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title={image.fileName}
            >
              <span className='no-selection-removal-on-click'>{image.fileName.length > 10
          ? `${image.fileName.slice(0, 5)}...${image.fileName.slice(-5)}`
          : image.fileName}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
    {isGalleriaClosed === false && 
    <PhotoGalleria 
      images={images} 
      setIsGalleriaClosed={setIsGalleriaClosed} 
      setCurrentSelectedImageId={setCurrentSelectedImageId} 
      currentSelectedImageId={currentSelectedImageId}
      handleDeleteOnClick={handleDeleteOnClick}
      handleKeepOnClick={handleKeepOnClick} />}
      <ModalPopup 
        setIsDeletePopupVisible={setIsDeletePopupVisible}
        isDeletePopupVisible={isDeletePopupVisible}
        handleDeleteImages={handleDeleteImages}
       ></ModalPopup>
    </>
  );
};

export default ImageGrid;