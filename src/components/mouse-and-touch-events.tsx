import { ScrollOrZoomMode } from './constants';
import { addTrackedEventListener, removeTrackedEventListeners } from './tracked-event-handler';

const applyMouseAndTouchEvents = (
  elementId: string,
  squareRef: any, 
  numberOfImages: number = 1,
  setZoomScale?: any, 
  setIsDragging?: any, 
  setIsZooming?: any, 
  setIsLongTouch?: any, 
  handleClientMouseUp?: any, 
  getVisibleImages?: any,
  squareSelection?: any,
  openImageOnNewTab?: any,
  onScrollPositionChange?: (x: number, y: number) => void,
  customView?: any,
  scrollOrZoomMode?: ScrollOrZoomMode,
) => {
  console.log(scrollOrZoomMode)
  // Use custom view if provided, otherwise use global view
  const currentView = customView || view;
  
  let isDragging = false;
  let lastPosX = 0;
  let lastPosY = 0;
  let initialDistance = 0;
  let isTouchDragging = false;
  let touchMoved = false;
  let clickDispatched = false;
  let doubleClickDispatched = false;
  let longTapTimeout: number | null = null;
  let isLongTouch = false;
  let startPoint: any = null;
  let touchDeltaX = 0;
  let touchDeltaY = 0;

  const applyLongTouch = (event: any) => {
    if (event.touches && event.touches.length > 1) { return }
    const touches = event.touches && event.touches[0] || event;

    longTapTimeout = window.setTimeout(() => {
      isLongTouch = true;
      setIsLongTouch(true);
      isDragging = false;

      if (isLongTouch) { 
        squareSelection(touches);
        startPoint = { x: touches.clientX, y: touches.clientY };
      }

      const cursorSquare = document.createElement('div');
      cursorSquare.id = 'cursor-square';
      cursorSquare.style.left = `${touches.clientX}px`;
      cursorSquare.style.top = `${touches.clientY}px`;
      document.body.appendChild(cursorSquare);
      cursorSquare.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';

      setTimeout(() => {
        if (cursorSquare) {
          cursorSquare.style.transform = 'scale(25)';
          cursorSquare.style.opacity = '0.5'
        }

        setTimeout(() => {
          if (cursorSquare) {
            cursorSquare.style.transform = 'scale(50)';
            cursorSquare.style.opacity = '0'
            setTimeout(() => {
              cursorSquare.remove();
            }, 200);
          }
        }, 200);
      }, 200);
    }, 800);
  }

  const handleMouseDown = (event: any) => {
    // Check if the event target is a scrollbar element
    const target = event.target as HTMLElement;
    if (target && (
      target.classList.contains('custom-scrollbar-track') ||
      target.classList.contains('custom-scrollbar-thumb') ||
      target.closest('.custom-scrollbar-track')
    )) {
      return; // Don't handle mouse events on scrollbars
    }

    isLongTouch = false;
    setIsLongTouch(false);
    event.preventDefault();

    if (!event.ctrlKey) {
      setIsDragging(false); // this is to track if it is dragging for the image-grid
      isDragging = true; // this is for internal use. Mousedown starts dragging
      lastPosX = event.clientX;
      lastPosY = event.clientY;
      applyLongTouch(event);
    }
  };

  const handleMouseMove = (event: any) => {
    // Check if the event target is a scrollbar element
    const target = event.target as HTMLElement;
    if (target && (
      target.classList.contains('custom-scrollbar-track') ||
      target.classList.contains('custom-scrollbar-thumb') ||
      target.closest('.custom-scrollbar-track')
    )) {
      return; // Don't handle mouse events on scrollbars
    }

    if (longTapTimeout) {
      clearTimeout(longTapTimeout);
      longTapTimeout = null;
    }

    if (isLongTouch) {
      if (startPoint && squareRef.current) {
        const width = event.clientX - startPoint.x;
        const height = event.clientY - startPoint.y;
        squareRef.current.style.width = `${Math.abs(width)}px`;
        squareRef.current.style.height = `${Math.abs(height)}px`;
        squareRef.current.style.left = `${Math.min(event.clientX, startPoint.x)}px`;
        squareRef.current.style.top = `${Math.min(event.clientY, startPoint.y)}px`;
      }
    } 

    if (isDragging) {
      // Check if mouse button is still pressed - if not, stop dragging
      if (event.buttons === 0) {
        isDragging = false;
        setIsDragging(false);
        return;
      }
      
      const dx = event.clientX - lastPosX;
      const dy = event.clientY - lastPosY;
      setIsDragging(dx || dy ? true : false);
      // For mouse drag, do NOT scale by zoom: use raw dx/dy for 1:1 movement
      currentView.pan({ x: dx, y: dy });
      currentView.applyTo(document.getElementById(elementId));
      lastPosX = event.clientX;
      lastPosY = event.clientY;
      getVisibleImages();
    }
  };

  const handleMouseUp = (event) => {
    isDragging = false;

    if (isLongTouch) {
      handleClientMouseUp(event);
    }

    if (longTapTimeout) {
      clearTimeout(longTapTimeout);
      longTapTimeout = null;
      setIsLongTouch(false);
    }
  };

  const handleMouseEnter = (event: any) => {
    // Check if we're supposedly dragging but mouse button is not pressed
    if (isDragging && event.buttons === 0) {
      // Mouse button was released outside the window, stop dragging
      isDragging = false;
      setIsDragging(false);
    }
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const calculateZoomSpeed = (numberOfImages: number) => {
    if (numberOfImages > 600) {
      return { speed: 0.35, debounceDuration: 15 };
    } else if (numberOfImages > 400) {
      return { speed: 0.25, debounceDuration: 10 };
    } else if (numberOfImages > 200) {
      return { speed: 0.15, debounceDuration: 5 };
    } else {
      return { speed: 0.1, debounceDuration: 1 };
    }
  }

  const zoomSettings = calculateZoomSpeed(numberOfImages);

  const handleWheel = debounce((event: any) => {
    event.preventDefault();
    
    if (event.shiftKey) {
      // Horizontal scroll behavior with boundary constraints (always takes priority)
      const dx = event.deltaY;
      const mainElement = document.getElementById(elementId);

      if (mainElement) {
        const scale = currentView.getScale();
        const viewportWidth = window.innerWidth;
        const contentWidth = mainElement.offsetWidth * scale;
        
        // Calculate content overflow - this is the exact scrollable distance (same as scrollbar)
        const contentOverflow = Math.max(contentWidth - viewportWidth, 0);
        
        // Current position and boundaries
        const currentX = currentView.getPosition().x;
        const maxX = 0; // Left boundary (content left at viewport left)
        const minX = -contentOverflow; // Right boundary (exactly like scrollbar)
        
        // Use consistent scroll speed
        const scrollSpeed = 1.0;
        
        // Calculate proposed new position
        const proposedX = currentX + (-dx * scrollSpeed);
        
        // Clamp to exact boundaries and apply movement
        const clampedX = Math.max(minX, Math.min(maxX, proposedX));
        
        // Only apply movement if there's actual change needed
        if (Math.abs(clampedX - currentX) > 0.1) {
          const actualDx = clampedX - currentX;
          currentView.pan({ x: actualDx, y: 0 });
          currentView.applyTo(mainElement);
        }
      }
    } else {
      // Only zoom if mode is ZOOM and CTRL is NOT held
      const shouldZoom = scrollOrZoomMode === ScrollOrZoomMode.ZOOM;

      if (shouldZoom) {
        // Zoom behavior
        const at = { x: event.clientX, y: event.clientY };
        const amount = event.deltaY < 0 ? 1 + zoomSettings.speed : 1 - zoomSettings.speed;
        const newScale = currentView.getScale() * amount * 2;
        if (newScale < 0.2 || newScale > 10) {
          return;
        }
        currentView.scaleAt(at, amount, setZoomScale);
        currentView.applyTo(document.getElementById(elementId));
      } else {
        // Always scroll otherwise
        const dy = event.deltaY;
        const mainElement = document.getElementById(elementId);

        if (mainElement) {
          const scale = currentView.getScale();
          const viewportHeight = window.innerHeight;
          const contentHeight = mainElement.offsetHeight * scale;
          
          // Calculate content overflow - this is the exact scrollable distance (same as scrollbar)
          const contentOverflow = Math.max(contentHeight - viewportHeight, 0);
          
          // Current position and boundaries
          const currentY = currentView.getPosition().y;
          const maxY = 0; // Top boundary (content top at viewport top)
          const minY = -contentOverflow; // Bottom boundary (exactly like scrollbar)
          
          // Use consistent scroll speed
          const scrollSpeed = 1.0;
          
          // Calculate proposed new position
          const proposedY = currentY + (-dy * scrollSpeed);
          
          // Clamp to exact boundaries and apply movement
          const clampedY = Math.max(minY, Math.min(maxY, proposedY));
          
          // Only apply movement if there's actual change needed
          if (Math.abs(clampedY - currentY) > 0.1) {
            const actualDy = clampedY - currentY;
            currentView.pan({ x: 0, y: actualDy });
            currentView.applyTo(mainElement);
          }
        }
      }
    }

    getVisibleImages();
  }, zoomSettings.debounceDuration);

  const handleTouchStart = (event: TouchEvent) => {
    setIsDragging(false);
    isLongTouch = false;
    setIsLongTouch(false);
    setIsZooming(false);
    event.preventDefault();
    touchMoved = false;

    // Detect double touch
    if (event.touches.length === 1) {
      if (doubleClickDispatched) {
        // Double touch detected
        const target = event.target as HTMLElement;
        doubleClickDispatched = false;

        // Dispatch a custom double-touch event
        const doubleTouchEvent = new CustomEvent('doubletouch', {
          detail: {
            clientX: event.touches[0].clientX,
            clientY: event.touches[0].clientY,
          },
        });
        event.target?.dispatchEvent(doubleTouchEvent);
      } else {
        // Single touch detected, start a timeout to wait for a potential double touch
        doubleClickDispatched = true;
        setTimeout(() => {
          doubleClickDispatched = false;
        }, 300); // Timeout for detecting double touch (300ms is a common threshold)
      }
    }

    if (event.touches.length === 2) {
      setIsZooming(true);
      initialDistance = getDistance(event.touches[0], event.touches[1]);
      isTouchDragging = true;
      lastPosX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      lastPosY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
    } else if (event.touches.length === 1) {
      isTouchDragging = true;
      lastPosX = event.touches[0].clientX;
      lastPosY = event.touches[0].clientY;
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    setIsDragging(true);

    if (longTapTimeout) {
      clearTimeout(longTapTimeout);
      longTapTimeout = null;
    }

    touchMoved = true;

    if (isLongTouch) {
      if (startPoint && squareRef.current) {
        const width = event.touches[0].clientX - startPoint.x;
        const height = event.touches[0].clientY - startPoint.y;
        squareRef.current.style.width = `${Math.abs(width)}px`;
        squareRef.current.style.height = `${Math.abs(height)}px`;
        squareRef.current.style.left = `${Math.min(event.touches[0].clientX, startPoint.x)}px`;
        squareRef.current.style.top = `${Math.min(event.touches[0].clientY, startPoint.y)}px`;
      }
    } else {
      if (event.touches.length === 2 && initialDistance !== 0) {
        const currentDistance = getDistance(event.touches[0], event.touches[1]);
        const amount = currentDistance / initialDistance;
        const at = {
          x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
          y: (event.touches[0].clientY + event.touches[1].clientY) / 2,
        };
        
        currentView.scaleAt(at, amount, setZoomScale);
        currentView.applyTo(document.getElementById(elementId));
        initialDistance = currentDistance;

        const dx = at.x - lastPosX;
        const dy = at.y - lastPosY;
        currentView.pan({ x: dx, y: dy });
        currentView.applyTo(document.getElementById(elementId));
        lastPosX = at.x;
        lastPosY = at.y;
      } else if (event.touches.length === 1 && isTouchDragging) {
        const dx = event.touches[0].clientX - lastPosX;
        const dy = event.touches[0].clientY - lastPosY;
        touchDeltaX += dx;
        touchDeltaY += dy;
        
        if (Math.abs(touchDeltaX) > 50 || Math.abs(touchDeltaY) > 50) {
          currentView.pan({ x: dx, y: dy });
          currentView.applyTo(document.getElementById(elementId));
          lastPosX = event.touches[0].clientX;
          lastPosY = event.touches[0].clientY;
        } else {
          setIsDragging(false);
          touchMoved = false;
        }
      }
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    isDragging = false;
    touchDeltaX = 0;
    touchDeltaY = 0;

    if (isLongTouch) {
      handleClientMouseUp();
    }

    if (longTapTimeout) {
      clearTimeout(longTapTimeout);
      longTapTimeout = null;
    }
    initialDistance = 0;
    isTouchDragging = false;

    if (!touchMoved) {
      event.preventDefault();
    }
    clickDispatched = false;
    getVisibleImages();
  };

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const loadImages = (event: any) => {
    const mainElement = document.getElementById(elementId);

    if (mainElement) {
        currentView.move({ x: 0, y: 0 });
        currentView.applyTo(mainElement);
    }
  }

  window.addEventListener('load', loadImages);
  addTrackedEventListener(window, 'mousedown', handleMouseDown);
  addTrackedEventListener(window, 'mousemove', handleMouseMove);
  addTrackedEventListener(window, 'mouseup', handleMouseUp);
  addTrackedEventListener(window, 'mouseenter', handleMouseEnter);
  addTrackedEventListener(window, 'wheel', handleWheel);
  addTrackedEventListener(window, 'touchstart', handleTouchStart as EventListener, { passive: false });
  addTrackedEventListener(window, 'touchmove', handleTouchMove as EventListener, { passive: false });
  addTrackedEventListener(window, 'touchend', handleTouchEnd as EventListener, { passive: false });

  return () => {
    removeTrackedEventListeners(window, 'mousedown');
    removeTrackedEventListeners(window, 'mousemove');
    removeTrackedEventListeners(window, 'mouseup');
    removeTrackedEventListeners(window, 'mouseenter');
    removeTrackedEventListeners(window, 'wheel');
    removeTrackedEventListeners(window, 'touchstart');
    removeTrackedEventListeners(window, 'touchmove');
    removeTrackedEventListeners(window, 'touchend');
  };
};

export const createView = (onScrollPositionChange?: (x: number, y: number) => void) => {
  const matrix = [1, 0, 0, 1, 0, 0];
  var m = matrix;
  var scale = 1;
  const pos = { x: 0, y: 0 };
  var dirty = true;
  const API = {
    applyTo(el: any) {
      if (dirty) {
        this.update();
      }
      // Detect if only scale (zoom) changed
      const prevScale = el.__prevScale ?? m[0];
      const currentScale = m[0];
      el.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
      if (prevScale !== currentScale) {
        // Only animate transform when scale (zoom) changes
        el.style.transition = 'transform 0.3s';
      } else {
        // Remove transition for pan/translation
        el.style.transition = 'transform 0.03s';
      }
      el.__prevScale = currentScale;
      // Notify scroll position change
      if (onScrollPositionChange) {
        onScrollPositionChange(-pos.x, -pos.y);
      }
    },
    update() {
      dirty = false;
      m[3] = m[0] = scale;
      m[2] = m[1] = 0;
      m[4] = pos.x;
      m[5] = pos.y;
    },
    move(amount: any) {
      if (dirty) {
        this.update();
      }
      pos.x += amount.x;
      pos.y += amount.y;
      dirty = true;
    },
    pan(amount: any) {
      if (dirty) {
        this.update();
      }
      pos.x += amount.x;
      pos.y += amount.y;
      dirty = true;
    },
    scaleAt(at: any, amount: any, setZoomScale: any) {
      if (dirty) {
        this.update();
      }
      const newScale = scale * amount;
      if (newScale < 0.2 || newScale > 5) {
        return;
      }
      scale = newScale;
      setZoomScale(scale);
      pos.x = at.x - (at.x - pos.x) * amount;
      pos.y = at.y - (at.y - pos.y) * amount;
      dirty = true;
    },
    getScale() {
      return scale;
    },
    getPosition() {
      return { x: pos.x, y: pos.y };
    },
    setPosition(x: number, y: number) {
      pos.x = x;
      pos.y = y;
      dirty = true;
    },
  };
  
  return API;
};

export const view = (() => {
  const matrix = [1, 0, 0, 1, 0, 0];
  var m = matrix;
  var scale = 1;
  const pos = { x: 0, y: 0 };
  var dirty = true;
  const API = {
    applyTo(el: any) {
      if (dirty) {
        this.update();
      }
      el.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
    },
    update() {
      dirty = false;
      m[3] = m[0] = scale;
      m[2] = m[1] = 0;
      m[4] = pos.x;
      m[5] = pos.y;
    },
    move(amount: any) {
      if (dirty) {
        this.update();
      }
      pos.x += amount.x;
      pos.y += amount.y;
      dirty = true;
    },
    pan(amount: any) {
      if (dirty) {
        this.update();
      }
      pos.x += amount.x;
      pos.y += amount.y;
      dirty = true;
    },
    scaleAt(at: any, amount: any, setZoomScale: any) {
      if (dirty) {
        this.update();
      }
      const newScale = scale * amount;
      if (newScale < 0.2 || newScale > 5) {
        return;
      }
      scale = newScale;
      setZoomScale(scale);
      pos.x = at.x - (at.x - pos.x) * amount;
      pos.y = at.y - (at.y - pos.y) * amount;
      dirty = true;
    },
    getScale() {
      return scale;
    },
    getPosition() {
      return { x: pos.x, y: pos.y };
    },
    setPosition(x: number, y: number) {
      pos.x = x;
      pos.y = y;
      dirty = true;
    },
  };
  
  return API;
})();

export default applyMouseAndTouchEvents;