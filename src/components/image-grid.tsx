import PaginationControls from './PaginationControls';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/image-grid.css';
import '../styles/scrollbar.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createParticles } from './create-particles';
import applyMouseAndTouchEvents, { createView } from './mouse-and-touch-events';
import { addTrackedEventListener, removeTrackedEventListeners } from './tracked-event-handler';
import  { startTimer, stopTimer} from './timer-functions';
import PhotoGalleria from './photo-galleria';
import ModalPopup from './model-popup';
import CustomScrollbar from './scrollbar';
import IconWithBadge from './icon-with-badge';
import ToolbarToggle from './toolbar-toggle';
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
  const baseNumberOfColumns = 10;
  const minColumnWidth = 300; // Minimum width per column including gap

  // States
  const [origin, setOrigin] = useState('0 0'); // Initial transform-origin
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\25 In Flames');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\25 Strasbourg train');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\22 Prague');
  // const [folder, setFolder] = useState<string>("C:\\Users\\burak\\Pictures\\Lansdale\\24\\don's olds mobile");
  // const [folder, setFolder] = useState<string>("C:\\Users\\burak\\Pictures\\Lansdale\\23");
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\22 italy');
  // const [folder, setFolder] = useState<string>('C:\\Users\\burak\\Pictures\\24 Boston');
  const [folder, setFolder] = useState<string>(folderPath ? decodeURIComponent(folderPath) : '');
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
  const [isScrolling, setIsScrolling] = useState(false);
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
  const [isHeaderPinned, setIsHeaderPinned] = useState<boolean>(false);
  const [headerCloseTimeout, setHeaderCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isScrollToZoom, setIsScrollToZoom] = useState<boolean>(true); // Default: scroll to zoom (ON)
  const [isFilteredView, setIsFilteredView] = useState<boolean>(false); // Track if we're showing filtered view
  const [filteredImageIds, setFilteredImageIds] = useState<number[]>([]); // Store IDs of images to show in filtered view
  const [isKeptFilteredView, setIsKeptFilteredView] = useState<boolean>(false); // Track if we're showing kept filtered view
  const [keptFilteredImageIds, setKeptFilteredImageIds] = useState<number[]>([]); // Store IDs of kept images to show in filtered view
  const [isMarkedFilteredView, setIsMarkedFilteredView] = useState<boolean>(false); // Track if we're showing marked filtered view
  const [markedFilteredImageIds, setMarkedFilteredImageIds] = useState<number[]>([]); // Store IDs of marked images to show in filtered view
  // Scrollbar state
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight // Subtract header height
  });
  const [scrollbarUpdateTrigger, setScrollbarUpdateTrigger] = useState(0); // Force scrollbar recalculation
  const [isHorizontalScrollbarVisible, setIsHorizontalScrollbarVisible] = useState<boolean>(false);
  const [isVerticalScrollbarVisible, setIsVerticalScrollbarVisible] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);

  const padding = 10;
  const columnGap = 1;
  // Calculate number of columns once on initial load based on window size
  const [numberOfColumns] = useState(() => {
    // Add some buffer to account for gaps and padding, then round to get a more accurate column count
    const availableWidth = window.innerWidth - (padding * 2); // Account for container padding
    const columnsWithGaps = availableWidth / (minColumnWidth + columnGap); // Account for gaps between columns
    return Math.max(1, Math.min(baseNumberOfColumns, Math.ceil(columnsWithGaps))); // Add 0.5 for better rounding
  });
  
  const viewRef = useRef<any>(null);
  const imageBeingDeleted = useRef<{deleteErrorType: string, images: any[]}>({deleteErrorType: '', images: []});
  const squareRef = useRef<HTMLDivElement | null>(null);
  const isOpenedOnBrowser = typeof navigator !== 'undefined' && navigator.userAgent !== undefined && !navigator.userAgent.includes('Electron');

  // Calculations
  let numberOfKeptImages = images.filter(image => !image.isDeleted && image.isKept).length;
  let numberOfMarkedImages = images.filter(image => !image.isDeleted && image.isMarkedForDeletion && !image.isKept).length;
  
  // Get currently filtered images based on filter state
  const filteredImages = images
    .filter((i: any) => !i.isDeleted)
    .filter((i: any) => {
      if (isFilteredView) {
        return filteredImageIds.includes(i.id);
      } else if (isKeptFilteredView) {
        return keptFilteredImageIds.includes(i.id);
      } else if (isMarkedFilteredView) {
        return markedFilteredImageIds.includes(i.id);
      }
      return true;
    });

  // Variables

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
          queryClient.invalidateQueries(['images', folder]);
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

  useQuery(['images', folder, isOpenOnlyKept], async() => {
    console.log('Fetching images for folder:', folder, 'isOpenOnlyKept:', isOpenOnlyKept);
    if (!folder) {
      console.log('No folder path provided');
      return [];
    }
    const data = await getPhotoListFromFolder(folder);
    console.log('Received images data:', data);
    if (data.length > 0) setIsImageListFetched(true);
    return data
  }, 
  {
    initialData: [],
    refetchOnWindowFocus: false,
    enabled: !!folder, // Only run query if folder is provided
    onSuccess: async (data) => {
      console.log('Query onSuccess called with data:', data);
      setIsImageListFetched(true);

      if (data.length > 0) {
        if (isOpenOnlyKept === 'true') {
          data = data.filter(image => image.isKept);
        } 

        setFirstRowWidth(calculateFirstRowWidth(data, numberOfColumns));
      } else {
        // If no images are returned, set loading as completed
        console.log('No images found, setting loading as completed');
        setIsLoadingCompletedAtStart(true);
        return;
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
    },
    onError: (error: any) => {
      console.error('Error fetching images:', error);
      setIsLoadingCompletedAtStart(true); // Stop the loading spinner
      setPopupOptions({
        isVisible: true,
        isYesNo: false,
        title: 'ERROR',
        message: 'Failed to load images from the selected folder. Please check if the folder exists and try again.',
      });
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
  function calculateFirstRowWidth (images: any[], numberOfColumns: number) {
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

  // Scrollbar Functions
  const calculateContentSize = () => {
    if (images.length === 0) return { width: 0, height: 0 };
    
    // Get actual DOM dimensions from main-element
    const mainElement = document.getElementById('main-element');
    
    if (mainElement) {
      // Use the actual scrollHeight and scrollWidth of the main element
      // Apply the current zoom scale to get the transformed dimensions
      const actualContentHeight = mainElement.scrollHeight * zoomScale;
      const actualContentWidth = mainElement.scrollWidth * zoomScale;
      
      return { width: actualContentWidth, height: actualContentHeight };
    }
    
    // Return zero dimensions if main element is not available
    return { width: 0, height: 0 };
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleScrollPositionChange = (x: number, y: number) => {
    setScrollPosition({ x, y });
  };

  const handleHorizontalScroll = (position: number) => {
    if (viewRef.current) {
      setIsScrolling(true);
      viewRef.current.setPosition(-position, viewRef.current.getPosition().y);
      const mainElement = document.getElementById('main-element');
      if (mainElement) {
        viewRef.current.applyTo(mainElement);
        // Trigger image quality update immediately for scrolling
        getVisibleImages();
        
        // Debounce the end of scrolling
        setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      }
    }
  };

  const handleVerticalScroll = (position: number) => {
    if (viewRef.current) {
      setIsScrolling(true);
      viewRef.current.setPosition(viewRef.current.getPosition().x, -position);
      const mainElement = document.getElementById('main-element');
      if (mainElement) {
        viewRef.current.applyTo(mainElement);
        // Trigger image quality update immediately for scrolling
        getVisibleImages();
        
        // Debounce the end of scrolling
        setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      }
    }
  };

  // Initialize custom view
  useEffect(() => {
    if (!viewRef.current) {
      viewRef.current = createView(handleScrollPositionChange);
    }
  }, []);

  // Update content size when images change or zoom changes
  useEffect(() => {
    const newContentSize = calculateContentSize();
    setContentSize(newContentSize);
  }, [images, numberOfColumns, padding, columnGap, zoomScale, firstRowWidth, viewportSize]);

  // Update viewport size on window resize
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ 
        width: window.innerWidth, 
        height: window.innerHeight  
      });
    };
    
    // Set initial viewport size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset loading state when images change
  useEffect(() => {
    console.log('Images changed, resetting loading state. New images length:', images.length);
    setLoadedImageCount(0);
    setIsLoadingCompletedAtStart(false);
  }, [images.length]);

  // Reset state when switching between "all images" and "kept only" views
  useEffect(() => {
    console.log('isOpenOnlyKept changed:', isOpenOnlyKept);
    setImages([]);
    setLoadedImageCount(0);
    setIsLoadingCompletedAtStart(false);
    setSelectedImageIds([]);
    setCurrentSelectedImage(null);
  }, [isOpenOnlyKept, folderPath]);

  // Trigger scrollbar recalculation when filter states change
  useEffect(() => {
    // Reset scroll position when entering filter views
    setScrollPosition({ x: 0, y: 0 });
    
    // Reset the viewport position
    if (viewRef.current) {
      viewRef.current.setPosition(0, 0);
      const mainElement = document.getElementById('main-element');
      if (mainElement) {
        viewRef.current.applyTo(mainElement);
      }
    }
    
    // Use setTimeout to ensure DOM has updated after filter changes
    const timer = setTimeout(() => {
      setScrollbarUpdateTrigger(prev => prev + 1);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [isFilteredView, isKeptFilteredView, isMarkedFilteredView, filteredImageIds, keptFilteredImageIds, markedFilteredImageIds]);

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

      if (isDragging || isScrolling) {
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
        queryClient.invalidateQueries(['images', folder]);
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
        handleScrollPositionChange,
        viewRef.current,
        isScrollToZoom,
      );

      return () => {
        cleanup();
        removeTrackedEventListeners(window, 'keyup');
        removeTrackedEventListeners(window, 'keydown');
      };
    }
  }, [isLoadingCompletedAtStart, isScrollToZoom]);

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
        handleScrollPositionChange,
        viewRef.current,
        isScrollToZoom,
      );
        addTrackedEventListener(window, 'keyup', handleKeyUp as EventListener);
        addTrackedEventListener(window, 'keydown', handleKeyDown as EventListener);
      return cleanup;
    }

    return () => {
      removeTrackedEventListeners(window, 'keyup');
      removeTrackedEventListeners(window, 'keydown');
    };
  }, [setIsGalleriaClosed, isGalleriaClosed, isScrollToZoom, isFilteredView]);

  useEffect(() => {
    addTrackedEventListener(window, 'click', handleClickOutside);
    addTrackedEventListener(window, 'touchend', handleClickOutside);
    
    return () => {
      removeTrackedEventListeners(window, 'click');
    };
  }, [isDragging, isLongTouch, isFilteredView]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // User-Event handlers
  const handleKeyDown = (event: any) => {
    if (event.ctrlKey) {
      setIsScrollToZoom((prev) => {
        return !prev;
      });
    }

    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      selectAllImages();
    }

    if (event.ctrlKey && event.key === 'g') {
      openGalleria(event);
    }
    
    if (event.key === 'Escape') {
      if (!isGalleriaClosed) {
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
      setIsScrollToZoom((prev) => !prev);
      if (squareRef.current) {
        document.body.removeChild(squareRef.current);
        squareRef.current = null;
      }
    }
  };

  const handleClickOutside = (event: any) => {
    // Don't clear selection if we're in the filtered selected images view
    if (isFilteredView) {
      return;
    }
    
    if (!event.ctrlKey && !isDragging && !isLongTouch && ((event.pointerType && event.pointerType === 'mouse') || (event.type === 'touchend'))) {
      const target = event.target as HTMLElement;
      
      // Check if the target or any parent element is disabled
      let element = target;
      let isDisabledElement = false;
      let isExcludedElement = false;
      
      // Traverse up the DOM tree to check for disabled state or exclusion classes
      while (element && element !== document.body) {       
        if (element.hasAttribute('disabled') || 
            element.classList.contains('disabled')) {
          isDisabledElement = true;
          break;
        }
        
        // Also check if this element contains any disabled buttons as direct children
        if (element.tagName === 'DIV') {
          const disabledButtons = element.querySelectorAll('button.disabled, button[disabled]');
          if (disabledButtons.length > 0) {
            // Check if the click happened within any of these disabled buttons
            const rect = element.getBoundingClientRect();
            const clickX = event.clientX;
            const clickY = event.clientY;
            
            for (const disabledButton of disabledButtons) {
              const buttonRect = disabledButton.getBoundingClientRect();
              if (clickX >= buttonRect.left && clickX <= buttonRect.right &&
                  clickY >= buttonRect.top && clickY <= buttonRect.bottom) {
                isDisabledElement = true;
                break;
              }
            }
          }
          
          if (isDisabledElement) break;
        }
        
        if (element.classList.contains('no-selection-removal-on-click') ||
            element.classList.contains('p-icon') ||
            element.classList.contains('p-button-label') ||
            element.classList.contains('p-button-icon')) {
          isExcludedElement = true;
          break;
        }
        
        element = element.parentElement as HTMLElement;
      }
      
      if (target.tagName !== 'IMG' 
        && target.tagName !== 'BUTTON' 
        && target.tagName !== 'I' 
        && target.tagName !== 'path' 
        && !isDisabledElement
        && !isExcludedElement) {
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
            // Find indices in the filtered images array
            const currentSelectedIndexInFiltered = filteredImages.findIndex((img) => img.id === getCurrentSelectedImage().id);
            const clickedIndexInFiltered = filteredImages.findIndex((img) => img.id === imageId);
            
            if (currentSelectedIndexInFiltered !== -1 && clickedIndexInFiltered !== -1) {
              const start = Math.min(currentSelectedIndexInFiltered, clickedIndexInFiltered);
              const end = Math.max(currentSelectedIndexInFiltered, clickedIndexInFiltered);

              const newSelectedImageIds = filteredImages.slice(start, end + 1).map((img) => img.id);
              setSelectedImageIds((prevIds) => Array.from(new Set([...prevIds, ...newSelectedImageIds])));
            }
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

        queryClient.setQueryData(['images', folder, isOpenOnlyKept], (oldImages: any) => {
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
      queryClient.setQueryData(['images', folder, isOpenOnlyKept], (oldImages: any) => {
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
      queryClient.setQueryData(['images', folder, isOpenOnlyKept], (oldImages: any) => {
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
    // Clear any existing timeout when entering
    if (headerCloseTimeout) {
      clearTimeout(headerCloseTimeout);
      setHeaderCloseTimeout(null);
    }
    e.currentTarget.style.transform = 'translateY(0%)';
    e.currentTarget.style.backgroundColor = 'rgba(32, 32, 32, .95)';
    setIsHeaderOpened(true);
  };

  const handleMouseLeaveHeader = (e: any) => {
    if (!isHeaderPinned) {
      // Store reference to the current target before the timeout
      const headerElement = e.currentTarget;
      // Set a 2-second delay before closing the header
      const timeout = setTimeout(() => {
        headerElement.style.transform = 'translateY(-100%)';
        headerElement.style.backgroundColor = 'rgba(32, 32, 32, .98)';
        setIsHeaderOpened(false);
        setHeaderCloseTimeout(null);
      }, 700);
      setHeaderCloseTimeout(timeout);
    }
  };

  const handleHeaderHandleClick = (e: any) => {
    e.stopPropagation(); // Prevent triggering parent mouse events
    
    if (!isHeaderOpened) {
      // If header is closed, open it first
      setIsHeaderOpened(true);
    } else {
      // If header is open, toggle pin state
      setIsHeaderPinned(!isHeaderPinned);
    }
  };

  const handleOnloadImg = () => {
    //  DO NOT DELETE COMMENT: This if statement is put here so that if an image is deleted after the initial load the following updates will not happen
    //  DO NOT DELETE COMMENT: If following updates happen upon image deletion, clicks freeze until all the images are parsed again and all thse updates complete.
    if(!isLoadingCompletedAtStart) {
      if (isGalleriaClosed !== true) {
        setLoadedImageCount(prevCount => {
          const newCount = prevCount + 1;
          console.log(`Image loaded: ${newCount}/${images.length}`);
          
          // Check if this is the last image to load
          const deletedImgCount = images.filter((i: any) => i['isDeleted'] === true).length;
          const targetCount = images.length - deletedImgCount - 1;
          
          console.log(`Loading progress: ${newCount}/${targetCount} (total images: ${images.length}, deleted: ${deletedImgCount})`);
          
          if (newCount === images.length - 1) {
            setIsCachingCompleted(true);
            setImagesElements(Array.from(document.getElementById('main-element')!.getElementsByTagName('img')));
          }
          
          if (images.length > 0 && newCount === targetCount) {
            console.log('All images loaded! Setting loading completed.');
            setIsLoadingCompletedAtStart(true);
          }
          
          return newCount;
        });
        setIsCachingCompleted(false);
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

  // Cleanup header timeout on unmount
  useEffect(() => {
    return () => {
      if (headerCloseTimeout) {
        clearTimeout(headerCloseTimeout);
      }
    };
  }, [headerCloseTimeout]);

  // Make overflow info available everywhere
  const [overflow, setOverflow] = useState({
    horizontal: false,
    vertical: false,
    actualContentBounds: { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 },
    viewportBounds: { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 }
  });

  // Function to check content overflow (can be used anywhere)
  const checkContentOverflow = useCallback(() => {
    const mainElement = document.getElementById('main-element');
    const rootElement = document.getElementById('root');
    if (!mainElement || !rootElement) return {
      horizontal: false,
      vertical: false,
      actualContentBounds: { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 },
      viewportBounds: { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 }
    };

    const rootRect = rootElement.getBoundingClientRect();
    const images = mainElement.querySelectorAll('img, .image-card');
    if (images.length === 0) return {
      horizontal: false,
      vertical: false,
      actualContentBounds: { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 },
      viewportBounds: { width: rootRect.width, height: rootRect.height, left: rootRect.left, top: rootRect.top, right: rootRect.right, bottom: rootRect.bottom }
    };

    let minLeft = Infinity, minTop = Infinity;
    let maxRight = -Infinity, maxBottom = -Infinity;
    images.forEach(img => {
      const imgRect = img.getBoundingClientRect();
      minLeft = Math.min(minLeft, imgRect.left);
      minTop = Math.min(minTop, imgRect.top);
      maxRight = Math.max(maxRight, imgRect.right);
      maxBottom = Math.max(maxBottom, imgRect.bottom);
    });

    const actualContentBounds = {
      left: minLeft,
      top: minTop,
      right: maxRight,
      bottom: maxBottom,
      width: maxRight - minLeft,
      height: maxBottom - minTop
    };

    const viewportBounds = {
      left: rootRect.left,
      top: rootRect.top,
      right: rootRect.right,
      bottom: rootRect.bottom,
      width: rootRect.width,
      height: rootRect.height
    };

    const horizontalOverflow = actualContentBounds.left < rootRect.left || actualContentBounds.right > rootRect.right;
    const verticalOverflow = actualContentBounds.top < rootRect.top || actualContentBounds.bottom > rootRect.bottom;

    return {
      horizontal: horizontalOverflow,
      vertical: verticalOverflow,
      actualContentBounds,
      viewportBounds
    };
  }, []);

  // Debounced overflow update for performance
  useEffect(() => {
    let frame: number | null = null;
    let timeout: NodeJS.Timeout | null = null;
    const update = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setOverflow(checkContentOverflow());
      });
    };
    // Debounce with a short timeout (e.g. 100ms)
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(update, 100);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (timeout) clearTimeout(timeout);
    };
  }, [scrollbarUpdateTrigger, images, zoomScale, viewportSize.width, viewportSize.height]);

  // Memoized scrollbar calculation that depends on overflow
  const scrollbarElements = useMemo(() => {
    const dynamicContentSize = {
      width: overflow.actualContentBounds.width || contentSize.width,
      height: overflow.actualContentBounds.height || contentSize.height
    };
    return (
      <>
        {/* Always render scrollbars but control visibility with animations */}
        <CustomScrollbar
          orientation="vertical"
          contentSize={dynamicContentSize.height}
          viewportSize={isHeaderPinned ? viewportSize.height - 100 : viewportSize.height}
          scrollPosition={scrollPosition.y}
          onScroll={handleVerticalScroll}
          bothScrollbarsVisible={overflow.vertical && overflow.horizontal}
          topOffset={isHeaderPinned ? 100 : 0}
          isVisible={overflow.vertical && isGalleriaClosed !== false}
        />
        <CustomScrollbar
          orientation="horizontal"
          contentSize={dynamicContentSize.width}
          viewportSize={viewportSize.width}
          scrollPosition={scrollPosition.x}
          onScroll={handleHorizontalScroll}
          bothScrollbarsVisible={overflow.vertical && overflow.horizontal}
          isVisible={overflow.horizontal && isGalleriaClosed !== false}
        />
        {/* Scrollbar corner - only show if both scrollbars are visible AND gallery is closed */}
        <div 
          className="scrollbar-corner"
          style={{
            opacity: (overflow.vertical && overflow.horizontal && isGalleriaClosed !== null) ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: (overflow.vertical && overflow.horizontal && isGalleriaClosed !== null) ? 'auto' : 'none'
          }}
        />
      </>
    );
  }, [overflow, contentSize, viewportSize, scrollPosition, isHeaderPinned, handleVerticalScroll, handleHorizontalScroll, isGalleriaClosed]);

  return (
    images && images.length > 0 ? (
    <>
  <ToolbarToggle />
    <div
      id='header'
      className={`header position-absolute vh-10 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center p-0 no-selection-removal-on-click ${isHeaderOpened ? 'header-opened' : ''}`}
      style={{
        backgroundColor: 'rgba(32, 32, 32, .98)',
        width: '100%',
        height: '100px',
        position: 'absolute',
        zIndex: 2,
        transition: 'transform 0.3s ease-in-out, background-color 0.3s ease', 
        transform: isHeaderPinned ? 'translateY(0%)' : 'translateY(-100%)',
      }}
      onMouseEnter={handleMouseEnterHeader}
      onMouseLeave={handleMouseLeaveHeader}
      onTouchStart={isHeaderOpened ? handleMouseLeaveHeader : handleMouseEnterHeader}
    >
      <div
        className='header-handle no-selection-removal-on-click'
        onClick={handleHeaderHandleClick}
        onTouchEnd={handleHeaderHandleClick}
      >
        <i 
          className={`bi header-handle-icon no-selection-removal-on-click ${!isHeaderOpened ? 'bi-chevron-compact-down' : (isHeaderPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle')}`}
        ></i>
      </div>
      <div className='row align-self-center w-100'>
        <div 
          key='scroll-zoom-toggle'
          className='col-1 d-flex align-items-center justify-content-center no-selection-removal-on-click'>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className='no-selection-removal-on-click'>
            <span style={{ color: 'white', fontSize: '14px' }} className='no-selection-removal-on-click'>Scroll:</span>
            <label style={{ 
              position: 'relative', 
              display: 'inline-block', 
              width: '50px', 
              height: '24px',
              cursor: 'pointer'
            }} className='no-selection-removal-on-click'>
              <input
                type="checkbox"
                checked={isScrollToZoom}
                onChange={(e) => setIsScrollToZoom(e.target.checked)}
                style={{
                  opacity: 0,
                  width: 0,
                  height: 0
                }}
                className='no-selection-removal-on-click'
              />
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isScrollToZoom ? '#4CAF50' : '#ccc',
                borderRadius: '24px',
                transition: '0.3s',
                cursor: 'pointer'
              }} className='no-selection-removal-on-click'>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: isScrollToZoom ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  cursor: 'pointer'
                }} className='no-selection-removal-on-click'></span>
              </span>
            </label>
            <span style={{ color: 'white', fontSize: '12px' }} className='no-selection-removal-on-click'>
              {isScrollToZoom ? 'Zoom' : 'Pan'}
            </span>
          </div>
        </div>
        <div
          key='all-images'
          className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
          <div style={{ position: 'relative', display: 'inline-block' }} className='no-selection-removal-on-click'>
            <i
              className={`col bi bi-images no-selection-removal-on-click ${!isFilteredView && !isKeptFilteredView && !isMarkedFilteredView ? 'clicked-white' : ''}`}
              style={{        
                display: 'block', 
                fontSize: '45px', 
                color: !isFilteredView && !isKeptFilteredView && !isMarkedFilteredView ? 'white' : 'gray',
                transition: 'color 0.3s ease, background-color 0.3s ease',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title={`${images.filter(img => !img.isDeleted).length} Total Images - Show all images`}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                // Reset all filter states to show all images
                setIsFilteredView(false);
                setFilteredImageIds([]);
                setIsKeptFilteredView(false);
                setKeptFilteredImageIds([]);
                setIsMarkedFilteredView(false);
                setMarkedFilteredImageIds([]);
                // Reset scroll position
                const imagesContainer = document.querySelector('.images-container');
                if (imagesContainer) {
                  imagesContainer.scrollTop = 0;
                }
              }}
              onTouchEnd={() => {
                // Reset all filter states to show all images
                setIsFilteredView(false);
                setFilteredImageIds([]);
                setIsKeptFilteredView(false);
                setKeptFilteredImageIds([]);
                setIsMarkedFilteredView(false);
                setMarkedFilteredImageIds([]);
                // Reset scroll position
                const imagesContainer = document.querySelector('.images-container');
                if (imagesContainer) {
                  imagesContainer.scrollTop = 0;
                }
              }}
            ></i>
            <span style={{
              position: 'absolute',
              top: '15px',
              right: '0px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              borderRadius: '50%',
              fontSize: '11px',
              fontWeight: 'bold',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {images.filter(img => !img.isDeleted).length}
            </span>
          </div>
        </div>
        <div
          key='selected-count'
          className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
          <IconWithBadge
            iconClass="bi bi-hand-index"
            count={selectedImageIds.length}
            isActive={selectedImageIds.length > 0}
            isFilteredView={isFilteredView}
            title={`${selectedImageIds.length > 0 ? selectedImageIds.length + ' Selected - ' : ''}${isFilteredView ? 'Show all' : 'View selected only'}`}
            filteredIds={filteredImageIds}
            setFilteredIds={setFilteredImageIds}
            setIsFilteredView={setIsFilteredView}
            otherFilterStates={{
              setIsOtherFilteredView: setIsKeptFilteredView,
              setOtherFilteredIds: setKeptFilteredImageIds,
              setIsOtherFilteredView2: setIsMarkedFilteredView,
              setOtherFilteredIds2: setMarkedFilteredImageIds
            }}
            getIdsToFilter={() => selectedImageIds}
            filteredColorClass="clicked-blue"
            onKeepAll={() => {
              // Keep all selected images
              const selectedImages = images.filter(img => selectedImageIds.includes(img.id));
              selectedImages.forEach(image => {
                if (!image.isKept) {
                  toggleKeepPhotoMutation.mutate(image);
                }
              });
            }}
            onUnkeepAll={() => {
              // Unkeep all selected images
              const selectedImages = images.filter(img => selectedImageIds.includes(img.id));
              selectedImages.forEach(image => {
                if (image.isKept) {
                  toggleKeepPhotoMutation.mutate(image);
                }
              });
            }}
          />
        </div>
        <div
          key='kept-images'
          className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
          <IconWithBadge
            iconClass="bi bi-bag-check"
            count={numberOfKeptImages}
            isActive={numberOfKeptImages > 0}
            isFilteredView={isKeptFilteredView}
            title={`${numberOfKeptImages > 0 ? numberOfKeptImages + ' Kept - ' : ''}${isKeptFilteredView ? 'Show all' : 'View kept only'}`}
            filteredIds={keptFilteredImageIds}
            setFilteredIds={setKeptFilteredImageIds}
            setIsFilteredView={setIsKeptFilteredView}
            otherFilterStates={{
              setIsOtherFilteredView: setIsFilteredView,
              setOtherFilteredIds: setFilteredImageIds,
              setIsOtherFilteredView2: setIsMarkedFilteredView,
              setOtherFilteredIds2: setMarkedFilteredImageIds
            }}
            getIdsToFilter={() => images.filter(img => !img.isDeleted && img.isKept).map(img => img.id)}
            filteredColorClass="clicked-green"
            onEnterFilter={() => {
              setSelectedImageIds([]);
              setCurrentSelectedImage(null);
            }}
          />
        </div>
        <div
          key='marked-for-deletion'
          className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
          <IconWithBadge
            iconClass="bi bi-trash3-fill"
            count={numberOfMarkedImages}
            isActive={numberOfMarkedImages > 0}
            isFilteredView={isMarkedFilteredView}
            title={`${numberOfMarkedImages > 0 ? numberOfMarkedImages + ' Marked - ' : ''}${isMarkedFilteredView ? 'Show all' : 'View marked only'}`}
            filteredIds={markedFilteredImageIds}
            setFilteredIds={setMarkedFilteredImageIds}
            setIsFilteredView={setIsMarkedFilteredView}
            otherFilterStates={{
              setIsOtherFilteredView: setIsFilteredView,
              setOtherFilteredIds: setFilteredImageIds,
              setIsOtherFilteredView2: setIsKeptFilteredView,
              setOtherFilteredIds2: setKeptFilteredImageIds
            }}
            getIdsToFilter={() => images.filter(img => !img.isDeleted && img.isMarkedForDeletion && !img.isKept).map(img => img.id)}
            filteredColorClass="clicked-orange"
            onEnterFilter={() => {
              setSelectedImageIds([]);
              setCurrentSelectedImage(null);
            }}
          />
        </div>
        <div
          key='select-all'
          className='col-1 d-flex justify-content-center align-items-center'>
          <i
            className={`col bi bi-share`}
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
        marginTop: isHeaderPinned ? '100px' : '0px',
        transformOrigin: origin, // Dynamic transform-origin based on mouse position
        transform: 'matrix(1, 0, 0, 1, 0, 0)',
        transition: 'margin-top 0.3s ease-in-out',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e, { x: startPoint?.x, y: startPoint?.y })}
      onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
    >
      {filteredImages
        .map((image, index) => (
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
            isInFilteredView={isFilteredView || isKeptFilteredView || isMarkedFilteredView}
          />
      ))}
    </div>

    {isGalleriaClosed === false && 
      <div style={{ position: 'fixed', inset: 0, zIndex: 1001 }}>
        <PhotoGalleria 
          images={images} 
          setIsGalleriaClosed={setIsGalleriaClosed} 
          setCurrentSelectedImage={setCurrentSelectedImage} 
          getCurrentSelectedImage={getCurrentSelectedImage}
          handleDeleteOnClick={handleDeleteOnClick}
          handleKeepOnClick={handleKeepOnClick}
          isKeepButtonDisabled={isKeepButtonDisabled}
        />
      </div>
    }
    <ModalPopup 
      popupOptions ={popupOptions}
      setPopupOptions={setPopupOptions}
      handleDeleteImages={handleDeleteImages}
    ></ModalPopup>

    {!isLoadingCompletedAtStart && (
      LoadingSpinner({text: 'Rendering images...'})
    )}

  {/* Custom Scrollbars */}
  {/* Pagination controls sticky footer (z-index: 100, below galleria) */}
  <div style={{ position: 'sticky', bottom: 0, zIndex: 100, width: '100%' }}>
    {scrollbarElements}
  </div>

  {/* Sticky Pagination Footer: hide when galleria is open */}
  {/* Always render sticky pagination footer, even when galleria is open */}
  <div style={{
    position: 'fixed',
    left: 0,
    width: '100%',
    zIndex: 100,
    pointerEvents: 'none',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'margin-bottom 0.2s ease',
    marginBottom: overflow.horizontal ? 20 : 0
  }}>
    <div style={{ pointerEvents: 'auto', width: 'fit-content' }}>
      <PaginationControls currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  </div>
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