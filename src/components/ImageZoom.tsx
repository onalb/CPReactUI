import React, { useEffect, useRef, useState } from "react";
import "../styles/ImageZoom.css"
import { Photos } from "./Photos";
import { MapInteractionCSS } from 'react-map-interaction';
import { Scrollbar } from "react-scrollbars-custom";

const ImageZoom: React.FC = () => {
  const mouseDown = (event: any) => {
    // debugger;
    // // setScrollY(mouseY);
    // setMousePositionX(event.clientX);
    setMousePositionY(event.clientY);
    // console.log(`mouseX: ${mouseX}, mouseY: ${mouseY}`)
  };

  const mouseUp = (event: any) => {
    debugger;
    setDisableScrolling(true);
    setScrollY(scrollY-(event.clientY - mousePositionY));
    setMapValue(readjustPosition(mapInteractionProps.defaultValue));
    setDisableScrolling(false);
  };
  const mapInteractionProps = {
    maxScale: 12,
    minScale: 0.6,
    enableAcceleration: true,
    // translationBounds: {
    //   xMin: 0,
    //   yMax: 0,
    // },
    defaultValue: {
      scale: 1,
      translation: {
        x: 0,
        y: 0
      }
    }
  };

  const [mousePositionX, setMousePositionX] = useState(0); 
  const [mousePositionY, setMousePositionY] = useState(0); 
  const [scrollY, setScrollY] = useState(0); 
  const [scrollX, setScrollX] = useState(0); 
  const [disableScrolling, setDisableScrolling] = useState(false);
  const [mapValue, setMapValue] = useState(mapInteractionProps.defaultValue);

 const readjustPosition = (value: any) => {
  // value.translation.x = 200;
  const adjustedValue = value;
  // adjustedValue.translation.y = scrollY;
  // setMapValue(value)
  return adjustedValue;
 } 

  return (
    <Scrollbar style={{ width: 1900, height: 1000 }} scrollTop={scrollY} noScroll={disableScrolling}>
      <MapInteractionCSS {...mapInteractionProps} disablePan={disableScrolling} value={mapValue} onChange={(value: any) => setMapValue(readjustPosition(value))}>
        <div onMouseDown={mouseDown} onMouseUp={mouseUp}>        
          <Photos folder={`C:\\Users\\burak\\Pictures\\22 kapadokya\\red dress selected\\`}></Photos>
        </div>
      </MapInteractionCSS>
    </Scrollbar>
  );
};

export default ImageZoom;
