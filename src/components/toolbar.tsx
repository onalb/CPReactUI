import React, { useState, useEffect } from 'react';

interface ToolbarProps {
  selectAllImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  handleDeleteMarkedImages: () => void;
  handleDeleteSelectedImages: () => void;
  setPopupOptions: (opts: any) => void;
  images: any[];
  selectedImageIds: number[];
}


const Toolbar: React.FC<ToolbarProps> = ({ selectAllImages, setHandleDeleteImages, handleDeleteMarkedImages, handleDeleteSelectedImages, setPopupOptions, images, selectedImageIds }) => {
  // ...existing code...

  // State for disabling delete marked icon
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);
  const [clickedCircle, setClickedCircle] = useState<number | null>(null);
  const [isDeleteMarkedForDeletionDisabled, setIsDeleteMarkedForDeletionDisabled] = useState(true);
  const [isDeleteSelectedImagesDisabled, setIsDeleteSelectedImagesDisabled] = useState(selectedImageIds.length === 0);

  // Define toolbar icons with all attributes
  const toolbarIcons = [
    {
      name: 'selectAll',
      index: 0,
      id: 'select-all',
      element: <i className="bi bi-check2-all" />,
      style: {
        fontSize: '22px', transition: 'color 0.3s ease, backgroundColor 0.3s ease', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      },
      title: 'SELECT ALL',
      pointerEvents: 'auto',
      color: 'white',
      onClick: selectAllImages,
    },
    {
      name: 'deleteSelected',
      index: 1,
      id: 'delete-selected',
      element: <i className="bi bi-trash-fill" />,
      style: {
        fontSize: '22px', transition: 'color 0.3s ease, backgroundColor 0.3s ease', color: isDeleteSelectedImagesDisabled ? 'white' : 'gray', display: 'flex', alignItems: 'center', justifyContent: 'center',
      },
      title: 'DELETE SELECTED',
      pointerEvents: isDeleteSelectedImagesDisabled ? 'none' : 'auto',
      color: isDeleteSelectedImagesDisabled ? 'gray' : 'white',
      onClick: !isDeleteSelectedImagesDisabled ? () => {
        setHandleDeleteImages(() => handleDeleteSelectedImages);
        setPopupOptions({
          isVisible: true,
          isYesNo: true,
          title: 'DELETE',
          message: 'You are about to delete all SELECTED images. Are you sure you want to proceed?'
        });
      } : undefined,
    },
    {
      name: 'deleteMarked',
      index: 2,
      id: 'delete-marked',
      element: <i className="bi bi-cart-x" />,
      style: {
        fontSize: '22px', transition: 'color 0.3s ease, backgroundColor 0.3s ease', color: isDeleteMarkedForDeletionDisabled ? 'gray' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      },
      title: 'DELETE MARKED',
      pointerEvents: isDeleteMarkedForDeletionDisabled ? 'none' : 'auto',
      color: isDeleteMarkedForDeletionDisabled ? 'gray' : 'white',
      onClick: !isDeleteMarkedForDeletionDisabled ? () => {
        setHandleDeleteImages(() => handleDeleteMarkedImages);
        setPopupOptions({
          isVisible: true,
          isYesNo: true,
          title: 'DELETE',
          message: 'You are about to delete all the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?'
        });
      } : undefined,
    },
    {
      name: 'search',
      index: 3,
      id: 'search',
      element: <span>🔍</span>,
      style: { fontSize: '18px' },
      title: 'SEARCH',
      pointerEvents: 'auto',
      color: 'white',
    },
    {
      name: 'star',
      index: 4,
      id: 'star',
      element: <span>⭐</span>,
      style: { fontSize: '18px' },
      title: 'STAR',
      pointerEvents: 'auto',
      color: 'white',
    },
    {
      name: 'trash',
      index: 5,
      id: 'trash',
      element: <span>🗑️</span>,
      style: { fontSize: '18px' },
      title: 'TRASH',
      pointerEvents: 'auto',
      color: 'white',
    },
    {
      name: 'camera',
      index: 6,
      id: 'camera',
      element: <span>📷</span>,
      style: { fontSize: '18px' },
      title: 'CAMERA',
      pointerEvents: 'auto',
      color: 'white',
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
      style={{
        position: 'fixed',
        top: '25px',
        left: '20px',
        zIndex: 1000
      }}
      className='no-selection-removal-on-click'
    >
      <div 
        style={{
          ...styles.circle,
          backgroundColor: isToolbarOpen ? '#ff6b6b' : '#6e6e6eff',
          borderColor: isToolbarOpen ? '#ff6b6b' : '#ff6b6be6',
          opacity: isToolbarOpen ? 1 : 0.9,
          transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out'
        }}

        onClick={() => {
          setIsPinned(!isPinned);
          setIsToolbarOpen(isPinned ? false : true);
        }}
        onMouseEnter={() => { setIsToolbarOpen(true) }}
      >
        <span 
          style={styles.icon}
          onClick={() => {
            setIsPinned(!isPinned);
            setIsToolbarOpen(isPinned ? false : true);
          }}
        >⚙</span>
      </div>
      
      <div style={{
        ...styles.toolbar,
        transform: isToolbarOpen ? 'translateX(0)' : 'translateX(-90%)',
        opacity: isToolbarOpen ? 1 : .2
      }}
      className='no-selection-removal-on-click'>
        {toolbarIcons.map((iconObj) => (
          <div
            id={iconObj.id}
            key={iconObj.index}
            style={{
              ...styles.toolbarCircle,
              ...iconObj.style,
              backgroundColor:
                (clickedCircle === iconObj.index)
                  ? '#ff6b6b'
                  : hoveredCircle === iconObj.index
                    ? 'rgba(0, 0, 0, 0.95)'
                    : 'rgba(32, 32, 32, 0.85)',
              pointerEvents: iconObj.pointerEvents as any,
              color: iconObj.color,
            }}
            title={iconObj.title}
            onMouseEnter={() => setHoveredCircle(iconObj.index)}
            onMouseLeave={() => setHoveredCircle(null)}
            onMouseDown={() => setClickedCircle(iconObj.index)}
            onMouseUp={() => setClickedCircle(null)}
            onClick={iconObj.onClick}
            onTouchEnd={iconObj.onClick}
          >
            {iconObj.element}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  circle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: '#ff6b6b',
    backgroundColor: '#6e6e6eff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1001,
    position: 'relative' as const,
  },
  icon: {
    fontSize: '24px',
    color: 'white',
    cursor: 'pointer',
    zIndex: 1001
  },
  toolbar: {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    paddingTop: '110px',
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
    zIndex: 900
  },
  toolbarCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    borderColor: '#c49797',
    borderWidth: '2px',
    borderStyle: 'solid',
    backgroundColor: '#ff6b6b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  toolbarIcon: {
    fontSize: '18px',
  },
};

export default Toolbar;