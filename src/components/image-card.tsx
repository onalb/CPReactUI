import React, { memo } from 'react';

interface ImageCardProps {
  image: {
    id: number;
    path: string;
    fileName: string;
    isKept: boolean;
    markedForDeletion: boolean;
    deleteClickedOnce: boolean;
  };
  index: number;
  handleImageClick: (imageId: number, index: number, event: React.MouseEvent | React.TouchEvent) => void;
  handleKeepOnClick: (event: React.MouseEvent | React.TouchEvent, image: any) => void;
  handleMarkForDeletionOnClick: (event: React.MouseEvent | React.TouchEvent, image: any, index: number, icon: HTMLElement | null) => void;
  handleDeleteOnClick: (event: React.MouseEvent | React.TouchEvent, image: any, index: number, icon: HTMLElement | null) => boolean;
  currentSelectedImageIndex: number | null;
  isDragging: boolean;
  selectedImageIds: number[];
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleOnloadImg: () => void;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageCard = memo(({
  image,
  index,
  handleImageClick,
  handleKeepOnClick,
  handleMarkForDeletionOnClick,
  handleDeleteOnClick,
  currentSelectedImageIndex,
  selectedImageIds,
  isDragging,
  setIsLoading,
  handleOnloadImg,
  setIsDeleting
}: ImageCardProps) => {
  return (
    <div key={index} className='image-card'>
      <div style={{ height: '300px', minWidth: '200px' }}>
        <img
          id={`image-${image.id}`}
          src={image.path}
          alt={`Image ${index}`}
          className="img no-drag"
          onLoadCapture={() => setIsLoading(true)}
          onLoad={handleOnloadImg}
          onError={() => console.error(`Image ${index} failed to load`)}
          onTouchEnd={(e: any) => {
            return !isDragging ? handleImageClick(image.id, index, e) : null;
          }}
          onMouseUp={(e: any) => {
            return !isDragging ? handleImageClick(image.id, index, e) : null;
          }}
          style={{
            borderColor: currentSelectedImageIndex === index ? 'deeppink' : selectedImageIds.includes(image.id) ? 'blue' : image.isKept ? 'rgb(150, 255, 175)' : 'rgba(255, 255, 255, 0.5)',
            opacity: selectedImageIds.includes(image.id) ? 0.5 : 1,
            height: '300px'
          }} 
        />
        <span
          className='image-tool-area-gap mr-2'
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title={image.fileName}
          style={{
            position: 'relative',
            bottom: '25px',
            left: '5px',
            color: 'white',
            padding: '2px 5px',
            borderRadius: '3px',
            fontSize: '12px',
            zIndex: 1, // Ensure it appears above other elements
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span className='no-selection-removal-on-click text-light' style={{ opacity: '75%' }}>
            {image.fileName.length > 10
              ? `${image.fileName.slice(0, 3)}...${image.fileName.replace(/\.(jpg|jpeg)$/i, '').slice(-4)}`
              : image.fileName.replace(/\.(jpg|jpeg)$/i, '')}
          </span>
        </span>
      </div>
      <div className='image-tool-area-container' style={{ flexWrap: 'wrap' }}>
        <button
          id={`keep-button-${image.id}`}
          type="button"
          className="btn btn-dark py-1.5 my-1"
          onMouseUp={(e) => {
            handleKeepOnClick(e, image);
          }}
          onTouchEnd={(e) => {
            handleKeepOnClick(e, image);
          }}>
          <i
            id={`keep-icon-${image.id}`}
            className={`bi ${image.isKept ? 'bi-bag-dash-fill' : 'bi-bag-plus-fill'} pointer${image.isKept ? ' clicked-green' : ''}`}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={`${image.isKept ? 'UNKEEP' : 'KEEP'}`}
          ></i>
        </button>
        <button
          id={`mark-for-deletion-button-${image.id}`}
          type="button"
          className={`btn btn-dark py-1.5 m-2 my-1 ${image.isKept ? ' disabled' : ''}`}
          onMouseUp={(e) => {
            handleMarkForDeletionOnClick(e, image, index, e.currentTarget.querySelector(`i#mark-for-deletion-icon-${image.id}`));
          }}
          onTouchEnd={(e) => {
            handleMarkForDeletionOnClick(e, image, index, e.currentTarget.querySelector(`i#mark-for-deletion-icon-${image.id}`));
          }}>
          <i
            id={`mark-for-deletion-icon-${image.id}`}
            style={{
              transform: image.markedForDeletion ? 'scale(1.2)' : 'scale(1)', // Scale icon on click
            }}
            className={`bi bi-cart-x pointer${image.markedForDeletion ? ' clicked-orange' : ''}`}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title='Mark for Deletion'
          ></i>
        </button>
        <button
          id={`delete-button-${image.id}`}
          type="button"
          className={`btn btn-dark py-1.5 my-1 ${image.isKept ? ' disabled' : ''}`}
          onMouseUp={(e) => {
            if (handleDeleteOnClick(e, image, index, e.currentTarget.querySelector(`i#delete-icon-${image.id}`))) {
              setIsDeleting(true);
            }
          }}
          onTouchEnd={(e) => {
            handleDeleteOnClick(e, image, index, e.currentTarget.querySelector(`i#delete-icon-${image.id}`));
          }}>
          <i
            id={`delete-icon-${image.id}`}
            style={{
              transform: image.deleteClickedOnce ? 'scale(1.2)' : 'scale(1)', // Scale icon on click
            }}
            className={`bi bi-trash3-fill pointer${image.deleteClickedOnce ? ' clicked-red' : ''}`}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title='DELETE'
          ></i>
        </button>
      </div>
    </div>
  );
});

export default ImageCard;