// App.tsx
import React from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

const ScrollBar: React.FC = () => {
  const bigRectHeight = 400;
  const smallRectHeight = 50;

  const handleDrag = (_: DraggableEvent, data: DraggableData) => {
    // Ensure the small rectangle stays within the big rectangle
    const topPosition = Math.min(Math.max(data.y, 0), bigRectHeight - smallRectHeight);
    // You can also add leftPosition for horizontal constraint if needed

    // Update the state or perform any other actions based on the new position
    // For simplicity, we're logging the position to the console here
    console.log('Top Position:', topPosition);
  };

  return (
    <div style={{ height: `${bigRectHeight}px`, width: '200px', border: '1px solid black', position: 'relative' }}>
      <Draggable axis="y" bounds={{ top: 0, bottom: bigRectHeight - smallRectHeight }} onDrag={handleDrag}>
        <div
          style={{
            width: '100%',
            height: `${smallRectHeight}px`,
            background: 'blue',
            cursor: 'grab',
            position: 'absolute',
          }}
        />
      </Draggable>
    </div>
  );
};

export default ScrollBar;
