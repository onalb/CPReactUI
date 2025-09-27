
import React from 'react';
import Toolbar from './toolbar';


interface ToolbarToggleProps {
  selectAllImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  handleDeleteMarkedImages: () => void;
  handleDeleteSelectedImages: () => void;
  setPopupOptions: (opts: any) => void;
  images: any[];
  selectedImageIds: number[];
}

const ToolbarToggle: React.FC<ToolbarToggleProps> = ({ selectAllImages, setHandleDeleteImages, handleDeleteMarkedImages, handleDeleteSelectedImages, setPopupOptions, images, selectedImageIds }) => {
  return <Toolbar 
    selectAllImages={selectAllImages}
    setHandleDeleteImages={setHandleDeleteImages}
    handleDeleteMarkedImages={handleDeleteMarkedImages}
    handleDeleteSelectedImages={handleDeleteSelectedImages}
    setPopupOptions={setPopupOptions}
    images={images}
    selectedImageIds={selectedImageIds}
  />;
};

export default ToolbarToggle;
