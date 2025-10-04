import React, { useState, useEffect } from 'react';
import '../styles/toolbar.css';

interface ToolbarProps {
  selectAllImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  handleDeleteMarkedImages: () => void;
  handleDeleteSelectedImages: () => void;
  setPopupOptions: (opts: any) => void;
  images: any[];
  selectedImageIds: number[];
  setImages: (fn: (prevImages: any[]) => any[]) => void;
}


const Toolbar: React.FC<ToolbarProps> = ({ selectAllImages, setHandleDeleteImages, handleDeleteMarkedImages, handleDeleteSelectedImages, setPopupOptions, images, selectedImageIds, setImages }) => {
  // setImages is now available directly from props
  // ...existing code...

  // State for disabling delete marked icon
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);
  const [clickedCircle, setClickedCircle] = useState<number | null>(null);
  const [isDeleteMarkedForDeletionDisabled, setIsDeleteMarkedForDeletionDisabled] = useState(true);
  const [isDeleteSelectedImagesDisabled, setIsDeleteSelectedImagesDisabled] = useState(selectedImageIds.length === 0);

  // Define toolbar icons with all attributes
  // Calculate badge counts for each action
  const deleteSelectedCount = images.filter(img => selectedImageIds.includes(img.id) && !img.isKept).length;
  const deleteMarkedCount = images.filter(img => img.isMarkedForDeletion && !img.isKept).length;
  // Only count selected images that are not kept and not already marked
  const markSelectedCount = images.filter(img => selectedImageIds.includes(img.id) && !img.isMarkedForDeletion && !img.isKept).length;
  const keepSelectedCount = images.filter(img => selectedImageIds.includes(img.id) && !img.isKept).length;

  const toolbarIcons = [
    {
      name: 'selectAll',
      index: 0,
      id: 'select-all',
      element: <i className="bi bi-check2-all select-all-icon" />,
      title: 'SELECT ALL',
      pointerEvents: 'auto',
      color: '#18d9fcff',
      onClick: selectAllImages,
      badge: images.length > 0 ? images.length : 0,
    },
    {
      name: 'deleteSelected',
      index: 1,
      id: 'delete-selected',
      element: <i className="bi bi-trash-fill delete-selected-icon" />,
      title: deleteSelectedCount > 0 ? `DELETE ${deleteSelectedCount} SELECTED` : 'DELETE SELECTED',
      pointerEvents: deleteSelectedCount === 0 ? 'none' : 'auto',
      color: deleteSelectedCount === 0 ? 'gray' : 'white',
      onClick: deleteSelectedCount === 0 ? undefined : () => {
        setHandleDeleteImages(() => handleDeleteSelectedImages);
        setPopupOptions({
          isVisible: true,
          isYesNo: true,
          title: 'DELETE',
          message: 'You are about to delete all SELECTED images. Are you sure you want to proceed?'
        });
      },
      badge: deleteSelectedCount > 0 ? deleteSelectedCount : 0,
    },
    {
      name: 'deleteMarked',
      index: 2,
      id: 'delete-marked',
      element: <i className="bi bi-cart-x delete-marked-icon" />,
      title: deleteMarkedCount > 0 ? `DELETE ${deleteMarkedCount} MARKED` : 'DELETE MARKED',
      pointerEvents: deleteMarkedCount === 0 ? 'none' : 'auto',
      color: deleteMarkedCount === 0 ? 'gray' : 'rgb(255, 100, 100)',
      onClick: deleteMarkedCount === 0 ? undefined : () => {
        setHandleDeleteImages(() => handleDeleteMarkedImages);
        setPopupOptions({
          isVisible: true,
          isYesNo: true,
          title: 'DELETE',
          message: 'You are about to delete all the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?'
        });
      },
      badge: deleteMarkedCount > 0 ? deleteMarkedCount : 0,
    },
    {
      name: 'markSelectedForDeletion',
      index: 3,
      id: 'mark-selected-for-deletion',
      element: <i className="bi bi-cart-plus mark-selected-icon" />,
      title: markSelectedCount > 0 ? `MARK ${markSelectedCount} SELECTED FOR DELETION` : 'MARK SELECTED FOR DELETION',
      pointerEvents: markSelectedCount === 0 ? 'none' : 'auto',
      color: markSelectedCount === 0 ? 'gray' : 'rgb(255, 193, 100)',
      onClick: markSelectedCount === 0 ? undefined : () => {
        setImages((prevImages: any[]) =>
          prevImages.map((img) =>
            selectedImageIds.includes(img.id) && !img.isKept && !img.isMarkedForDeletion
              ? { ...img, isMarkedForDeletion: true }
              : img
          )
        );
      },
      badge: markSelectedCount > 0 ? markSelectedCount : 0,
    },
    {
      name: 'keepSelected',
      index: 5,
      id: 'keep-selected',
      element: <i className="bi bi-bag-check keep-selected-icon" />,
      title: keepSelectedCount > 0 ? `KEEP ${keepSelectedCount} SELECTED` : 'KEEP SELECTED',
      pointerEvents: keepSelectedCount === 0 ? 'none' : 'auto',
      color: keepSelectedCount === 0 ? 'gray' : 'rgb(25, 255, 79)',
      onClick: keepSelectedCount === 0 ? undefined : () => {
        setImages((prevImages: any[]) =>
          prevImages.map((img) =>
            selectedImageIds.includes(img.id)
              ? { ...img, isKept: true }
              : img
          )
        );
      },
      badge: keepSelectedCount > 0 ? keepSelectedCount : 0,
    },
  ];

  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const anyMarked = Array.isArray(images) && images.some((i: any) => i.isMarkedForDeletion === true);
    setIsDeleteMarkedForDeletionDisabled(!anyMarked);
  }, [images]);

  useEffect(() => {
    setIsDeleteSelectedImagesDisabled(selectedImageIds.length === 0);
  }, [selectedImageIds]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 40) {
        setIsToolbarOpen(true);
      } else if (e.clientX > 130 && !isPinned) {
        setIsToolbarOpen(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPinned]);

  return (
    <div 
      id="toolbar-container"
      className='no-selection-removal-on-click toolbar-container'
    >
      <div 
        className={`circle${isToolbarOpen ? ' circle-open' : ''}`}
        style={{ opacity: isToolbarOpen ? 1 : 0.9 }}
        onClick={() => {
          setIsPinned(!isPinned);
          setIsToolbarOpen(isPinned ? false : true);
        }}
        onMouseEnter={() => { setIsToolbarOpen(true) }}
      >
        <span 
          className='gear-icon'
          onClick={() => {
            setIsPinned(!isPinned);
            setIsToolbarOpen(isPinned ? false : true);
          }}
        >⚙</span>
      </div>
      <div
        className={`no-selection-removal-on-click toolbar-panel${isToolbarOpen ? ' open' : ''}`}
      >
        {toolbarIcons.map((iconObj) => {
          const isEnabled = iconObj.badge === null || iconObj.badge > 0;
          return (
            <div
              id={iconObj.id}
              key={iconObj.index}
              className={`circle${clickedCircle === iconObj.index ? ' circle-clicked' : (hoveredCircle === iconObj.index && isEnabled) ? ' circle-hovered' : ''}${!isEnabled ? ' circle-disabled' : ''}`}
              style={{
                cursor: isEnabled ? 'pointer' : 'not-allowed',
                color: iconObj.color,
                position: 'relative',
              }}
              title={iconObj.title}
              onMouseEnter={() => setHoveredCircle(iconObj.index)}
              onMouseLeave={() => setHoveredCircle(null)}
              onMouseDown={() => setClickedCircle(iconObj.index)}
              onMouseUp={() => setClickedCircle(null)}
              onClick={isEnabled ? iconObj.onClick : undefined}
              onTouchEnd={isEnabled ? iconObj.onClick : undefined}
            >
              {iconObj.element}
              {iconObj.badge > 0 && (
                <span className="toolbar-badge">{iconObj.badge}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;