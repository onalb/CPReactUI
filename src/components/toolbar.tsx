import React, { useState, useEffect } from 'react';
import '../styles/toolbar.css';

interface ToolbarProps {
  selectAllImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  handleDeleteMarkedImages: () => void;
  handleDeleteSelectedImages: () => void;
  setPopupOptions: (opts: any) => void;
  images: any[];
  filteredImages: any[];
  selectedImageIds: number[];
  setImages: (fn: (prevImages: any[]) => any[]) => void;
  resetMainElement?: () => void;
  handleHorizontalScroll?: (position: number) => void;
  handleVerticalScroll?: (position: number) => void;
  scrollPosition?: { x: number, y: number };
  contentSize?: { width: number, height: number };
  viewportSize?: { width: number, height: number };
  zoomScale?: number;
}


const Toolbar: React.FC<ToolbarProps> = ({
  selectAllImages,
  setHandleDeleteImages,
  handleDeleteMarkedImages,
  handleDeleteSelectedImages,
  setPopupOptions,
  images,
  filteredImages,
  selectedImageIds,
  setImages,
  resetMainElement,
  handleHorizontalScroll,
  handleVerticalScroll,
  scrollPosition,
  contentSize,
  viewportSize,
  zoomScale
}) => {
  // Scroll right logic using handleHorizontalScroll
  const SCROLL_STEP = 500; // px per click - increased from 200 for faster horizontal movement
  // State to track if scroll-right is in down mode
  const [scrollDownMode, setScrollDownMode] = useState(false);
  // State to track if animation is currently running
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // If at rightmost edge, enable down arrow mode
    if (
      scrollPosition &&
      contentSize &&
      viewportSize &&
      scrollPosition.x >= Math.max(contentSize.width - viewportSize.width, 0)
    ) {
      setScrollDownMode(true);
    } else {
      setScrollDownMode(false);
    }
  }, [scrollPosition, contentSize, viewportSize]);

  const scrollContentRightOrDown = () => {
    // Prevent click if animation is already running
    if (isAnimating) return;
    
    if (!handleHorizontalScroll || !handleVerticalScroll || !scrollPosition || !contentSize || !viewportSize) return;
    const contentWidth = contentSize.width;
    const viewportWidth = viewportSize.width;
    const contentHeight = contentSize.height;
    const viewportHeight = viewportSize.height;
    let currentScrollX = scrollPosition.x;
    let currentScrollY = scrollPosition.y;

    // Set animation state
    setIsAnimating(true);

    if (scrollDownMode) {
      // Scroll down by one card size scaled by zoom and jump to leftmost edge
      const BASE_CARD_HEIGHT = 350; // Base card height at 1x zoom
      const scaledCardHeight = BASE_CARD_HEIGHT * (zoomScale || 1); // Scale by zoom factor
      let targetScrollY = Math.min(currentScrollY + scaledCardHeight, contentHeight - viewportHeight);
      let targetScrollX = 0; // Jump to leftmost edge
      
      // Two-stage animation: first animate left, then animate down
      animateTwoStage(currentScrollX, currentScrollY, targetScrollX, targetScrollY);
      setScrollDownMode(false); // Switch back to right arrow mode
    } else {
      // Normal scroll right: only update horizontal scroll
      if (contentWidth <= viewportWidth) {
        setIsAnimating(false); // Reset animation state if no scroll needed
        return;
      }
      let targetScrollX = currentScrollX + SCROLL_STEP;
      if (targetScrollX > contentWidth - viewportWidth) targetScrollX = contentWidth - viewportWidth;
      
      // Animate horizontal movement
      animateScroll(currentScrollX, currentScrollY, targetScrollX, currentScrollY, 200); // 400ms duration
    }
  };

  // Two-stage animation: animate down first, then left
  const animateTwoStage = (fromX: number, fromY: number, toX: number, toY: number) => {
    // Stage 1: Animate vertical movement down
    const animateVertical = () => {
      const startTime = performance.now();
      const duration = 300; // 300ms for down movement
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (ease-out)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentY = fromY + (toY - fromY) * easeOutQuart;
        
        if (handleVerticalScroll) {
          handleVerticalScroll(currentY);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Start stage 2: horizontal movement
          animateHorizontal();
        }
      };
      
      requestAnimationFrame(animate);
    };
    
    // Stage 2: Animate horizontal movement to the left
    const animateHorizontal = () => {
      const startTime = performance.now();
      const duration = 400; // 400ms for left movement
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (ease-out)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentX = fromX + (toX - fromX) * easeOutQuart;
        
        if (handleHorizontalScroll) {
          handleHorizontalScroll(currentX);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete, reset animation state
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    };
    
    // Start with vertical animation
    animateVertical();
  };

  // Smooth animation function for vertical-only movement
  const animateVerticalOnly = (fromY: number, toY: number, duration: number) => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (ease-out)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentY = fromY + (toY - fromY) * easeOutQuart;
      
      if (handleVerticalScroll) {
        handleVerticalScroll(currentY);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Smooth animation function using requestAnimationFrame
  const animateScroll = (fromX: number, fromY: number, toX: number, toY: number, duration: number) => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (ease-out)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentX = fromX + (toX - fromX) * easeOutQuart;
      const currentY = fromY + (toY - fromY) * easeOutQuart;
      
      if (handleHorizontalScroll && handleVerticalScroll) {
        handleHorizontalScroll(currentX);
        handleVerticalScroll(currentY);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete, reset animation state
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };
  // State for disabling delete marked icon
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);
  const [clickedCircle, setClickedCircle] = useState<number | null>(null);
  const [isDeleteMarkedForDeletionDisabled, setIsDeleteMarkedForDeletionDisabled] = useState(true);
  const [isDeleteSelectedImagesDisabled, setIsDeleteSelectedImagesDisabled] = useState(selectedImageIds.length === 0);

  // Define toolbar icons with all attributes
  // Calculate badge counts for each action
  const deleteSelectedCount = images.filter(img => selectedImageIds.includes(img.id) && !img.isKept).length;
  const deleteMarkedCount = images.filter(img => img.isMarkedForDeletion && !img.isKept).length;
  // Only count selected images that are not kept and not already marked
  const markSelectedCount = images.filter(img => selectedImageIds.includes(img.id) && !img.isMarkedForDeletion && !img.isKept).length;
  const keepSelectedCount = images.filter(img => selectedImageIds.includes(img.id) && !img.isKept).length;

  const allFilteredSelected = filteredImages.length > 0 && filteredImages.every(img => selectedImageIds.includes(img.id));
  const toolbarIcons = [
    {
      name: 'scrollRight',
      index: 98,
      id: 'scroll-right',
      element: scrollDownMode 
        ? <i className="bi bi-arrow-down-circle scroll-down-icon" />
        : <i className="bi bi-arrow-right-circle scroll-right-icon" />,
      title: isAnimating 
        ? 'ANIMATING...' 
        : (scrollDownMode ? 'SCROLL DOWN & JUMP LEFT' : 'SCROLL RIGHT'),
      color: isAnimating ? '#888' : '#ffb347',
      onClick: isAnimating ? undefined : scrollContentRightOrDown,
      badge: null,
      disabled: isAnimating,
    },
    {
      name: 'resetZoom',
      index: 99,
      id: 'reset-zoom',
      element: <i className="bi bi-arrow-counterclockwise reset-zoom-icon" />,
      title: 'RESET ZOOM & POSITION',
      color: '#ffb347',
      onClick: () => {
        console.log('Resetting zoom and position from toolbar1');
        if (typeof resetMainElement === 'function') {
          resetMainElement();
        }
      },
      badge: null,
    },
    {
      name: 'selectAll',
      index: 0,
      id: 'select-all',
      element: <i className="bi bi-check2-all select-all-icon" />,
      title: 'SELECT ALL',
      pointerEvents: 'auto',
      color: '#18d9fcff',
      onClick: selectAllImages,
      badge: filteredImages.length > 0 ? filteredImages.length : 0,
      badgeColor: allFilteredSelected ? undefined : '#888',
    },
    {
      name: 'deleteSelected',
      index: 1,
      id: 'delete-selected',
      element: <i className="bi bi-trash-fill delete-selected-icon" />,
      title: deleteSelectedCount > 0 ? `DELETE ${deleteSelectedCount} SELECTED` : 'DELETE SELECTED',
      pointerEvents: deleteSelectedCount === 0 ? 'none' : 'auto',
      color: deleteSelectedCount === 0 ? 'gray' : 'white',
      onClick: deleteSelectedCount === 0 ? undefined : () => {
        setHandleDeleteImages(() => handleDeleteSelectedImages);
        setPopupOptions({
          isVisible: true,
          isYesNo: true,
          title: 'DELETE',
          message: 'You are about to delete all SELECTED images. Are you sure you want to proceed?'
        });
      },
      badge: deleteSelectedCount > 0 ? deleteSelectedCount : 0,
    },
    {
      name: 'deleteMarked',
      index: 2,
      id: 'delete-marked',
      element: <i className="bi bi-cart-x delete-marked-icon" />,
      title: deleteMarkedCount > 0 ? `DELETE ${deleteMarkedCount} MARKED` : 'DELETE MARKED',
      pointerEvents: deleteMarkedCount === 0 ? 'none' : 'auto',
      color: deleteMarkedCount === 0 ? 'gray' : 'rgb(255, 100, 100)',
      onClick: deleteMarkedCount === 0 ? undefined : () => {
        setHandleDeleteImages(() => handleDeleteMarkedImages);
        setPopupOptions({
          isVisible: true,
          isYesNo: true,
          title: 'DELETE',
          message: 'You are about to delete all the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?'
        });
      },
      badge: deleteMarkedCount > 0 ? deleteMarkedCount : 0,
    },
    {
      name: 'markSelectedForDeletion',
      index: 3,
      id: 'mark-selected-for-deletion',
      element: <i className="bi bi-cart-plus mark-selected-icon" />,
      title: markSelectedCount > 0 ? `MARK ${markSelectedCount} SELECTED FOR DELETION` : 'MARK SELECTED FOR DELETION',
      pointerEvents: markSelectedCount === 0 ? 'none' : 'auto',
      color: markSelectedCount === 0 ? 'gray' : 'rgb(255, 193, 100)',
      onClick: markSelectedCount === 0 ? undefined : () => {
        setImages((prevImages: any[]) =>
          prevImages.map((img) =>
            selectedImageIds.includes(img.id) && !img.isKept && !img.isMarkedForDeletion
              ? { ...img, isMarkedForDeletion: true }
              : img
          )
        );
      },
      badge: markSelectedCount > 0 ? markSelectedCount : 0,
    },
    {
      name: 'keepSelected',
      index: 5,
      id: 'keep-selected',
      element: <i className="bi bi-bag-check keep-selected-icon" />,
      title: keepSelectedCount > 0 ? `KEEP ${keepSelectedCount} SELECTED` : 'KEEP SELECTED',
      pointerEvents: keepSelectedCount === 0 ? 'none' : 'auto',
      color: keepSelectedCount === 0 ? 'gray' : 'rgb(25, 255, 79)',
      onClick: keepSelectedCount === 0 ? undefined : () => {
        setImages((prevImages: any[]) =>
          prevImages.map((img) =>
            selectedImageIds.includes(img.id)
              ? { ...img, isKept: true }
              : img
          )
        );
      },
      badge: keepSelectedCount > 0 ? keepSelectedCount : 0,
    },
  ];

  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const anyMarked = Array.isArray(images) && images.some((i: any) => i.isMarkedForDeletion === true);
    setIsDeleteMarkedForDeletionDisabled(!anyMarked);
  }, [images]);

  useEffect(() => {
    setIsDeleteSelectedImagesDisabled(selectedImageIds.length === 0);
  }, [selectedImageIds]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 40) {
        setIsToolbarOpen(true);
      } else if (e.clientX > 130 && !isPinned) {
        setIsToolbarOpen(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPinned]);

  return (
    <div 
      id="toolbar-container"
      className='no-selection-removal-on-click toolbar-container'
    >
      <div 
        className={`circle${isToolbarOpen ? ' circle-open' : ''}`}
        style={{ opacity: isToolbarOpen ? 1 : 0.9 }}
        onClick={() => {
          setIsPinned(!isPinned);
          setIsToolbarOpen(isPinned ? false : true);
        }}
        onMouseEnter={() => { setIsToolbarOpen(true) }}
      >
        <span 
          className='gear-icon'
          onClick={() => {
            setIsPinned(!isPinned);
            setIsToolbarOpen(isPinned ? false : true);
          }}
        >⚙</span>
      </div>
      <div
        className={`no-selection-removal-on-click toolbar-panel${isToolbarOpen ? ' open' : ''}`}
      >
        {toolbarIcons.map((iconObj) => {
          const isEnabled = !iconObj.disabled && (iconObj.name === 'resetZoom' || iconObj.badge === null || (iconObj.badge !== null && iconObj.badge > 0));
          return (
            <div
              id={iconObj.id}
              key={iconObj.index}
              className={`circle${clickedCircle === iconObj.index ? ' circle-clicked' : (hoveredCircle === iconObj.index && isEnabled) ? ' circle-hovered' : ''}${!isEnabled ? ' circle-disabled' : ''}`}
              style={{
                cursor: isEnabled ? 'pointer' : 'not-allowed',
                color: iconObj.color,
                position: 'relative',
              }}
              title={iconObj.title}
              onMouseEnter={() => setHoveredCircle(iconObj.index)}
              onMouseLeave={() => setHoveredCircle(null)}
              onMouseDown={() => setClickedCircle(iconObj.index)}
              onMouseUp={() => setClickedCircle(null)}
              onClick={isEnabled ? iconObj.onClick : undefined}
              onTouchEnd={isEnabled ? iconObj.onClick : undefined}
            >
              {iconObj.element}
              {iconObj.badge !== null && iconObj.badge > 0 && (
                <span 
                  className="toolbar-badge"
                  style={iconObj.badgeColor ? { background: iconObj.badgeColor } : {}}
                >
                  {iconObj.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;