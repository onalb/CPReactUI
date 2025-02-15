import { addTrackedEventListener, removeTrackedEventListeners } from './tracked-event-handler';

const applyMouseAndTouchEvents = (
setZoomScale: any, 
setIsDragging: any, 
setIsZooming: any, 
setIsLongTouch: any, 
setVisibleImages: any,
squareRef: any, 
handleClientMouseUp: any, 
squareSelection: any,
imagesElements: any,
getVisibleImages: any) => {
  let isDragging = false;
  let lastPosX = 0;
  let lastPosY = 0;
  let initialDistance = 0;
  let isTouchDragging = false;
  let touchMoved = false;
  let clickDispatched = false;
  let longTapTimeout: number | null = null;
  let isLongTouch = false;
  let startPoint: any = null;



  const applyLongTouch = (event: any) => {
    // Long tap detection
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
      const dx = event.clientX - lastPosX;
      const dy = event.clientY - lastPosY;
      setIsDragging(dx || dy ? true : false);
      view.pan({ x: dx, y: dy });
      view.applyTo(document.getElementById('main-element'));
      lastPosX = event.clientX;
      lastPosY = event.clientY;
      getVisibleImages();
    }
  };

  const handleMouseUp = () => {
    isDragging = false;

    if (isLongTouch) {
      handleClientMouseUp();
    }
    if (longTapTimeout) {
      clearTimeout(longTapTimeout);
      longTapTimeout = null;
      setIsLongTouch(false);
    }
  };

  const handleWheel = (event: any) => {
    // Prevent the default zoom
    event.preventDefault();
    // Determine the zoom point (e.g., the current mouse position)
    const at = { x: event.clientX, y: event.clientY };
    // Determine the zoom amount based on the wheel delta
    const amount = event.deltaY < 0 ? 1.1 : 0.9;
    // Check if the new scale is within the limits
    const newScale = view.getScale() * amount;
    if (newScale < 0.2 || newScale > 5) {
      return; // Do not apply the zoom if it exceeds the limits
    }
    // Call the scaleAt function
    view.scaleAt(at, amount, setZoomScale);
    // Apply the transformation to the element you want to zoom
    view.applyTo(document.getElementById('main-element'));
    getVisibleImages();
  };

  const handleTouchStart = (event: TouchEvent) => {
    isLongTouch = false;
    setIsLongTouch(false);
    setIsZooming(false);
    event.preventDefault();
    touchMoved = false; // Reset touchMoved flag

    if (!clickDispatched) {
      // Dispatch click event at touch start
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
      });

      event.target && event.target.dispatchEvent(clickEvent);
      clickDispatched = true; // Set clickDispatched flag
    }

    applyLongTouch(event);

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
    touchMoved = true; // Set touchMoved flag
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
        view.scaleAt(at, amount, setZoomScale);
        view.applyTo(document.getElementById('main-element'));
        initialDistance = currentDistance;

        // Handle dragging with double touches
        const dx = at.x - lastPosX;
        const dy = at.y - lastPosY;
        view.pan({ x: dx, y: dy });
        view.applyTo(document.getElementById('main-element'));
        lastPosX = at.x;
        lastPosY = at.y;
      } else if (event.touches.length === 1 && isTouchDragging) {
        const dx = event.touches[0].clientX - lastPosX;
        const dy = event.touches[0].clientY - lastPosY;
        view.pan({ x: dx, y: dy });
        view.applyTo(document.getElementById('main-element'));
        lastPosX = event.touches[0].clientX;
        lastPosY = event.touches[0].clientY;
      }
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    setIsDragging(false);
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
      event.preventDefault(); // Prevent click event if touch did not move
    }
    clickDispatched = false; // Reset clickDispatched flag
    getVisibleImages();
  };

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const loadImages = (event: any) => {
    const mainElement = document.getElementById('main-element');

    if (mainElement) {

        view.move({ x: 0, y: 0 });
        view.applyTo(mainElement);
    }
  }

  window.addEventListener('load', loadImages);
  addTrackedEventListener(window, 'mousedown', handleMouseDown);
  addTrackedEventListener(window, 'mousemove', handleMouseMove);
  addTrackedEventListener(window, 'mouseup', handleMouseUp);
  addTrackedEventListener(window, 'wheel', handleWheel);
  addTrackedEventListener(window, 'touchstart', handleTouchStart as EventListener, { passive: false });
  addTrackedEventListener(window, 'touchmove', handleTouchMove as EventListener, { passive: false });
  addTrackedEventListener(window, 'touchend', handleTouchEnd as EventListener, { passive: false });

  return () => {
    removeTrackedEventListeners(window, 'mousedown');
    removeTrackedEventListeners(window, 'mousemove');
    removeTrackedEventListeners(window, 'mouseup');
    removeTrackedEventListeners(window, 'wheel');
    removeTrackedEventListeners(window, 'touchstart');
    removeTrackedEventListeners(window, 'touchmove');
    removeTrackedEventListeners(window, 'touchend');
  };
};

const view = (() => {
  const matrix = [1, 0, 0, 1, 0, 0]; // current view transform
  var m = matrix; // alias
  var scale = 1; // current scale
  const pos = { x: 0, y: 0 }; // current position of origin
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
      m[3] = m[0] = scale; // Scale X and Y equally
      m[2] = m[1] = 0; // No skew
      m[4] = pos.x; // Translate X
      m[5] = pos.y; // Translate Y
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
        return; // Do not apply the zoom if it exceeds the limits
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
  };
  return API;
})();

export default applyMouseAndTouchEvents;