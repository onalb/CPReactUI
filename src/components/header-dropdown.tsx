import React, { useState } from 'react';

interface DropdownAction {
  iconClass: string;
  title: string;
  color?: string;
  onClick: () => void;
}

interface HeaderDropdownProps {
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  chevronColor: string;
  actions: DropdownAction[];
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  isVisible,
  onMouseEnter,
  onMouseLeave,
  chevronColor,
  actions
}) => {
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <i
        className="bi bi-chevron-down"
        style={{
          position: 'absolute',
          bottom: '-5px',
          left: '50%',
          transform: 'translateX(-50%) scaleX(1.8) scaleY(1.2)',
          fontSize: '18px',
          color: chevronColor,
          fontWeight: 'bold',
          transition: 'opacity 0.3s ease',
          zIndex: 10,
          textShadow: '0 0 1px currentColor',
          cursor: 'pointer',
        }}
      ></i>
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: '50%',
          transform: `translateX(-50%) translateY(${isVisible ? '0px' : '-10px'})`,
          zIndex: 20,
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          pointerEvents: isVisible ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {actions.map((action, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: `scale(${isVisible ? 1 : 0.8})`,
              transitionDelay: `${index * 0.05}s`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(40, 40, 40, 0.95)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
          >
            <i 
              className={action.iconClass} 
              style={{ 
                fontSize: '22px', 
                color: action.color || '#4CAF50',
                display: 'block',
                textAlign: 'center'
              }}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title={action.title}
            ></i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeaderDropdown;