import React, { useState } from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [hovered, setHovered] = useState(false);

  // Styles
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    width: '100%',
    zIndex: 1200,
    pointerEvents: 'none',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 0,
    transition: 'margin-bottom 0.2s ease',
  };
  const halfCircleStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: hovered ? 'translate(-50%, 100%)' : 'translate(-50%, 0)',
    opacity: hovered ? 0 : 1,
    width: 150,
    height: 25,
    background: 'linear-gradient(180deg, #000000de, #251212de, #301717de, #472121de, #662f2fde)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTop: '4px solid #ff6b6b',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    boxShadow: '0 -2px 12px 2px rgba(255,107,107,0.15)',
    cursor: 'pointer',
    pointerEvents: hovered ? 'none' : 'auto',
    transition: 'transform 0.75s ease, opacity 0.75s ease',
    marginBottom: 0,
    zIndex: 2,
  };
  const controlsWrapperStyle: React.CSSProperties = {
    position: 'relative',
    pointerEvents: hovered ? 'auto' : 'none',
    opacity: hovered ? 1 : 0,
    transform: hovered ? 'translateY(0)' : 'translateY(100%)',
    transition: 'opacity 0.3s, transform 0.75s cubic-bezier(.4,2,.6,1)',
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: '18px',
    background: 'transparent',
  };

  return (
    <div style={{ ...containerStyle, position: 'fixed' }}>
      {/* Half-circle trigger */}
      <div
        style={halfCircleStyle}
        onMouseEnter={() => setHovered(true)}
        onTouchStart={() => setHovered(true)}
        title="Show pagination"
      >
        <svg
          width="18"
          height="12"
          viewBox="0 0 28 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', margin: '0 auto', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -40%)' }}
        >
          <path d="M4 6l10 8 10-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Pagination controls, slide up on hover */}
      <div
        style={controlsWrapperStyle}
        onMouseLeave={() => setHovered(false)}
        onTouchEnd={() => setHovered(false)}
      >
  {Array.from({ length: totalPages }, (_, i) => {
          const isActive = currentPage === i + 1;
          return (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                minHeight: 44,
                maxWidth: 44,
                maxHeight: 44,
                margin: 0,
                padding: 0,
                borderRadius: '50%',
                border: isActive ? '2.5px solid #c49797' : '2.5px solid #c49797',
                background: isActive
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ff6b6b 100%)'
                  : 'rgba(32, 32, 32, 0.85)',
                color: isActive ? '#fff' : 'white',
                fontWeight: 700,
                fontSize: '1.15rem',
                letterSpacing: '0.03em',
                cursor: 'pointer',
                boxShadow: isActive
                  ? '0 4px 16px rgba(25,118,210,0.18)'
                  : '0 2px 8px rgba(0,0,0,0.07)',
                outline: isActive ? 'none' : undefined,
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                position: 'relative',
                top: isActive ? '-2px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                userSelect: 'none',
              }}
              onMouseOver={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.98)';
              }}
              onMouseOut={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(32, 32, 32, 0.85)';
              }}
              onFocus={e => {
                if (!isActive) e.currentTarget.style.border = '2.5px solid #90caf9';
              }}
              onBlur={e => {
                if (!isActive) e.currentTarget.style.border = '2.5px solid #e0e0e0';
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaginationControls;
