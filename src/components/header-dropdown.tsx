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
          backgroundColor: 'rgba(40, 40, 40, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '4px',
          zIndex: 20,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        {actions.map((action, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
          >
            <i 
              className={action.iconClass} 
              style={{ 
                fontSize: '45px', 
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