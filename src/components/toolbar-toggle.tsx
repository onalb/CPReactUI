
import React from 'react';
import Toolbar from './toolbar';



interface ToolbarToggleProps {
  selectAllImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  handleDeleteMarkedImages: () => void;
  handleDeleteSelectedImages: () => void;
  setPopupOptions: (opts: any) => void;
  images: any[];
  filteredImages: any[];
  selectedImageIds: number[];
  setImages: (fn: any) => void;
}

const ToolbarToggle: React.FC<ToolbarToggleProps> = ({ selectAllImages, setHandleDeleteImages, handleDeleteMarkedImages, handleDeleteSelectedImages, setPopupOptions, images, filteredImages, selectedImageIds, setImages }) => {
  return <Toolbar
    selectAllImages={selectAllImages}
    setHandleDeleteImages={setHandleDeleteImages}
    handleDeleteMarkedImages={handleDeleteMarkedImages}
    handleDeleteSelectedImages={handleDeleteSelectedImages}
    setPopupOptions={setPopupOptions}
    images={images}
    filteredImages={filteredImages}
    selectedImageIds={selectedImageIds}
    setImages={setImages}
  />;
};

export default ToolbarToggle;
