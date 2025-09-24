import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, onPageChange }) => {
  const totalPages = 5;
  return (
    <footer style={{
      position: 'static',
      width: '100%',
      background: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '14px 0 8px 0',
      zIndex: 1200,
      boxShadow: 'none',
      pointerEvents: 'auto',
      userSelect: 'none',
      borderTop: 'none',
      gap: '18px',
    }}>
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
              border: isActive ? '2.5px solid #1976d2' : '2.5px solid #e0e0e0',
              background: isActive
                ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                : 'rgba(255,255,255,0.7)',
              color: isActive ? '#fff' : '#1976d2',
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
              if (!isActive) e.currentTarget.style.background = 'rgba(227,242,253,0.9)';
            }}
            onMouseOut={e => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
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
    </footer>
  );
};

export default PaginationControls;
