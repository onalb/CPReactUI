import React, { useState, useEffect } from 'react';

const CircleIcon: React.FC = () => {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 50) {
        setIsToolbarOpen(true);
      } else if (e.clientX > 200) {
        setIsToolbarOpen(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: '25px',
        left: '20px',
        zIndex: 1000
      }}
      onMouseEnter={() => setIsToolbarOpen(true)}
      onMouseLeave={() => setIsToolbarOpen(false)}
    >
      <div style={styles.circle}>
        <span style={styles.icon}>⚙</span>
      </div>
      
      <div style={{
        ...styles.toolbar,
        transform: isToolbarOpen ? 'translateX(0)' : 'translateX(-90%)',
        opacity: isToolbarOpen ? 1 : .2
      }}>
        {['🏠', '📁', '🔍', '⭐', '🗑️', '📷'].map((icon, index) => (
          <div key={index} style={styles.toolbarCircle}>
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
    backgroundColor: '#007bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  icon: {
    fontSize: '24px',
    color: 'white',
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
  },
  toolbarCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    borderColor: '#fffafaff',
    borderWidth: '2px',
    borderStyle: 'solid',
    backgroundColor: '#6e6e6eff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  toolbarIcon: {
    fontSize: '18px',
  },
};

export default CircleIcon;