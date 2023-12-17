import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "../styles/ImageZoom.css"
import { Photos } from "./Photos";


const ImageZoom: React.FC = () => {
  return (
    <TransformWrapper
      initialScale={1}
      initialPositionX={100}
      initialPositionY={200}
    >
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <React.Fragment>
          {/* <div className="tools">
            <button onClick={() => zoomIn()}>+</button>
            <button onClick={() => zoomOut()}>-</button>
            <button onClick={() => resetTransform()}>x</button>
          </div> */}
          <TransformComponent>
            <Photos folder={`C:\\Users\\burak\\Pictures\\'22 kapadokya\\red dress selected\\`}></Photos>
          </TransformComponent>
        </React.Fragment>
      )}
    </TransformWrapper>
  );
};

export default ImageZoom;
