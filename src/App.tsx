import React from 'react';
import DraggableBox from './components/image-grid';
import { Background } from 'devextreme-react/cjs/range-selector';

const App: React.FC = () => {
  return (
    <>
      <div style={styles.container}>
        <DraggableBox />
      </div>
    </>
  );
};

const styles = {
  container: {
    height: '100vh',
    overflow: 'hidden',
    margin: 0,
    background: 'black',
  },
};

export default App;