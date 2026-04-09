import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TramitesModule from './pages/TramitesModule';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tramites" element={<TramitesModule />} />
        <Route path="/" element={<Navigate to="/tramites" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
