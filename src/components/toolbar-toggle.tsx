
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
  resetMainElement?: () => void;
  handleHorizontalScroll?: (position: number) => void;
  handleVerticalScroll?: (position: number) => void;
  scrollPosition?: { x: number, y: number };
  contentSize?: { width: number, height: number };
  viewportSize?: { width: number, height: number };
  zoomScale?: number;
}

const ToolbarToggle: React.FC<ToolbarToggleProps> = ({
  selectAllImages,
  setHandleDeleteImages,
  handleDeleteMarkedImages,
  handleDeleteSelectedImages,
  setPopupOptions,
  images,
  filteredImages,
  selectedImageIds,
  setImages,
  resetMainElement,
  handleHorizontalScroll,
  handleVerticalScroll,
  scrollPosition,
  contentSize,
  viewportSize,
  zoomScale
}) => {
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
    resetMainElement={resetMainElement}
    handleHorizontalScroll={handleHorizontalScroll}
    handleVerticalScroll={handleVerticalScroll}
    scrollPosition={scrollPosition}
    contentSize={contentSize}
    viewportSize={viewportSize}
    zoomScale={zoomScale}
  />;
};

export default ToolbarToggle;
