import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import pictures from './pictures';
import Draggable, { DraggableData } from 'react-draggable';

const ImageZoom: React.FC = () => {
  const initialScale = 1;
  const [bodyHeight, setBodyHeight] = useState<number>(0);
  const [bigRectHeight, setBigRectHeight] = useState<number>(0);
  const [smallRectHeight, setSmallRectHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

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

  useEffect(() => {
    setBodyHeight(document.body.clientHeight);
    const transformWrapperElement = document.querySelector('.react-transform-wrapper');

    if (transformWrapperElement) {
      (transformWrapperElement as HTMLElement).style.height = `99vh`;
    }

    setBigRectHeight(document.body.clientHeight);
    calculateScrollThumbHeight();
  }, [document.body.clientHeight]);

  useEffect(() => {
    setBodyHeight(document.body.clientHeight);
    window.addEventListener('resize', () => {
      setBigRectHeight(document.body.clientHeight);
      calculateScrollThumbHeight();

      const reactDraggableTop = parseFloat(
        window.getComputedStyle(document.querySelector('.react-draggable') || new Element()).transform.slice(7, -1).split(',')[5]
      ); //scroll thumb
      debugger;
      handleScrollDrag(null, {} as DraggableData, reactDraggableTop);
    });
  }, [document.body.clientHeight])

  function calculateScrollThumbHeight() {
    const transformComponent = document.querySelector('.react-transform-component'); //pictures
    
    if (transformComponent) {
      const transformComponentHeight = transformComponent.scrollHeight;
      const thumbHeight = (bodyHeight * bodyHeight) / (transformComponentHeight * scale);
      setSmallRectHeight(thumbHeight)
      // (reactDraggable as HTMLElement).style.height = thumbHeight.toString() + "px";
    }
  }

  const handleScrollDrag = (_?: any, data?: DraggableData, topPosition?: number) => {
    const top = (data && data.y) || topPosition || 0;
    const transformComponent = document.querySelector('.react-transform-component'); //pictures
    let translateX: number = 0;
    // const transformComponent = document.querySelector('.react-transform-component')
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

      const reactDraggable = document.querySelector('.react-draggable'); //scroll thumb
      let topPositionThumb = 0
      if (reactDraggable) {
        console.log("asd")
        const draggableStyle = window.getComputedStyle(reactDraggable);
        topPositionThumb = parseFloat(draggableStyle.top);

        console.log('topPositionThumb' + topPositionThumb)

        const tfcHeight = transformStyle.height; // pictures
        const tfcScrollHeightToTfcHeight = (bigRectHeight) / (parseFloat(tfcHeight));

        const topPosition = Math.min(Math.max(top, 0), bigRectHeight - smallRectHeight);
        console.log('topPosition: ' + topPosition)
        const translateY = - (topPosition) / (scale * tfcScrollHeightToTfcHeight);

        console.log(`translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`);
        (transformComponent as HTMLElement).style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`;
      }
    };
  }

  const handlePictureDrag = (ref: ReactZoomPanPinchRef, event: MouseEvent | TouchEvent) => {
    setPosition((prevPosition) => ({
      x: prevPosition.x + (event as MouseEvent).movementX,
      y: prevPosition.y + (event as MouseEvent).movementY,
    }));

    const transformComponent = document.querySelector('.react-transform-component');

    if (transformComponent) {
      const transformStyle = window.getComputedStyle(transformComponent);
      const transformArray = transformStyle.transform.slice(7, -1).split(', ').map((value, index) => (index === 0 ? value.slice(7) : value)).map(Number);

      const tfcHeight = transformStyle.height;
      const tfcScrollHeightToTfcHeight = bigRectHeight / parseFloat(tfcHeight);

      const scale = transformArray[3] || 0;
      const translateY = transformArray[5] * -tfcScrollHeightToTfcHeight || 0;
      const translateX = 0;

      const draggableElement = document.querySelector('.react-draggable');
      if (draggableElement) {
        // console.log(transformArray);
        // console.log(`translate(${translateX}px, ${translateY}px) scale(${scale})`);
        (draggableElement as HTMLElement).style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      }
    }
  };

  const handlePictureZoom = (ref: ReactZoomPanPinchRef, event: MouseEvent | TouchEvent) => {
    setScale(ref.instance.transformState.scale);
    calculateScrollThumbHeight();
  }

  return (
    <div style={containerStyle}>
      <Card style={{ ...cardStyle, width: containerSize.width, height: containerSize.height }}>
        <TransformWrapper
          initialScale={initialScale}
          initialPositionX={position.x}
          initialPositionY={position.y}
          limitToBounds={false}
          minScale={0.25}
          maxScale={10}
          panning={{ disabled: false }}
          onPanning={handlePictureDrag}
          onZoom={handlePictureZoom}
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
        <Draggable axis="y" bounds={{ top: 0, bottom: bigRectHeight - smallRectHeight }} onDrag={handleScrollDrag}>
          <div
            style={{
              width: '100%',
              height: `${smallRectHeight}px`,
              background: 'blue',
              cursor: 'grab',
              position: 'absolute',
            }}
          />
        </Draggable>
      </div>
    </div>
  );
};

export default ImageZoom;