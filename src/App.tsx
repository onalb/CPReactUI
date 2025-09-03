import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import ImageGrid from './components/image-grid';
import SelectFolder from './components/select-folder';
import FullSizeImage from './components/full-size-image';
import DropZone from './components/drop-zone';
import { useParentUrlSync } from './hooks';

// Create a QueryClient instance
const queryClient = new QueryClient();

// Component to handle URL sync - must be inside Router context
const AppContent: React.FC = () => {
  useParentUrlSync(); // This will sync URL changes with parent window

  return (
    <div style={styles.container}>
      <Routes>
        <Route path="/" element={<Navigate to="/drop-zone" replace />} />
        <Route path="/drop-zone" element={<DropZone />} />
        <Route path="/select-folder" element={<SelectFolder />} />
        <Route path="/image-grid/:isOpenOnlyKept/:folderPath" element={<ImageGrid />} />
        <Route path="/full-size-image/:imagePath?/:imageName?/:originalImagePath?" element={<FullSizeImage />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
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