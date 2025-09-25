import React, { useState, useEffect } from 'react';

const Toolbar: React.FC = () => {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);

  const [isPinned, setIsPinned] = useState(false);

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
      style={{
        position: 'fixed',
        top: '25px',
        left: '20px',
        zIndex: 1000
      }}
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
      }}>
        {['🏠', '📁', '🔍', '⭐', '🗑️', '📷'].map((icon, index) => (
          <div 
            key={index} 
            style={{
              ...styles.toolbarCircle,
              backgroundColor: hoveredCircle === index ? 'rgba(0, 0, 0, 0.95)' : 'rgba(32, 32, 32, 0.85)'
            }}
            onMouseEnter={() => setHoveredCircle(index)}
            onMouseLeave={() => setHoveredCircle(null)}
          >
            <span style={styles.toolbarIcon}>{icon}</span>
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