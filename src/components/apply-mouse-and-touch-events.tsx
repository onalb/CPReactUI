export const applyMouseAndTouchEvents = (setZoomScale: any, setIsDragging: any, squareRef: any, handleClientMouseUp: any, squareSelection: any) => {
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

  const squareSelectionAnimation = (event: any) => {
    // Long tap detection
    longTapTimeout = window.setTimeout(() => {
      isLongTouch = true;
      if (isLongTouch) { 
        squareSelection(event.touches[0])
        startPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
      if (squareRef.current) {
        const newSquare = document.createElement('div');
        newSquare.style.position = 'absolute';
        newSquare.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
        newSquare.style.border = '2px solid blue';
        newSquare.style.width = '1px';
        newSquare.style.height = '1px';
        newSquare.style.left = `${event.touches[0].clientX}px`;
        newSquare.style.top = `${event.touches[0].clientY}px`;
        newSquare.style.opacity = '0';
        document.body.appendChild(newSquare);
        newSquare.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        setTimeout(() => {
          if (newSquare) {
            newSquare.style.transform = 'scale(25)';
            newSquare.style.opacity = '0.8'
          }
          setTimeout(() => {
            if (newSquare) {
              newSquare.style.transform = 'scale(50)';
              newSquare.style.opacity = '0'
              setTimeout(() => {
                newSquare.remove();
              }, 200);
            }
          }, 200);
        }, 200);
      }
    }, 1000);
  }

  const handleMouseDown = (event: any) => {
    if (!event.ctrlKey) {
      setIsDragging(false); // this is to track if it is dragging for the image-grid
      isDragging = true; // this is for internal use. Mousedown starts dragging
      lastPosX = event.clientX;
      lastPosY = event.clientY;
    }
  };

  const handleMouseMove = (event: any) => {
    if (isDragging) {
      const dx = event.clientX - lastPosX;
      const dy = event.clientY - lastPosY;
      setIsDragging(dx || dy ? true : false);
      view.pan({ x: dx, y: dy });
      view.applyTo(document.getElementById('main-element'));
      lastPosX = event.clientX;
      lastPosY = event.clientY;
    }
  };

  const handleMouseUp = () => {
    isDragging = false;
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
  };

  const handleTouchStart = (event: TouchEvent) => {
    // setIsDragging(false);
    isLongTouch = false;
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
      event.target &&
      event.target.dispatchEvent(clickEvent);
      clickDispatched = true; // Set clickDispatched flag
    }

    squareSelectionAnimation(event);

    if (event.touches.length === 2) {
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
  };

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  window.addEventListener('load', (event) => {
    const mainElement = document.getElementById('main-element');
    const windowWidth = window.innerWidth;

    if (mainElement) {
      const rect = mainElement.getBoundingClientRect();

      if (rect.width < windowWidth) {
        const x = (windowWidth - rect.width) / 2;
        view.move({ x, y: 0 });
        view.applyTo(mainElement);
      } else {
        view.move({ x: 0, y: 0 });
        view.applyTo(mainElement);
      }
    }
  });

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('wheel', handleWheel);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
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