import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
import { openDB } from 'idb';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ImageCard from './image-card';
// import findPortByServiceName from '../utils';

const ImageGrid: React.FC = () => {
  const { isOpenOnlyKept } = useParams<{ isOpenOnlyKept: string }>();
  //User Editable Paramters
  const numberOfColumns = 10;

  // States
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\25 Strasbourg train');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\22 Prague');
  // const [folder, setFolder] = useState<string>("C:\\Users\\burak\\Pictures\\Lansdale\\24\\don's olds mobile");
  const [folder, setFolder] = useState<string>("C:\\Users\\burak\\Pictures\\Lansdale\\23");
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\22 italy');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\24 Boston');
  const [images, setImages] = useState([] as any[]);
  const [totalNumberOfImages, setTotalNumberOfImages] = useState<number>(0);
  const [loadedImageCount, setLoadedImageCount] = useState<number>(0);
  const [cachedImageCount, setCachedImageCount] = useState<number>(1);
  const [isCachingCompleted, setIsCachingCompleted] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [prevZoomScale, setPrevZoomScale] = useState(1);
  const [zoomStop, setZoomStop] = useState(2);
  const [firstRowWidth, setFirstRowWidth] = useState<number>(0); // Initial transform-origin
  const [isDragging, setIsDragging] = useState(false);
  // const [isScrolling, setIsScrolling] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [currentSelectedImageIndex, setCurrentSelectedImageIndex] = useState<number | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [isGalleriaClosed, setIsGalleriaClosed] = useState<boolean | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [handleDeleteImages, setHandleDeleteImages] = useState<() => void>(() => () => {});
  const [popupMessage, setPopupMessage] = useState<string>('');
  const [visibleImages, setVisibleImages] = useState([] as any[]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagesElements, setImagesElements] = useState([] as any[]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isKeepButtonDisabled, setIsKeepButtonDisabled] = useState<boolean>(false);
  const squareRef = useRef<HTMLDivElement | null>(null);

  // Variables
  const padding = 10;
  const columnGap = 2;
  const defaultRowHeight = 300;
  const imageHeight = 300;
  let numberOfKeptImages = images.filter(image => image.isKept).length;

  const dbPromise = openDB('image-store', 1, {
    upgrade(db) {
      db.createObjectStore('images');
    },
  });

  const getVisibleImages = () => {
    const mainElement = document.getElementById('main-element');

    if (!mainElement) return [];

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    let currentImagesElements = [];

    if (imagesElements.length === 0) {
      currentImagesElements.push(...Array.from(mainElement.getElementsByTagName('img')));
    } else {
      currentImagesElements = imagesElements;
    }

    if (currentImagesElements.length === 0) return;
    const visibleImagesElements = currentImagesElements.filter((img: any) => {
      const imgRect = img.getBoundingClientRect();
      return (
        imgRect.top < viewportHeight &&
        imgRect.left < viewportWidth &&
        imgRect.bottom > 0 &&
        imgRect.right > 0
      );
    });

    const visibleImageIds = visibleImagesElements.map((visibleImage: any) => visibleImage.id.replace('image-', ''));
    setVisibleImages(images.filter((image) => {
      if (visibleImageIds.includes(image.id.toString())) {
        return image;
      }
    }));
  };

  const saveImageToIndexedDB = async (url: any, key: any) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const db = await dbPromise;
    await db.put('images', blob, key);
  };

  const loadImageFromIndexedDB = async (key: any) => {
    try {
      const db = await dbPromise;
      const blob = await db.get('images', key);
      if (blob) {
      return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      console.error('Error loading image from IndexedDB:', error);
      return null;
    }
  };

  // Side Effects
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // const port = findPortByServiceName();
        // setIsCachingCompleted(false);
        const res = await axios.get(`http://localhost:3080/api/photoList?folder=${folder}`);
        setTotalNumberOfImages(res.data.length);
        let images = [];

        for (let i = 0; i < res.data.length; i++) {
          const photo = res.data[i];
          setCachedImageCount(prevCount => prevCount + 1);

          const image: any = {};
          image['id'] = i;
          image['fileName'] = photo.name;
          image['height'] = photo.dimensions.height;
          image['width'] = photo.dimensions.width;
          image['isKept'] = false;
          image['deleteClickedOnce'] = false;
          image['markedForDeletion'] = false;

          image['pathXS'] = `http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}&height=${imageHeight / 4}`;
          image['pathS'] = `http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}&height=${imageHeight / 2}`;
          image['pathM'] = `http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}&height=${imageHeight}`;
          image['pathL'] = `http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}&height=${imageHeight * 2}`;
          image['pathXL'] = `http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}&height=${imageHeight * 3}`;
          image['pathXXL'] = `http://localhost:3080/api/photos?folder=${folder}&image=${photo.name}&height=${imageHeight * 10}`;

          const MCached = await loadImageFromIndexedDB(image['pathM']) || image['pathM'];
          if (MCached === image['pathM']) {
            await saveImageToIndexedDB(image['pathM'], image['pathM']);
            image['pathM'] = await loadImageFromIndexedDB(image['pathM'])
          } else {
            image['pathM'] = MCached;
          }
          
          image['path'] = image['pathM'];
          images.push(image);
        }

        setIsCachingCompleted(true);

        if (isOpenOnlyKept === 'true') {
          setImages(images.filter(image => image.isKept));
        } else {
          setImages(images);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    if (folder) {
      fetchData();
    }
  }, [folder]);

  useEffect(() => {
    if (isDeleting) {
      getVisibleImages();
    }
  }, [isDeleting]);

  useEffect(() => {
  }, [isLoading])

  useEffect(() => {
    varyImageQualityWithZoom();
  }, [visibleImages]);

  useEffect(() => {
    addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
    addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);

    const cleanup = applyMouseAndTouchEvents(
      setZoomScale, 
      setIsDragging,
      // setIsScrolling, 
      setIsZooming, 
      setIsLongTouch, 
      squareRef, 
      handleMouseUp, 
      squareSelection,
      getVisibleImages,
      images.length
    );

    return () => {
      cleanup();
      removeTrackedEventListeners(window, 'keyup');
      removeTrackedEventListeners(window, 'keydown');
    };
  }, [imagesElements]);

  useEffect(() => {
    console.log('images:', images);
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
        // setIsScrolling, 
        setIsZooming, 
        setIsLongTouch,
        squareRef, 
        handleMouseUp, 
        squareSelection,
        getVisibleImages,
        images.length
      );
        addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
        addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);
      return cleanup;
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

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // useEffect(() => {
  //   const updateImagePaths = async () => {
  //     if (!isGalleriaClosed && images.some((image) => image.id === currentSelectedImageIndex)) {
  //       const updatePaths = async (prevImages: any[]) => {
  //         const index = currentSelectedImageIndex;
  //         if (index === null) return prevImages;

  //         const previousElement = index > 0 ? prevImages[index - 1] : null;
  //         const currentElement = prevImages[index];
  //         const nextElement = index < prevImages.length - 1 ? prevImages[index + 1] : null;

  //         if (previousElement) previousElement.path = await loadImageFromIndexedDB(`http://localhost:3080/api/photos?folder=${folder}&image=${previousElement.fileName}&height=${previousElement.height}`) || `http://localhost:3080/api/photos?folder=${folder}&image=${previousElement.fileName}&height=${previousElement.height}`;
  //         if (currentElement) currentElement.path = await loadImageFromIndexedDB(`http://localhost:3080/api/photos?folder=${folder}&image=${currentElement.fileName}&height=${currentElement.height}`) || `http://localhost:3080/api/photos?folder=${folder}&image=${currentElement.fileName}&height=${currentElement.height}`;
  //         if (nextElement) nextElement.path = await loadImageFromIndexedDB(`http://localhost:3080/api/photos?folder=${folder}&image=${nextElement.fileName}&height=${nextElement.height}`) || `http://localhost:3080/api/photos?folder=${folder}&image=${nextElement.fileName}&height=${nextElement.height}`;

  //         return prevImages.map((prevImage, i) => (
  //           i === index - 1 ? 
  //           previousElement : i === index ? 
  //           currentElement : i === index + 1 ? 
  //           nextElement : {
  //             ...prevImage, path: `http://localhost:3080/api/photos?folder=${folder}&image=${prevImage.fileName}&height=${imageHeight * 2}`
  //           }
  //         ));
  //       };

  //       setImages(prevImages => {
  //         updatePaths(prevImages).then(updatedImages => setImages(updatedImages));
  //         return prevImages;
  //       });
  //     }
  //   };

  //   updateImagePaths();
  // }, [currentSelectedImageIndex]);

  useEffect(() => {
    const fetchXXLImage = async () => {
      if (images.length > 0) {
        for (let i = currentSelectedImageIndex || 0; i < (currentSelectedImageIndex || 0) + 5; i++) {
          const image = images[i || 0];

          if (i >= images.length) return;
          if (image['pathXXL'].includes('blob')) return;

          let XXLCached = null;
          while (XXLCached === null) {
            if (image['pathXXL']) {
              XXLCached = await loadImageFromIndexedDB(image['pathXXL']) || image['pathXXL'];
            }
            
            if (XXLCached === image['pathXXL']) {
              await saveImageToIndexedDB(image['pathXXL'], image['pathXXL']);
              XXLCached = await loadImageFromIndexedDB(image['pathXXL']);
            } else {
              image['pathXXL'] = XXLCached;
            }
          }

          image['pathXXL'] = XXLCached;
          // setImages(images.map((img, index) => index === i ? image : img));  
        }
      };
    }
    fetchXXLImage();
  }, [currentSelectedImageIndex]);
  
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

  function varyImageQualityWithZoom () {
    setImages((prevImages) => {
      // This means zooming out
      if (zoomScale < prevZoomScale && Math.ceil(zoomScale) < zoomStop) {
        setZoomStop(Math.ceil(zoomScale));
        return updateImagesWithNewHeight(prevImages, zoomScale, visibleImages);
      };

      setPrevZoomScale(zoomScale);

      if (Math.ceil(zoomScale) > zoomStop) {
        setZoomStop(Math.ceil(zoomScale));
        return updateImagesWithNewHeight(prevImages, zoomScale, visibleImages);
      }

      if (isDragging) {
        return updateImagesWithNewHeight(prevImages, zoomScale, visibleImages);
      }
      // if (isScrolling) {
      //   setIsScrolling(false);
      //   return updateImagesWithNewHeight(prevImages, zoomScale, visibleImages);
      // }
      if (isDeleting) {
        setIsDeleting(false);
        return updateImagesWithNewHeight(prevImages, zoomScale, visibleImages);
      }

      return [...prevImages];
    });
  }

  const updateImagesWithNewHeight = (images: any, zoomScale: number, imagesToUpdate: any[]) => {
    const result = images.map((image: any) => {
      if (imagesToUpdate.some(imageToUpdate => imageToUpdate.id === image.id)) {
        return {
            ...image,
            path: `${zoomScale < 2 ? image.pathM : zoomScale < 3 ? image.pathL : zoomScale < 4 ? image.pathXL : image.pathXXL}`
        };
      } else {
        return {
          ...image,
          path: image.pathM
      };
      }
    });

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
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      selectAllImages();
    }

    if (event.ctrlKey && event.key === 'g') {
      openGalleria(event);
    }
    
    if (event.key === 'Escape') {
      if(!isGalleriaClosed) {
        const container = document.querySelector('.photo-galleria') as HTMLDivElement;
        if (container) {
          container.style.transition = 'opacity 0.2s ease-out';
          container.style.opacity = '0';
          setTimeout(() => {
            setIsGalleriaClosed(true);
          }, 200);
        }
      } else {
        setSelectedImageIds([]);
        setCurrentSelectedImageIndex(null);
      }
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }

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
        setCurrentSelectedImageIndex(null);
      }
    };
  };

  const handleImageClick = (imageId: number, index: number, event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !isZooming) {
      if (event.shiftKey && currentSelectedImageIndex !== null) {
        const start = Math.min(currentSelectedImageIndex, index);
        const end = Math.max(currentSelectedImageIndex, index);
        const newSelectedImageIds = images.slice(start, end + 1).map(img => img.id);
        setSelectedImageIds(prevIds => Array.from(new Set([...prevIds, ...newSelectedImageIds])));
        setCurrentSelectedImageIndex(index);
      } else if (event.shiftKey && currentSelectedImageIndex === null) {
        setCurrentSelectedImageIndex(index);
        setSelectedImageIds(prevIds =>  [...prevIds, imageId]);
      } else {
        if (currentSelectedImageIndex === index || selectedImageIds.includes(imageId)) {
          setCurrentSelectedImageIndex(null);
        } else {
          setCurrentSelectedImageIndex(index);
        }

        setSelectedImageIds(prevIds =>
          prevIds.includes(imageId)
            ? prevIds.filter(id => id !== imageId) // Deselect if already selected
            : [...prevIds, imageId] // Select if not already selected
        );
      }
    }
  };

  const handleKeepOnClick = (e: any, image: any): boolean => {
    if (isKeepButtonDisabled) return false;

    setIsKeepButtonDisabled(true);
    setTimeout(() => {
      setIsKeepButtonDisabled(false);
    }, 400);
  
    setImages((prevImages) => {
      const updatedImage = { ...image, isKept: !image.isKept };
      const updatedImages = prevImages.map(img => img.id === updatedImage.id ? updatedImage : img);
  
      if (!image.isKept) {
        createParticles(e.clientX, e.clientY, zoomScale, 'keep');
      }
  
      return updatedImages;
    });
  
    return true;
  };

  const handleDeleteOnClick = (e: any, image: any, index: number, deleteIcon: any) => {
    if (isZooming) return false;
    if (deleteIcon) {
      if (!image.deleteClickedOnce) {
        image.deleteClickedOnce = true;
        setImages(images.map(img => img.id === image.id ? image : img)); // updates the deleteClickedOnce property of the current image
        startTimer(image, setImages);
        return false;
      } else {
        stopTimer(image);
        setImages(images.filter(img => img.id !== image.id)); // removes the deleted image from the array
        createParticles(e.clientX, e.clientY, zoomScale, 'delete');
        setSelectedImageIds(prevIds => prevIds.filter(id => id !== image.id));
        setCurrentSelectedImageIndex((prevIndex: number | null) => { 
           if (prevIndex === null) {
             return null;
           } else if (prevIndex! > index) {
             return prevIndex - 1;
           } else {
              return prevIndex + 1;
           }
        });

        if (currentSelectedImageIndex === images.findIndex(img => img.id === image.id)) {
          setCurrentSelectedImageIndex(null);
        }
        return true;
      }
    }
    return false;
  }

  const handleMarkForDeletionOnClick = (e: any, image: any, index: number, deleteIcon: any) => {
    if (isZooming || !deleteIcon) return false;

    image.markedForDeletion = !image.markedForDeletion;
    setImages(images.map(img => img.id === image.id ? image : img));

    if (image.markedForDeletion) {
      createParticles(e.clientX, e.clientY, zoomScale, 'keep');
    }

    return image.markedForDeletion;
  };

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
        const index = images.findIndex(img => img.id === image.id); // fix it
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
            if (isAClick && selectedImageIds.includes(image.id) && currentSelectedImageIndex === index) {
              setCurrentSelectedImageIndex(null);
              deselectedImages.push(image.id);
              return false;
            } else if (isAClick && selectedImageIds.includes(image.id) && currentSelectedImageIndex !== index) {
              deselectedImages.push(image.id);
              return false;
            } else {
              setCurrentSelectedImageIndex(index);
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

  const handleDeleteSelectedImages = () => {
    const updatedImages = images.filter(image => !selectedImageIds.includes(image.id) || image.isKept);
    setImages(updatedImages);
    setSelectedImageIds([]);
    setCurrentSelectedImageIndex(() => {
      return null;
  })};

  const handleDeleteMarkedImages = () => {
    // const updatedImages = images.filter(image => !image.markedForDeletion || image.isKept);
    setImages((previousImages: any[]) => {
      return previousImages.filter(image => !image.markedForDeletion || image.isKept);
    });

    setSelectedImageIds([]);
  };

  const handleOnloadCaptureImg = (e: any) => {

  }

  const handleOnloadImg = () => {
    if (isGalleriaClosed !== true) {
      const currentTime = new Date().toLocaleTimeString();

      setLoadedImageCount(loadedImageCount + 1);
      setIsLoading(false);
      setIsCachingCompleted(false);

      if (loadedImageCount === images.length - 1) {
        setTimeout(() => {
          setIsCachingCompleted(true);
          const mainElement = document.getElementById('main-element');
          setImagesElements(Array.from(mainElement!.getElementsByTagName('img')));
        }, 1000);
      }
    }
  }

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
    images && images.length > 0 ? (
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
        <div 
          key='select-folder'
          className='col-7 d-flex align-items-center' 
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
        <div
          key='select-all'
          className='col-1 d-flex justify-content-center align-items-center'
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
          key='delete-marked'
          className='col-1 d-flex justify-content-center align-items-center'
          style={{ pointerEvents: `${images.some((i: any) => i.markedForDeletion === true) ? 'auto' : 'none'}` }}
          onClick={() => {
            setIsPopupVisible(true)
            setHandleDeleteImages(() => handleDeleteMarkedImages);
            setPopupMessage('You are about to delete the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?');
          }}
          data-toggle="modal" data-target="#exampleModalCenter">
          <i
            className={`col bi bi-cart-x`}
            style={{        
              display: 'block', fontSize: '45px', color: `${images.some((i: any) => i.markedForDeletion === true) ? 'white' : 'gray'}`,
              transition: 'color 0.3s ease, background-color 0.3s ease',
              textAlign: 'center',
            }}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title='DELETE MARKED'
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
          key='delete-selected'
          className='col-1 d-flex justify-content-center align-items-center'
          style={{ pointerEvents: `${selectedImageIds.length > 0 ? 'auto' : 'none'}` }}
          onClick={() => {
            setIsPopupVisible(true)
            setHandleDeleteImages(() => handleDeleteSelectedImages);
            setPopupMessage('You are about to delete the SELECTED images. KEPT images will retain. Are you sure you want to proceed?');
          }}
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
        <div
          key='open-galleria'
          className='col-1 d-flex justify-content-center align-items-center'
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
          title='OPEN GALLERIA'
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
          key='open-kept'
          className='col-1 d-flex justify-content-center align-items-center'
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
        transform: 'matrix(1, 0, 0, 1, 0, 0)'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e, { x: startPoint?.x, y: startPoint?.y })}
      onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
    >
      {images.map((image, index) => (
        <ImageCard 
          image={image}
          index={index}
          handleImageClick={handleImageClick}
          handleKeepOnClick={handleKeepOnClick}
          handleMarkForDeletionOnClick={handleMarkForDeletionOnClick}
          handleDeleteOnClick={handleDeleteOnClick}
          currentSelectedImageIndex={currentSelectedImageIndex}
          isDragging={isDragging}
          selectedImageIds={selectedImageIds}
          setIsLoading={setIsLoading}
          handleOnloadImg={handleOnloadImg}
          setIsDeleting={setIsDeleting}
        />
      ))}
    </div>

    {isGalleriaClosed === false && 
      <PhotoGalleria 
        images={images} 
        setIsGalleriaClosed={setIsGalleriaClosed} 
        setCurrentSelectedImageIndex={setCurrentSelectedImageIndex} 
        currentSelectedImageIndex={currentSelectedImageIndex}
        handleDeleteOnClick={handleDeleteOnClick}
        handleKeepOnClick={handleKeepOnClick}
        isKeepButtonDisabled={isKeepButtonDisabled}
      />
    }
    <ModalPopup 
      message ={popupMessage}
      setIsDeletePopupVisible={setIsPopupVisible}
      isDeletePopupVisible={isPopupVisible}
      handleDeleteImages={handleDeleteImages}
    ></ModalPopup>
    </>
    ) : (<>{!isCachingCompleted &&
      <div className='loading-spinner' style={{
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
          <div className="progress" style={{ width: '80%', margin: '0 auto' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${(cachedImageCount / totalNumberOfImages) * 100}%`, transition: 'width .001s ease-in-out' }}
              aria-valuenow={cachedImageCount}
              aria-valuemin={0}
              aria-valuemax={totalNumberOfImages}
            ></div>
          </div>
          <p>{`Loaded ${cachedImageCount} of ${totalNumberOfImages} images`}</p>
        </div>
      </div>
    }</>)
  );
};

export default ImageGrid;