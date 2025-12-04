import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detect from './pages/Detect';
import Register from './pages/Register';
import HowToUseACT from './pages/HowToUseACT';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detect" element={<Detect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/how-to-use-act" element={<HowToUseACT />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;