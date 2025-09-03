import React, { useRef, useEffect, useState, useCallback } from 'react';
import '../styles/scrollbar.css';

interface CustomScrollbarProps {
  orientation: 'horizontal' | 'vertical';
  contentSize: number;
  viewportSize: number;
  scrollPosition: number;
  onScroll: (position: number) => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  orientation,
  contentSize,
  viewportSize,
  scrollPosition,
  onScroll,
  containerRef
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ position: 0, scroll: 0 });

  const isHorizontal = orientation === 'horizontal';
  
  // Calculate scrollbar dimensions and position
  const scrollRatio = Math.min(viewportSize / contentSize, 1);
  const thumbSize = Math.max(scrollRatio * viewportSize, 20); // Minimum thumb size of 20px
  const maxScrollPosition = contentSize - viewportSize;
  const maxThumbPosition = viewportSize - thumbSize;
  const thumbPosition = maxScrollPosition > 0 ? (scrollPosition / maxScrollPosition) * maxThumbPosition : 0;

  // Show scrollbar only if content is larger than viewport
  const shouldShow = contentSize > viewportSize;

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!thumbRef.current || !trackRef.current) return;
    
    event.preventDefault();
    setIsDragging(true);
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const thumbRect = thumbRef.current.getBoundingClientRect();
    
    const clickPosition = isHorizontal 
      ? event.clientX - trackRect.left
      : event.clientY - trackRect.top;
    
    const thumbStart = isHorizontal
      ? thumbRect.left - trackRect.left
      : thumbRect.top - trackRect.top;

    setDragStart({
      position: clickPosition - thumbStart,
      scroll: scrollPosition
    });
  }, [isHorizontal, scrollPosition]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    
    // Check if mouse button is still pressed - if not, stop dragging
    if (event.buttons === 0) {
      setIsDragging(false);
      return;
    }
    
    event.preventDefault();
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const currentPosition = isHorizontal
      ? event.clientX - trackRect.left
      : event.clientY - trackRect.top;
    
    const thumbPosition = currentPosition - dragStart.position;
    const clampedThumbPosition = Math.max(0, Math.min(thumbPosition, maxThumbPosition));
    
    const scrollRatio = maxThumbPosition > 0 ? clampedThumbPosition / maxThumbPosition : 0;
    const newScrollPosition = scrollRatio * maxScrollPosition;
    
    onScroll(Math.max(0, Math.min(newScrollPosition, maxScrollPosition)));
  }, [isDragging, dragStart, maxThumbPosition, maxScrollPosition, isHorizontal, onScroll]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Handle mouse leaving the window - treat as mouse up
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Handle mouse entering the window - check if mouse button is still pressed
  const handleMouseEnter = useCallback((event: MouseEvent) => {
    // Check if we're in a dragging state but no mouse buttons are pressed
    if (isDragging && event.buttons === 0) {
      // Mouse button was released outside the window, stop dragging
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleTrackClick = useCallback((event: React.MouseEvent) => {
    if (!trackRef.current || !thumbRef.current) return;
    
    // Don't handle clicks on the thumb
    if (event.target === thumbRef.current) return;
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const clickPosition = isHorizontal
      ? event.clientX - trackRect.left
      : event.clientY - trackRect.top;
    
    const targetThumbPosition = clickPosition - thumbSize / 2;
    const clampedThumbPosition = Math.max(0, Math.min(targetThumbPosition, maxThumbPosition));
    
    const scrollRatio = maxThumbPosition > 0 ? clampedThumbPosition / maxThumbPosition : 0;
    const newScrollPosition = scrollRatio * maxScrollPosition;
    
    onScroll(Math.max(0, Math.min(newScrollPosition, maxScrollPosition)));
  }, [isHorizontal, thumbSize, maxThumbPosition, maxScrollPosition, onScroll]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('mouseenter', handleMouseEnter);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('mouseenter', handleMouseEnter);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleMouseLeave, handleMouseEnter]);

  if (!shouldShow) return null;

  return (
    <div
      ref={trackRef}
      className={`custom-scrollbar-track ${isHorizontal ? 'horizontal' : 'vertical'}`}
      style={{
        position: 'fixed',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        ...(isHorizontal ? {
          bottom: '0px',
          left: '0px',
          right: '20px', // Leave space for vertical scrollbar
          height: '20px',
          width: `${viewportSize - 20}px`,
        } : {
          top: '0px',
          right: '0px',
          width: '20px',
          height: `${viewportSize}px`,
        })
      }}
      onClick={handleTrackClick}
    >
      <div
        ref={thumbRef}
        className={`custom-scrollbar-thumb ${isHorizontal ? 'horizontal' : 'vertical'}`}
        style={{
          position: 'absolute',
          backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: isDragging ? 'none' : 'background-color 0.2s ease',
          touchAction: 'none', // Prevent default touch behaviors
          ...(isHorizontal ? {
            left: `${thumbPosition}px`,
            top: '2px',
            width: `${thumbSize}px`,
            height: '16px',
          } : {
            top: `${thumbPosition}px`,
            left: '2px',
            height: `${thumbSize}px`,
            width: '16px',
          })
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default CustomScrollbar;
