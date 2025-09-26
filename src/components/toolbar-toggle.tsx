
import React from 'react';
import Toolbar from './toolbar';


interface ToolbarToggleProps {
  selectAllImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  handleDeleteMarkedImages: () => void;
  setPopupOptions: (opts: any) => void;
  images: any[];
}

const ToolbarToggle: React.FC<ToolbarToggleProps> = ({ selectAllImages, setHandleDeleteImages, handleDeleteMarkedImages, setPopupOptions, images }) => {
  return <Toolbar 
    selectAllImages={selectAllImages}
    setHandleDeleteImages={setHandleDeleteImages}
    handleDeleteMarkedImages={handleDeleteMarkedImages}
    setPopupOptions={setPopupOptions}
    images={images}
  />;
};

export default ToolbarToggle;
