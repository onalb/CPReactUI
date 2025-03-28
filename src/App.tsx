import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ImageGrid from './components/image-grid';

const App: React.FC = () => {
  return (
    <Router>
      <div style={styles.container}>
        <Routes>
        <Route path="/" element={<ImageGrid />} />
          <Route path="/:isOpenOnlyKept" element={<ImageGrid />} />
        </Routes>
      </div>
    </Router>
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