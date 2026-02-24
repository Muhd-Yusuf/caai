import React, { useState, useEffect } from 'react';
import { MenuIcon, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDetectPage = location.pathname === '/detect';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-md py-2 backdrop-blur-md' : 'bg-transparent py-4'
      }`}
      style={isScrolled ? {backgroundColor: 'rgba(0, 0, 0, 0.8)'} : {}}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link to="/">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!isDetectPage && (
              <Link
                to="/detect"
               className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition border-2"
                style={{borderColor: '#ed7c30'}}
              >
                ACT: Antisemitism Checker Tool
              </Link>
            )}
            {isDetectPage && (
              <Link
                to="/how-to-use-act"
                className={`font-medium transition-colors border-2 px-3 py-1 rounded-md ${
                  isScrolled ? 'text-white hover:text-blue-200' : 'text-white hover:text-blue-200'
                }`}
                style={{borderColor: '#ed7c30'}}
              >
                How to use the ACT
              </Link>
            )}
            <button
              onClick={() => scrollToSection('about')}
              className={`font-medium transition-colors border-2 px-3 py-1 rounded-md ${
                isScrolled ? 'text-white hover:text-blue-200' : 'text-white hover:text-blue-200'
              }`}
              style={{borderColor: '#ed7c30'}}
            >
              About
            </button>
            {!isDetectPage && (
              <button
                onClick={() => scrollToSection('capabilities')}
                className={`font-medium transition-colors border-2 px-3 py-1 rounded-md ${
                  isScrolled ? 'text-white hover:text-blue-200' : 'text-white hover:text-blue-200'
                }`}
                style={{borderColor: '#ed7c30'}}
              >
                Capabilities
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className={`md:hidden transition-colors ${
              isScrolled ? 'text-white' : 'text-white'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden shadow-lg backdrop-blur-md" style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {!isDetectPage && (
                <Link
                  to="/detect"
                 className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition border-2"
                  style={{borderColor: '#ed7c30'}}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ACT: Antisemitism Checker Tool
                </Link>
              )}
              {isDetectPage && (
                <Link
                  to="/how-to-use-act"
                  className="text-white hover:text-blue-200 font-medium text-left py-2 border-2 px-3 rounded-md"
                  style={{borderColor: '#ed7c30'}}
                  onClick={() => setIsMenuOpen(false)}
                >
                  How to use the ACT
                </Link>
              )}
              <button
                onClick={() => scrollToSection('about')}
                className="text-white hover:text-blue-200 font-medium text-left py-2 border-2 px-3 rounded-md"
                style={{borderColor: '#ed7c30'}}
              >
                About
              </button>
              {!isDetectPage && (
                <button
                  onClick={() => scrollToSection('capabilities')}
                  className="text-white hover:text-blue-200 font-medium text-left py-2 border-2 px-3 rounded-md"
                  style={{borderColor: '#ed7c30'}}
                >
                  Capabilities
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
