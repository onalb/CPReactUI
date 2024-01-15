import React from "react";
import "../styles/ImageZoom.css"
import { Photos } from "./Photos";
import { MapInteractionCSS } from 'react-map-interaction';


const ImageZoom: React.FC = () => {

  const mapInteractionProps = {
    maxScale: 12, // Adjust this value to allow more zooming in
    minScale: .6,
  };

  return (
    <MapInteractionCSS {...mapInteractionProps}>
      <Photos folder={`C:\\Users\\burak\\Pictures\\22 kapadokya\\red dress selected\\`}></Photos>
    </MapInteractionCSS>
  );
};

export default ImageZoom;
