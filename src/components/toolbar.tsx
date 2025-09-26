import React, { useState, useEffect } from 'react';

interface ToolbarProps {
  selectAllImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  handleDeleteMarkedImages: () => void;
  setPopupOptions: (opts: any) => void;
  images: any[];
}


const Toolbar: React.FC<ToolbarProps> = ({ selectAllImages, setHandleDeleteImages, handleDeleteMarkedImages, setPopupOptions, images }) => {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);
  const [clickedCircle, setClickedCircle] = useState<number | null>(null);
  const [isDeleteMarkedForDeletionDisabled, setIsDeleteMarkedForDeletionDisabled] = useState(true);

  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const anyMarked = Array.isArray(images) && images.some((i: any) => i.isMarkedForDeletion === true);
    const markedImages = Array.isArray(images) ? images.filter((i: any) => i.isMarkedForDeletion === true) : [];
    setIsDeleteMarkedForDeletionDisabled(!anyMarked);
  }, [images]);

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
        {[
          <i className={`bi bi-check2-all`} key="check2-all"
            style={{
              display: 'block', fontSize: '22px', color: 'white',
              transition: 'color 0.3s ease, background-color 0.3s ease',
              textAlign: 'center',
            }}
          />,
          <i className={`bi bi-cart-x`} key="delete-marked"
            style={{
              display: 'block', fontSize: '22px', color: 'white',
              transition: 'color 0.3s ease, background-color 0.3s ease',
              textAlign: 'center',
            }}
            title='DELETE MARKED'
          />,
          '📁', '🔍', '⭐', '🗑️', '📷'
        ].map((icon, index) => {
          // pointerEvents for DELETE MARKED
          let pointerEvents = 'auto';
          let color = 'white';
          if (index === 1) {
            pointerEvents = isDeleteMarkedForDeletionDisabled ? 'none' : 'auto';
            color = isDeleteMarkedForDeletionDisabled ? 'gray' : 'white';
          }
          return (
            <div
              id={index === 1 ? 'delete-marked' : undefined}
              key={index}
              style={{
                ...styles.toolbarCircle,
                backgroundColor:
                  index === 1 && clickedCircle === index
                      ? '#ff6b6b'
                      : hoveredCircle === index
                        ? 'rgba(0, 0, 0, 0.95)'
                        : 'rgba(32, 32, 32, 0.85)',
                pointerEvents: pointerEvents as any
              }}
              onMouseEnter={() => setHoveredCircle(index)}
              onMouseLeave={() => setHoveredCircle(null)}
              onMouseDown={() => setClickedCircle(index)}
              onMouseUp={() => setClickedCircle(null)}
              onClick={
                index === 0
                  ? selectAllImages
                  : index === 1 && !isDeleteMarkedForDeletionDisabled
                    ? () => {
                        setHandleDeleteImages(() => handleDeleteMarkedImages);
                        setPopupOptions({
                          isVisible: true,
                          isYesNo: true,
                          title: 'DELETE',
                          message: 'You are about to delete all the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?'
                        });
                      }
                    : undefined
              }
              onTouchEnd={
                index === 0
                  ? selectAllImages
                  : index === 1 && !isDeleteMarkedForDeletionDisabled
                    ? () => {
                        setHandleDeleteImages(() => handleDeleteMarkedImages);
                        setPopupOptions({
                          isVisible: true,
                          isYesNo: true,
                          title: 'DELETE',
                          message: 'You are about to delete all the images MARKED for deletion. KEPT images will retain. Are you sure you want to proceed?'
                        });
                      }
                    : undefined
              }
            >
              {index === 1 && React.isValidElement(icon)
                ? React.cloneElement(icon, { style: { ...icon.props.style, color } })
                : index <= 1
                  ? icon
                  : <span style={styles.toolbarIcon}>{icon}</span>}
            </div>
          );
        })}
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