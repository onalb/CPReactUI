import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import pictures from './pictures';
import Draggable, { DraggableData } from 'react-draggable';

const ImageZoom: React.FC = () => {
  const initialScale = 1;
  const [prevBigRectHeight, setPrevBigRectHeight] = useState<number>(0);
  const [bigRectHeight, setBigRectHeight] = useState<number>(0);
  const [smallRectHeight, setSmallRectHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [scrollThumbYPosition, setScrollThumbYPosition] = useState<number>(0);
  const [isPannindDisabled, setIsPanningDisabled] = useState<boolean>(false);
  const [lastTranslateY, setLastTranslateY] = useState<number>(0);
  const [prevY, setPrevY] = useState<number>(0);
  const [isLimitToBounds, setIsLimitToBounds] = useState<boolean>(false);
  const screenSize = window.screen.width;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  };

  const cardStyle: React.CSSProperties = {
    paddingTop: '10px',
    textAlign: 'center',
  };

  const [containerSize, setContainerSize] = useState<{ width?: number; height?: number }>({
    width: window.screen.width,
    height: 0,
  });

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 10,
    y: 0,
  });

  function calculateScrollThumbHeight() {
    const transformComponent = document.querySelector('.react-transform-component'); //pictures
    if (transformComponent) {
      const transformComponentHeight = transformComponent.scrollHeight;
      const thumbHeight = (bigRectHeight * bigRectHeight) / (transformComponentHeight * scale);
      // console.log("bigRectHeight:", bigRectHeight, "transformComponentHeight:", transformComponentHeight, "scale:", scale, "thumbHeight:", thumbHeight);
      setSmallRectHeight(thumbHeight)
    }
  }

  function calculateScrollThumbPositionY() {
    const draggableElement = document.querySelector('.react-draggable');

    if (draggableElement) {
      const transformComponentStyle = window.getComputedStyle(draggableElement);
      const transform = transformComponentStyle.transform;

      if (transform) {
        const matches = transform.slice(7, -1).split(',').map(Number);
        if (matches && matches.length > 1) {
          const translateX = 0;
          const topPosition = scrollThumbYPosition;

          if (draggableElement) {
            (draggableElement as HTMLElement).style.transform = `translate(${translateX}px, ${topPosition}px) scale(${scale})`;
          }
        }
      }
    }
  }

  const handleScrollDrag = (_?: any, data?: DraggableData, topPosition?: number) => {
    const reactDraggable = document.querySelector('.react-draggable'); //scroll thumb
    const top = (data && data.y) || topPosition || 0;
    const transformComponent = document.querySelector('.react-transform-component'); //pictures
    let translateX: number = 0;

    if (transformComponent) {
      const transformStyle = window.getComputedStyle(transformComponent);

      if (transformStyle) {
        const transform = transformStyle.getPropertyValue('transform');

        if (transform) {
          const matches = transform.slice(7, -1).split(',').map(Number);

          if (matches && matches.length > 1) {
            setScale(matches[3] || 0);
            translateX = matches[4] || 0;
          }
        }
      }

      if (reactDraggable) {
        const tfcHeight = transformStyle.height; // pictures
        const tfcScrollHeightToTfcHeight = (bigRectHeight) / (parseFloat(tfcHeight));
        const topPosition = Math.min(Math.max(top, 0), bigRectHeight - smallRectHeight);
        const translateY = - (topPosition) / (scale * tfcScrollHeightToTfcHeight);
        setScrollThumbYPosition(translateY);

        (transformComponent as HTMLElement).style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`;
      }
    };
  }

  const handlePictureDrag = (ref: ReactZoomPanPinchRef, event: MouseEvent | TouchEvent) => {
    const currentY = ref.state.positionY;
    console.log('currentY', currentY);
    let isDraggingDown = false;
    if (prevY !== null) {
      if (currentY > prevY) {
        isDraggingDown = true;
        console.log('Mouse is moving downwards');
      } else if (currentY > prevY) {
        console.log('Mouse is moving upwards');
      }
    }

    setPrevY(currentY);
    console.log('prevY', prevY)
    setBigRectHeight(window.innerHeight)
    setPosition((prevPosition) => ({
      x: prevPosition.x + (event as MouseEvent).movementX,
      y: prevPosition.y + (event as MouseEvent).movementY,
    }));
    const transformComponent = document.querySelector('.react-transform-component');

    if (transformComponent) {
      const transformStyle = window.getComputedStyle(transformComponent);
      
      const transformArray = transformStyle.transform.slice(7, -1).split(', ').map((value, index) => (index === 0 ? value.slice(7) : value)).map(Number);
      const tfcHeight = transformStyle.height;
      const tfcScrollHeightToTfcHeight = window.innerHeight / parseFloat(tfcHeight);

      const scale = transformArray[3] || 0;
      let translateY: number = 0;
      setLastTranslateY(transformArray[5] * -tfcScrollHeightToTfcHeight || 0);
      
      if (isDraggingDown && transformArray[5] >= 0 && transformArray[5] >= lastTranslateY) {
        setIsLimitToBounds(true);
      } else {
        setIsLimitToBounds(false);
        translateY = transformArray[5] * -tfcScrollHeightToTfcHeight || 0;
      }

      const translateX = 0;
      const draggableElement = document.querySelector('.react-draggable');

      if (draggableElement) {
        console.log(transformArray);
        console.log(`translate(${translateX}px, ${translateY}px) scale(${scale})`);
        (draggableElement as HTMLElement).style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      }
    }
  };

  const handlePictureZoom = (ref: ReactZoomPanPinchRef, event: MouseEvent | TouchEvent) => {
    setScale(ref.instance.transformState.scale);
    calculateScrollThumbHeight();
  }

  useEffect(() => {
    const handleResize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      }); // will trigger useEffect below
      setWindowSize(window.innerWidth);
      calculateScrollThumbPositionY();
    };
  
    // Call the handleResize function initially to set the size
    handleResize();
  
    // Add observer for pictures resize
    const transformComponent = document.querySelector('.react-transform-component');
    var resizeObserver = new ResizeObserver(function(entries) {
      entries.forEach(function(entry) {
        handleResize();
      });
    });

    if(transformComponent) resizeObserver.observe(transformComponent);

    // Add resize listener for window height resize
    window.addEventListener('resize', handleResize);
  
    // Cleanup function to remove the event listener when the component unmounts
    return () => { 
      if (transformComponent) resizeObserver.unobserve(transformComponent); 
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(()=> {
    setPrevBigRectHeight(bigRectHeight);
    setBigRectHeight(window.innerHeight);
    calculateScrollThumbHeight();
  }, [calculateScrollThumbHeight, containerSize])

  function draggable() {
    return (
      <Draggable key={windowSize}  axis="y" bounds={{ top: 0, bottom: bigRectHeight - smallRectHeight }} onDrag={handleScrollDrag}>
        <div
          style={{
            width: '100%',
            height: `${smallRectHeight}px`,
            background: 'blue',
            cursor: 'grab',
            position: 'absolute',
            top: '0px',
            // bottom: screenSize,
          }}
        />
      </Draggable>
    )
  }

  return (
    <div style={containerStyle}>
      <Card style={{ ...cardStyle, width: containerSize.width, height: containerSize.height }}>
        <TransformWrapper
          initialScale={initialScale}
          initialPositionX={position.x}
          initialPositionY={position.y}
          limitToBounds={isLimitToBounds}
          minScale={0.25}
          maxScale={10}
          panning={{ disabled: isPannindDisabled }}
          onPanning={handlePictureDrag}
          onZoom={handlePictureZoom}
          onTransformed={(transform) => {setIsPanningDisabled(false)}}  
        >
          <TransformComponent>
            <div className="image-container">
              {pictures.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`test-${index}`}
                  height="300"
                />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </Card>
      <div className="scroll-bar-container" style={{ height: `${bigRectHeight}px`, width: '200px', border: '1px solid black', position: 'relative' }}>
        {draggable()}
      </div>
    </div>
  );
};

export default ImageZoom;