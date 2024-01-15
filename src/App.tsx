// App.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ImageZoom from './components/ImageZoom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<ImageZoom />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
