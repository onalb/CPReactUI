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
import ImageCard from './image-card';
import { useMutation, useQueryClient } from 'react-query';
import { useQuery } from 'react-query';
import { getPhotoListFromFolder, deletePhotoListFromFolder, toggleKeepPhoto, toggleMarkForDeletion } from '../services/PhotoService';
import LoadingSpinner from './loading-spinner';

// Place these outside your component so they persist across renders
let clickTimeout: NodeJS.Timeout | null = null;
let lastClickedImageId: number | null = null;

const ImageGrid: React.FC = () => {
  const { isOpenOnlyKept, folderPath } = useParams<{ isOpenOnlyKept: string, folderPath: string }>();
  const queryClient = useQueryClient();

  //User Editable Paramters
  const numberOfColumns = 10;

  // States
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\25 In Flames');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\25 Strasbourg train');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\22 Prague');
  // const [folder, setFolder] = useState<string>("C:\\Users\\burak\\Pictures\\Lansdale\\24\\don's olds mobile");
  // const [folder, setFolder] = useState<string>("C:\\Users\\burak\\Pictures\\Lansdale\\23");
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\22 italy');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\24 Boston');
  const [folder, setFolder] = useState<string>(folderPath || '');
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
  const [isZooming, setIsZooming] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [isGalleriaClosed, setIsGalleriaClosed] = useState<boolean | null>(null);
  const [handleDeleteImages, setHandleDeleteImages] = useState<() => void>(() => () => {});
  const [popupOptions, setPopupOptions] = useState<any>({ isVisible: false, message: '', isYesNo: false });
  const [visibleImages, setVisibleImages] = useState([] as any[]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isLoadingCompleted, setIsLoadingCompleted] = useState<boolean>(false);
  const [isLoadingCompletedAtStart, setIsLoadingCompletedAtStart] = useState<boolean>(false);
  const [isImageListFetched, setIsImageListFetched] = useState<boolean>(false);
  const [imagesElements, setImagesElements] = useState([] as any[]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isKeepButtonDisabled, setIsKeepButtonDisabled] = useState<boolean>(false);
  const [isNotificationReceived, setIsNotificationReceived] = useState<boolean>(false);
  const [isHeaderOpened, setIsHeaderOpened] = useState<boolean>(false);
  const imageBeingDeleted = useRef<{deleteErrorType: string, images: any[]}>({deleteErrorType: '', images: []});
  const squareRef = useRef<HTMLDivElement | null>(null);
  const isOpenedOnBrowser = typeof navigator !== 'undefined' && navigator.userAgent !== undefined && !navigator.userAgent.includes('Electron');

  // Calculations
  let numberOfKeptImages = images.filter(image => !image.isDeleted && image.isKept).length;

  // Variables
  const padding = 10;
  const columnGap = 2;
  const defaultRowHeight = 300;
  const imageHeight = 300;

  const dbPromise = openDB('image-store', 1, {
    upgrade(db) {
      db.createObjectStore('images');
    },
  });

  // React-Queries
  const toggleKeepPhotoMutation = useMutation(
    async (image: any) => {
      const response = await toggleKeepPhoto(encodeURIComponent(image["imageDirectory"]), encodeURIComponent(image["fileName"]));
      return response.data;
    },
    {
      onMutate: async (imageToKeep: any) => {
        setImages((prevImages: any[]) => {
          return prevImages.map((img: any) => {
            if (imageToKeep.fileName === img.fileName) {
              return { ...img, isKept: !img.isKept };
            } else {
              return img;
            }
          });
        });
      },
      onError: async (error: any) => {
        console.error('Error toggling keep status: ', error);
        setPopupOptions({
          isVisible: true,
          isYesNo: false,
          title: 'WARNING',
          message: 'There was an error toggling the keep status of the photo.',
        });
      }
    }
  )

  const toggleMarkForDeletionMutation = useMutation(
    async (image: any) => {
      const response = await toggleMarkForDeletion(encodeURIComponent(image["imageDirectory"]), encodeURIComponent(image["fileName"]));
      return response.data;
    },
    {
      onMutate: async (imageToMarkForDeletion: any) => {
        setImages((prevImages: any[]) => {
          return prevImages.map((img: any) => {
            if (imageToMarkForDeletion.fileName === img.fileName) {
              return { ...img, isMarkedForDeletion: !img.isMarkedForDeletion };
            } else {
              return img;
            }
          });
        });
      },
      onError: async (error: any) => {
        console.error('Error toggling MarkForDeletion status: ', error);
        setPopupOptions({
          isVisible: true,
          isYesNo: false,
          title: 'WARNING',
          message: 'There was an error toggling the MarkForDeletion status of the photo.',
        });
      }
    }
  )

  const deletePhotoMutation = useMutation(
    async (image: any) => {
      const response = await deletePhotoListFromFolder(image["fullImageDirectory"], image["fileName"], image["imageDirectory"]);
      return response.data;
    },
    {
      onMutate: async (imageToDelete: any) => {
        setImages((prevImages: any[]) => {
          return prevImages.map((img: any) => {
            if (imageToDelete.fileName === img.fileName) {
              return { ...img, isDeleted: true };
            } else {
              return img;
            }
          });
        });
      },
      onError: async (error: any) => {
        imageBeingDeleted.current.images.push(images.find((img: any) => img.fullImageDirectory === error.response.data.imagePath));
        imageBeingDeleted.current["deleteErrorType"] = error.response.data.type;
        console.error('Error deleting photo: ', error);

        if (error.response.data.type && error.response.data.type === 'access') {
          queryClient.invalidateQueries(['images']);
        } else {
          const prepedImages: any[] = await prepImagesData(images);

          if (isOpenOnlyKept === 'true') {
            setImages(prepedImages.filter(image => image.isKept));
          } else {
            setImages(prepedImages);
          }
          setPopupOptions({
            isVisible: true,
            isYesNo: false,
            title: 'WARNING',
            message: (
              <div>
                There was an error Deleting the Photo. Below photo(s) are restored.
                  <ul style={{ listStyleType: 'disc', color: 'inherit', marginTop: '10px' }}>
                  {imageBeingDeleted.current.images.map((image: any, index: number) => (
                    <li key={index}>{image.name}</li>
                  ))}
                  </ul>
              </div>
            ),
          });
        }
      }
    }
  );

  useQuery(['images'], async() => {
    const data = await getPhotoListFromFolder(folder);
    if (data.length > 0) setIsImageListFetched(true);
    return data
  }, 
  {
    initialData: [],
    refetchOnWindowFocus: false,
    onSuccess: async (data) => {
      setIsImageListFetched(true);

      if (data.length > 0) {
        if (isOpenOnlyKept === 'true') {
          data = data.filter(image => image.isKept);
        } 

        setFirstRowWidth(calculateFirstRowWidth(data));
      }
      // DO NOT DELETE: Only if this is the first time loading the page or if a notification is received prep the images again. 
      if (images.length === 0 || isNotificationReceived) {
        setIsNotificationReceived(false);
        const prepedImages: any[] = await prepImagesData(data);

        setImages(prepedImages);
      } else if (imageBeingDeleted.current.images.length > 0) {
        setImages((prevImages: any[]) => {
          return prevImages.map((img: any) => {
            if (imageBeingDeleted.current.images.some((image: any) => image.name === img.fileName)) {
              return { ...img, isDeleted: true };
            } else {
              return img;
            }
          });
        })
      }
      
      if (imageBeingDeleted.current.images.length > 0 && imageBeingDeleted.current.deleteErrorType === 'access') {
        // DO NOT DELETE COMMENT: imagesNotFound does not include the currentImagesBeingDeleted. 
        // DO NOT DELETE COMMENT: That's why we need to find it seperately and concatenate
        // DO NOT DELETE COMMENT: this is being called after invalidate query for 'images'
        const imagesNotFound = images.filter((image: any) => !data.some((datum: any) => datum.name === image.fileName))
        // const currentImagesBeingDeleted = { fileName: imageBeingDeleted.current.images[0].fileName };
        // const allImagesNotFound = [...imagesNotFound, currentImagesBeingDeleted];
        console.log('Difference between data and queryImages:', imagesNotFound);

        // DO NOT DELETE COMMENT: This is to remove/delete the not found images from UI optimistically
        setImages((prevImages: any[]) => {
          return prevImages.map((img: any) => {
            if (imagesNotFound.some((image: any) => image.fileName === img.fileName)) {
              return { ...img, isDeleted: true };
            } else {
              return img;
            }
          });
        })

        if (imagesNotFound.length > 0) {
          setPopupOptions({
            isVisible: true,
            isYesNo: false,
            title: 'WARNING',
            message: (
              <div>
                The below pictures could not be found in the directory. They will be removed from the grid.
                  <ul style={{ listStyleType: 'disc', color: 'inherit', marginTop: '10px' }}>
                  {imagesNotFound.map((image: any, index: number) => (
                    <li key={index}>{image.fileName}</li>
                  ))}
                  </ul>
              </div>
            ),
          });
        }
        imageBeingDeleted.current.deleteErrorType = '';
      }
    }
  });

  const setCurrentSelectedImage = (imageId: number | null) => {
    setImages((prevImages: any[]) => {
      return prevImages.map((img: any) => {
        if (img.id === imageId) {
          img["isCurrentSelectedImage"] = true;
        } else {
          img["isCurrentSelectedImage"] = false;
        }
        return img;
      });
    });

    fetchXXLImage(getCurrentSelectedImage().index);
  };

  const getCurrentSelectedImage = () => {
    const currentSelectedImage = images.find((image: any) => image.isCurrentSelectedImage) || null;
    const index = currentSelectedImage ? images.findIndex((image: any) => image.id === currentSelectedImage.id) : -1;
    return { ...currentSelectedImage, index }
  }

  const getVisibleImages = () => {
    const mainElement = document.getElementById('main-element');

    if (!mainElement) return [];

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    let currentImagesElements: HTMLImageElement[] = [];

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

  const openNewTabInElectron = async (
    urlPath: string, 
    title: string,
    originalImagePath?: string, 
  ) => {
    axios.post('https://localhost:3080/api/openNewTab', {
      url: `http://localhost:3000/${(urlPath)}`,
      title: title,
      originalImagePath: originalImagePath,
    })
    .then((response) => {
      console.log('Response from server:', response.data);
    })
    .catch((error) => {
      console.error('Error making POST request:', error);
    });
  }

  // Function to call openWithDialog API
  const openWithDialog = async (filePath: string) => {
    try {
      await axios.post('https://localhost:3080/api/openWithDialog', {
        filePath: encodeURIComponent(filePath),
      });
    } catch (error) {
      console.error('Error calling openWithDialog:', error);
    }
  };

  const prepImagesData = async (data) => {
    let prepedImages: any[] = [];
    try {
      setTotalNumberOfImages(data.length);
      for (let i = 0; i < data.length; i++) {
        const photo = data[i];
        const image: any = {};

        setCachedImageCount(prevCount => prevCount + 1);

        image['id'] = i;
        image['fileName'] = photo.name;
        image['height'] = photo.dimensions.height;
        image['width'] = photo.dimensions.width;
        image['isKept'] = photo.isKept || false;
        image['deleteClickedOnce'] = false;
        image['isMarkedForDeletion'] = photo.isMarkedForDeletion || false;
        image['isDeleted'] = false;
        image['imageDirectory'] = photo.directory;
        image['fullImageDirectory'] = photo.directory + '\\' + photo.name;

        image['pathXS'] = `https://localhost:3080/api/photo?folder=${folder}&image=${photo.name}&height=${imageHeight / 8}`;
        image['pathS'] = `https://localhost:3080/api/photo?folder=${folder}&image=${photo.name}&height=${imageHeight / 2}`;
        image['pathM'] = `https://localhost:3080/api/photo?folder=${folder}&image=${photo.name}&height=${imageHeight}`;
        image['pathL'] = `https://localhost:3080/api/photo?folder=${folder}&image=${photo.name}&height=${imageHeight * 2}`;
        image['pathXL'] = `https://localhost:3080/api/photo?folder=${folder}&image=${photo.name}&height=${imageHeight * 3}`;
        image['pathXXL'] = `https://localhost:3080/api/photo?folder=${folder}&image=${photo.name}&height=${photo.dimensions.height}`;

        const MCached = await loadImageFromIndexedDB(image['pathM']) || image['pathM'];
        if (MCached === image['pathM']) {
          await saveImageToIndexedDB(image['pathM'], image['pathM']);
          image['pathM'] = await loadImageFromIndexedDB(image['pathM'])
        } else {
          image['pathM'] = MCached;
        }
        
        image['path'] = image['pathM'];
        prepedImages.push(image);
      }

      data.length && setIsCachingCompleted(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      return prepedImages;
    }
  };

  const fetchXXLImage = async (currentSelectedImageIndex: number | null) => {
    // DO NOT DELETE COMMENT: This function is to cache the XXL images in the IndexedDB once the image is clicked
    if (images.filter((i: any) => !i.isDeleted).length > 0) {
      for (let i = currentSelectedImageIndex || 0; i < (currentSelectedImageIndex || 0) + 5; i++) {
        const image = images[i >= 0 ? i : 0];

        if (i >= images.filter((i: any) => !i.isDeleted).length) return;
        if (image['pathXXL'].includes('blob')) return;

        let XXLCached: string | null = null;
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
      }
    };
  }
  
  // Functions
  function calculateFirstRowWidth (images: any[]) {
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

  const squareSelection = (event: any) => {
    const square = document.createElement('div');
    square.id = 'mouse-square';
    square.style.left = `${event.clientX}px`;
    square.style.top = `${event.clientY}px`;
    square.onmousemove = (e) => handleMouseMove(e, { x: event.clientX, y: event.clientY });
    squareRef.current = square;
    document.body.appendChild(square);
  }

  // Effects
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'add' || data.type === 'remove') {
        setPopupOptions({
          isVisible: true,
          isYesNo: false,
          title: data.type === 'add' ? 'Image(s) added' : 'Image(s) Removed',
          message: data.type === 'add' ? 'New image(s) added into your folder!' : 'Image(s) removed from your folder!',
        });

        setIsNotificationReceived(true);
        queryClient.invalidateQueries(['images']);
      }
    };
  
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (isDeleting) {
      getVisibleImages();
    }
  }, [isDeleting]);

  useEffect(() => {
    varyImageQualityWithZoom();
  }, [visibleImages]);

  useEffect(() => {
    if (isLoadingCompletedAtStart) {
      addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
      addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);

      const cleanup = applyMouseAndTouchEvents(
        'main-element',
        squareRef,
        images.length,
        setZoomScale, 
        setIsDragging,
        setIsZooming, 
        setIsLongTouch, 
        handleMouseUp, 
        getVisibleImages,
        squareSelection,
        openImageOnNewTab,
      );

      return () => {
        cleanup();
        removeTrackedEventListeners(window, 'keyup');
        removeTrackedEventListeners(window, 'keydown');
      };
    }
  }, [isLoadingCompletedAtStart]);

  useEffect(() => {
    if (isGalleriaClosed) {
      addTrackedEventListener(window, 'click', handleClickOutside);
      addTrackedEventListener(window, 'touchend', handleClickOutside);
      const cleanup = applyMouseAndTouchEvents(
        'main-element',
        squareRef,
        images.length,
        setZoomScale, 
        setIsDragging,
        setIsZooming, 
        setIsLongTouch, 
        handleMouseUp, 
        getVisibleImages,
        squareSelection,
        openImageOnNewTab,
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
    };
  }, [isDragging, isLongTouch]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
        setCurrentSelectedImage(null);
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
      if (target.tagName !== 'IMG' 
        && target.tagName !== 'BUTTON' 
        && target.tagName !== 'I' 
        && target.tagName !== 'path' 
        && !(target.classList.contains('no-selection-removal-on-click') 
        || target.classList.contains('p-icon') 
        || target.classList.contains('p-button-label') 
        || target.classList.contains('p-button-icon'))) {
        setSelectedImageIds([]);
        setCurrentSelectedImage(null);
      }
    };
  };

  const openImageOnNewTab = (imageId: number) => {
    // Set the clicked image as the current selected image
    setCurrentSelectedImage(imageId);

    // Add the image to the selectedImageIds
    setSelectedImageIds((prevIds) => Array.from(new Set([...prevIds, imageId])));

    // Open the image in a new tab
    const clickedImage = images.find((img) => img.id === imageId);
    const imagePath = encodeURIComponent(clickedImage.pathXXL);
    const imageName = clickedImage.fileName;
    const originalImagePath = encodeURIComponent(clickedImage.fullImageDirectory);

    if (isOpenedOnBrowser) {
      if (clickedImage) {
        window.open(`/full-size-image/${imagePath}/${imageName}/${originalImagePath}`, '_blank');
      }
    } else {
      openNewTabInElectron(`full-size-image/${imagePath}/${imageName}/${originalImagePath}`, imageName, originalImagePath);
      // openNewTabInElectron('full-size-image', imagePath, imageName, originalImagePath);
    }
  }

  const handleImageClick = (imageId: number, index: number, event: React.MouseEvent | React.TouchEvent) => {
    // Copy event properties you need
    const shiftKey = (event as any).shiftKey;
    const ctrlKey = (event as any).ctrlKey;

    if (!isDragging && !isZooming) {
      if (clickTimeout && lastClickedImageId === imageId) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
        lastClickedImageId = null;
        openImageOnNewTab(imageId);
      } else {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        lastClickedImageId = imageId;
        clickTimeout = setTimeout(() => {
        clickTimeout = null;
        lastClickedImageId = null;
        
        if (event.shiftKey && getCurrentSelectedImage().index !== null) {
            const start = Math.min(
              getCurrentSelectedImage().index,
              images.findIndex((img) => img.id === imageId && !img.isDeleted)
            );
            const end = Math.max(
              getCurrentSelectedImage().index, 
              images.findIndex((img) => img.id === imageId && !img.isDeleted)
            );

            const newSelectedImageIds = images.slice(start, end + 1).map((img) => img.id);
            setSelectedImageIds((prevIds) => Array.from(new Set([...prevIds, ...newSelectedImageIds])));
            setCurrentSelectedImage(imageId);
          } else if (event.shiftKey && getCurrentSelectedImage().index === null) {
            setCurrentSelectedImage(imageId);
            setSelectedImageIds((prevIds) => [...prevIds, imageId]);
          } else {
            if (!isLongTouch && !event.ctrlKey && getCurrentSelectedImage().id === imageId) {
              setCurrentSelectedImage(null);
            } else if (!selectedImageIds.includes(imageId)) {
              setCurrentSelectedImage(imageId);
            }

            setSelectedImageIds((prevIds) =>
              prevIds.includes(imageId) && !isLongTouch && !event.ctrlKey
                ? prevIds.filter((id) => id !== imageId)
                : [...prevIds, imageId]
            );
          }
        }, 300);
      }
    }
  };

  const handleKeepOnClick = (e: any, image: any): boolean => {
    if (isZooming || isDragging) return false;

    setIsKeepButtonDisabled(true);
    setTimeout(() => {
      setIsKeepButtonDisabled(false);
    }, 400);

      
    if (!image.isKept) {
      createParticles(e.clientX, e.clientY, zoomScale, 'keep');
    }

    toggleKeepPhotoMutation.mutate(image);

    return true;
  };

  const handleMarkForDeletionOnClick = (e: any, image: any, index: number, deleteIcon: any) => {
    if (isZooming || isDragging) return false;

    // setIsMarkedForDeletionButtonDisabled(true);
    // setTimeout(() => {
    //   setIsKeepButtonDisabled(false);
    // }, 400);

      
    if (!image.isKept) {
      createParticles(e.clientX, e.clientY, zoomScale, 'keep');
    }

    toggleMarkForDeletionMutation.mutate(image);

    return true;
  };

  const handleDeleteOnClick = (e: any, image: any, index: number, deleteIcon: any) => {
    if (isZooming || isDragging) return false;
    if (deleteIcon) {
      if (!image.deleteClickedOnce) {
        // DO NOT DELETE COMMENT: if delete icon was never clicked this will update the icon color
        image.deleteClickedOnce = true;
        // DO NOT DELETE COMMENT: updates the deleteClickedOnce property of the current image
        setImages(images.map(img => img.id === image.id ? image : img)); 
        startTimer(image, setImages);
        return false;
      } else {
        // DO NOT DELETE COMMENT: if delete icon is clicked twice it will come here
        // DO NOT DELETE COMMENT: Optimistically update the UI
        createParticles(e.clientX, e.clientY, zoomScale, 'delete');
        
        setImages((oldImages: any[]) => {
          return oldImages.map((img: any) => {
            if (img.fileName === image.fileName) {
              return  { ...img, isDeleted: true }
            } else {
              return img;
            }
          })
        })

        queryClient.setQueryData('images', (oldImages: any) => {
          return oldImages.filter((img: any) => img.name !== image.fileName);
        })
        
        deletePhotoMutation.mutate(image);

        stopTimer(image);
        image.deleteClickedOnce = false;

        setSelectedImageIds(prevIds => prevIds.filter(id => id !== image.id));

        if (getCurrentSelectedImage().id === image.id) {
          setCurrentSelectedImage(null);
        }

        return true;
      }
    }

    return false;
  }

  const handleDeleteSelectedImages = () => {
    const imagesToDelete = images.filter(image => selectedImageIds.includes(image.id) && !image.isKept);

    imagesToDelete.forEach((selectedImage: any)=> {
      selectedImage.isDeleted = true;
      queryClient.setQueryData('images', (oldImages: any) => {
        return oldImages.filter((img: any) => img.name !== selectedImage.fileName);
      })
      
      deletePhotoMutation.mutate(selectedImage);
    })

    setSelectedImageIds([]);
    setCurrentSelectedImage(null);
  };

  const handleDeleteSelectedImagesOnClick = (e: any) => {
    setHandleDeleteImages(() => handleDeleteSelectedImages);
    setPopupOptions({ isVisible: true, isYesNo: true, title: 'DELETE', message: 'You are about to delete the SELECTED images. KEPT images will retain. Are you sure you want to proceed?' });
  }

  const handleDeleteMarkedImages = () => {
    const imagesToDelete = images.filter(image => image.isMarkedForDeletion && !image.isKept && !image.isDeleted);
    imagesToDelete.forEach((markedImage: any) => {
      queryClient.setQueryData('images', (oldImages: any) => {
        return oldImages.filter((img: any) => img.name !== markedImage.fileName);
      })

      markedImage.isDeleted = true;
      deletePhotoMutation.mutate(markedImage);
    })
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

  const handleMouseUp = (event) => {
    if (squareRef.current) {
      const squareRect = squareRef.current.getBoundingClientRect();
      const isAClick = squareRect.right - squareRect.left === 4 && squareRect.bottom - squareRect.top === 4;
      const deselectedImages: number[] = [];
      const newSelectedImageIds = images.filter(image => {
        let isMouseOnImage = false;
        const index = image.id;
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
            isMouseOnImage = (
              event.clientX >= imageRect.left &&
              event.clientX <= imageRect.right &&
              event.clientY >= imageRect.top &&
              event.clientY <= imageRect.bottom
            );
          }

          if (isIntersecting) {
            if (isAClick && selectedImageIds.includes(image.id) && getCurrentSelectedImage().index === index) {
              setCurrentSelectedImage(null);
              deselectedImages.push(image.id);
              return false;
            } else if (isAClick && selectedImageIds.includes(image.id) && getCurrentSelectedImage().index !== index) {
              deselectedImages.push(image.id);
              return false;
            } else {
              isMouseOnImage && setCurrentSelectedImage(index);
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
    setIsHeaderOpened(true);
  };

  const handleMouseLeaveHeader = (e: any) => {
    e.currentTarget.style.transform = 'translateY(-90%)';
    e.currentTarget.style.backgroundColor = 'rgba(32, 32, 32, .9)';
    const headerHandle: HTMLElement = document.querySelector('.header-handle') as HTMLElement;
    if (headerHandle) (headerHandle).style.backgroundColor = 'rgba(32, 32, 32, .9)';
    setIsHeaderOpened(false);
  };

  const handleOnloadImg = () => {
    //  DO NOT DELETE COMMENT: This if statement is put here so that if an image is deleted after the initial load the following updates will not happen
    //  DO NOT DELETE COMMENT: If following updates happen upon image deletion, clicks freeze until all the images are parsed again and all thse updates complete.
    if(!isLoadingCompletedAtStart) {
      if (isGalleriaClosed !== true) {
        setLoadedImageCount(loadedImageCount + 1);
        setIsCachingCompleted(false);

        if (loadedImageCount === images.length - 1) {
          setIsCachingCompleted(true);
          setImagesElements(Array.from(document.getElementById('main-element')!.getElementsByTagName('img')));
        }
      }

        const deletedImgCount = images.filter((i: any) => i['isDeleted'] === true).length;
        if (images.length > 0 && loadedImageCount === (images.length - deletedImgCount - 1) && !isLoadingCompletedAtStart) {
          setIsLoadingCompletedAtStart(true);
          return true;
        } 

      // To get and display the number of images that are loaded make the calculation here -- tech debt
    }
  }

  const openKeptOnNewTab = () => {
    if (isOpenedOnBrowser) {
      window.open(`http://localhost:3000/image-grid/true/${encodeURIComponent(folderPath || '')}`, '_blank'); // fix
    } else {
      const folderName = folder.split('\\').pop();
      openNewTabInElectron(`image-grid/true/${encodeURIComponent(folderPath || '')}`, `Kept in: ${folderName}`);
    }
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
      className='header position-absolute vh-10 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center p-0 no-selection-removal-on-click'
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
      onTouchStart={isHeaderOpened ? handleMouseLeaveHeader : handleMouseEnterHeader}
    >
      <div
        className='header-handle no-selection-removal-on-click'
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
          className='col-6 d-flex align-items-center' 
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
          className='col-1 d-flex justify-content-center align-items-center'>
          <i
            className={`col bi bi-check2-all`}
            style={{        
              display: 'block', fontSize: '45px', color: 'white',
              transition: 'color 0.3s ease, background-color 0.3s ease',
              textAlign: 'center',
            }}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title='OPEN WITH'
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => openWithDialog('C:\\Users\\burak\\Pictures\\DSC04127.JPG')}
            onTouchEnd={() => openWithDialog('C:\\Users\\burak\\Pictures\\DSC04127.JPG')}
          ></i>
        </div>
        <div
          key='select-all'
          className='col-1 d-flex justify-content-center align-items-center'>
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
            onClick={() => selectAllImages()}
            onTouchEnd={() => selectAllImages()}
          ></i>
        </div>
        <div
          key='delete-marked'
          className='col-1 d-flex justify-content-center align-items-center'
          style={{ pointerEvents: `${images.some((i: any) => i.isMarkedForDeletion === true) ? 'auto' : 'none'}` }}
          data-toggle="modal" data-target="#exampleModalCenter">
          <i
            className={`col bi bi-cart-x`}
            style={{        
              display: 'block', fontSize: '45px', color: `${images.some((i: any) => i.isMarkedForDeletion === true) ? 'white' : 'gray'}`,
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
            onClick={() => {
              setHandleDeleteImages(() => handleDeleteMarkedImages);
              setPopupOptions({ isVisible: true, isYesNo: true, title: 'DELETE', message: 'You are about to delete all the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?'  });
            }}
            onTouchEnd={() => {
              setHandleDeleteImages(() => handleDeleteMarkedImages);
              setPopupOptions({ isVisible: true, isYesNo: true, title: 'DELETE', message: 'You are about to delete all the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?'  });
            }}
          ></i>
        </div>
        <div
          key='delete-selected'
          className='col-1 d-flex justify-content-center align-items-center'
          style={{ pointerEvents: `${selectedImageIds.length > 0 ? 'auto' : 'none'}` }}
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
            onClick={handleDeleteSelectedImagesOnClick}
            onTouchEnd={handleDeleteSelectedImagesOnClick}
          ></i>
        </div>
        <div
          key='open-galleria'
          className='col-1 d-flex justify-content-center align-items-center'>
          <i
            className={`col bi bi-tv`}
            style={{        
              display: 'block', fontSize: '45px', color: 'white', padding: '0px',
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
            onClick={openGalleria}
            onTouchEnd={openGalleria}
          ></i>
        </div>
        <div 
          key='open-kept'
          className='col-1 d-flex justify-content-center align-items-center'
          style={{ pointerEvents: `${numberOfKeptImages > 0 ? 'auto' : 'none'}` }}>
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
            onClick={openKeptOnNewTab}
            onTouchEnd={openKeptOnNewTab}
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
        transform: 'matrix(1, 0, 0, 1, 0, 0)',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e, { x: startPoint?.x, y: startPoint?.y })}
      onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
    >
      {images.filter((i: any) => !i.isDeleted).map((image, index) => (
          <ImageCard 
            image={image}
            index={index}
            handleImageClick={handleImageClick}
            handleKeepOnClick={handleKeepOnClick}
            handleMarkForDeletionOnClick={handleMarkForDeletionOnClick}
            handleDeleteOnClick={handleDeleteOnClick}
            getCurrentSelectedImage={getCurrentSelectedImage}
            isDragging={isDragging}
            selectedImageIds={selectedImageIds}
            handleOnloadImg={handleOnloadImg}
            setIsDeleting={setIsDeleting}
          />
      ))}
    </div>

    {isGalleriaClosed === false && 
      <PhotoGalleria 
        images={images} 
        setIsGalleriaClosed={setIsGalleriaClosed} 
        setCurrentSelectedImage={setCurrentSelectedImage} 
        getCurrentSelectedImage={getCurrentSelectedImage}
        handleDeleteOnClick={handleDeleteOnClick}
        handleKeepOnClick={handleKeepOnClick}
        isKeepButtonDisabled={isKeepButtonDisabled}
      />
    }
    <ModalPopup 
      popupOptions ={popupOptions}
      setPopupOptions={setPopupOptions}
      handleDeleteImages={handleDeleteImages}
    ></ModalPopup>

    {!isLoadingCompletedAtStart && (
      LoadingSpinner({text: 'Rendering images...'})
    )}
    </>
    ) : (<>{(isImageListFetched ?
      (!isCachingCompleted && <div className='loading-spinner' 
        style={{
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
    ) : (
      LoadingSpinner({text: 'Fetching Image List ...'})
    )
  )}</>)
  );
};

export default ImageGrid;