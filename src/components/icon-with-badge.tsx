import React, { useState } from 'react';
import HeaderDropdown from './header-dropdown';

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
  // Selection reset props
  onEnterFilter?: () => void; // Called when entering filter view to reset selections
  // Dropdown actions
  onKeepAll?: () => void; // Called when "Keep All" is clicked for selected filter
  onUnkeepAll?: () => void; // Called when "Unkeep All" is clicked for selected filter
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
  getIdsToFilter,
  onEnterFilter,
  onKeepAll,
  onUnkeepAll
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnterDropdown = () => {
    // Clear any existing timeout when entering dropdown area
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setIsDropdownVisible(true);
  };

  const handleMouseLeaveDropdown = () => {
    // Set a 1-second delay before closing the dropdown
    const timeout = setTimeout(() => {
      setIsDropdownVisible(false);
      setCloseTimeout(null);
    }, 500); // 1000ms = 1 second delay
    setCloseTimeout(timeout);
  };

  const getIconColor = () => {
    if (count > 0 || isFilteredView) {
      return isFilteredView ? (filteredColorClass ? undefined : filteredColor) : activeColor;
    }
    return inactiveColor;
  };

  const getChevronColor = () => {
    if (isFilteredView) {
      // If using CSS class for color, use the same filteredColor as fallback
      // but ideally should match the actual icon color
      if (filteredColorClass) {
        // For filtered views, try to match the CSS class colors
        if (filteredColorClass.includes('blue')) return 'blue';
        if (filteredColorClass.includes('green')) return '#4CAF50';
        if (filteredColorClass.includes('orange')) return 'orange';
        return filteredColor; // fallback
      }
      return filteredColor;
    }
    return activeColor;
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
        // Reset selections when entering filter view
        if (onEnterFilter) {
          onEnterFilter();
        }
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
          transition: 'color 0.3s ease, background-color 0.3s ease, transform 0.3s ease',
          textAlign: 'center',
          cursor: getCursor(),
          transform: isFilteredView ? 'translateY(-10px)' : 'translateY(0px)',
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
          top: isFilteredView ? '5px' : '15px',
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
          border: '2px solid white',
          transition: 'top 0.3s ease'
        }}>
          {count}
        </span>
      )}
      {isFilteredView && (
        <HeaderDropdown
          isVisible={isDropdownVisible}
          onMouseEnter={handleMouseEnterDropdown}
          onMouseLeave={handleMouseLeaveDropdown}
          chevronColor={getChevronColor()}
          actions={
            iconClass.includes('hand-index') && (onKeepAll || onUnkeepAll)
              ? [
                  ...(onKeepAll ? [{
                    iconClass: 'bi bi-bag-plus-fill',
                    title: 'Keep All Selected',
                    color: '#4CAF50',
                    onClick: () => {
                      onKeepAll();
                      setIsDropdownVisible(false);
                    }
                  }] : []),
                  ...(onUnkeepAll ? [{
                    iconClass: 'bi bi-bag-dash-fill',
                    title: 'Unkeep All Selected',
                    color: 'white',
                    onClick: () => {
                      onUnkeepAll();
                      setIsDropdownVisible(false);
                    }
                  }] : [])
                ]
              : []
          }
        />
      )}
    </div>
  );
};

export default IconWithBadge;