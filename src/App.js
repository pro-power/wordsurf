import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WordChainGame from './Wordwave';
import HomePage from './pages/Home';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<WordChainGame />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;