import React from 'react';
import DraggableBox from '../src/components/ImageZoom';

const App: React.FC = () => {
  return (
    <div style={styles.container}>
      <DraggableBox />
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    overflow: 'auto',
    margin: 0,
  },
};

export default App;