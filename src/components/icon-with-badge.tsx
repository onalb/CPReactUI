import React from 'react';

interface IconWithBadgeProps {
  iconClass: string;
  count: number;
  isActive: boolean;
  isFilteredView?: boolean;
  title: string;
  activeColor?: string;
  inactiveColor?: string;
  filteredColor?: string;
  filteredColorClass?: string;
  badgeColor?: string;
  // Filtering logic props
  filteredIds: number[];
  setFilteredIds: (ids: number[]) => void;
  setIsFilteredView: (value: boolean) => void;
  // Other filter states (to disable when this filter is activated)
  otherFilterStates?: {
    setIsOtherFilteredView?: (value: boolean) => void;
    setOtherFilteredIds?: (ids: number[]) => void;
    setIsOtherFilteredView2?: (value: boolean) => void;
    setOtherFilteredIds2?: (ids: number[]) => void;
  };
  // Function to get IDs to filter (for entering filtered view)
  getIdsToFilter?: () => number[];
}

const IconWithBadge: React.FC<IconWithBadgeProps> = ({
  iconClass,
  count,
  isActive,
  isFilteredView = false,
  title,
  activeColor = 'white',
  inactiveColor = 'gray',
  filteredColor = '#4CAF50',
  filteredColorClass,
  badgeColor = '#FF6B6B',
  filteredIds,
  setFilteredIds,
  setIsFilteredView,
  otherFilterStates,
  getIdsToFilter
}) => {
  const getIconColor = () => {
    if (count > 0 || isFilteredView) {
      return isFilteredView ? (filteredColorClass ? undefined : filteredColor) : activeColor;
    }
    return inactiveColor;
  };

  const getIconClass = () => {
    if (isFilteredView && filteredColorClass) {
      return `col ${iconClass} ${filteredColorClass}`;
    }
    return `col ${iconClass}`;
  };

  const getCursor = () => {
    return (count > 0 || isFilteredView) ? 'pointer' : 'default';
  };

  const handleClick = () => {
    if (count > 0) {
      if (!isFilteredView) {
        // Entering filtered view - store IDs, keep current state
        const idsToFilter = getIdsToFilter ? getIdsToFilter() : [];
        setFilteredIds(idsToFilter);
        setIsFilteredView(true);
        // Disable other filter if active
        if (otherFilterStates?.setIsOtherFilteredView) {
          otherFilterStates.setIsOtherFilteredView(false);
        }
        if (otherFilterStates?.setOtherFilteredIds) {
          otherFilterStates.setOtherFilteredIds([]);
        }
        if (otherFilterStates?.setIsOtherFilteredView2) {
          otherFilterStates.setIsOtherFilteredView2(false);
        }
        if (otherFilterStates?.setOtherFilteredIds2) {
          otherFilterStates.setOtherFilteredIds2([]);
        }
      } else {
        // Exiting filtered view - go back to showing all
        setIsFilteredView(false);
        setFilteredIds([]);
      }
    } else if (isFilteredView) {
      // If no items but in filtered view, allow exiting
      setIsFilteredView(false);
      setFilteredIds([]);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <i
        className={getIconClass()}
        style={{        
          display: 'block', 
          fontSize: '45px', 
          color: getIconColor(),
          transition: 'color 0.3s ease, background-color 0.3s ease',
          textAlign: 'center',
          cursor: getCursor(),
        }}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title={title}
        onMouseEnter={(e) => {
          if (count > 0 || isFilteredView) {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          const iconColor = getIconColor();
          if (iconColor) {
            e.currentTarget.style.color = iconColor;
          }
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onClick={handleClick}
        onTouchEnd={handleClick}
      ></i>
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: '15px',
          right: '0px',
          backgroundColor: badgeColor,
          color: 'white',
          borderRadius: '50%',
          fontSize: '11px',
          fontWeight: 'bold',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white'
        }}>
          {count}
        </span>
      )}
    </div>
  );
};

export default IconWithBadge;
