import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import ImageGrid from './components/image-grid';
import FullSizeImage from './components/full-size-image';

// Create a QueryClient instance
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div style={styles.container}>
          <Routes>
            <Route path="/" element={<ImageGrid />} />
            <Route path="/:isOpenOnlyKept" element={<ImageGrid />} />
            <Route path="/full-size-image/:imagePath/:imageName" element={<FullSizeImage />} />
          </Routes>
        </div>
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