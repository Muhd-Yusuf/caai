import React from 'react';
import Logo from './Logo';
import { Mail, Twitter, Facebook, Linkedin } from 'lucide-react';
import JoinForm from './JoinForm';

const Footer: React.FC = () => {
  const handleJoinForumClick = () => {
    window.open('https://chat.whatsapp.com/GKHHEgY1NvI2xBA7PxLEyC', '_blank');
  };

  return (
    <footer className="pt-16 pb-8" style={{backgroundColor: '#252525'}}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-white max-w-md">
              CAAI leverages artificial intelligence to combat antisemitism wherever it emerges – and especially online to create a more inclusive digital world.
            </p>
            <div className="flex mt-6 space-x-4">
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Get Involved</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={handleJoinForumClick}
                  className="text-white hover:text-blue-300 transition-colors p-0 bg-transparent"
                >
                  Join the forum
                </button>
              </li>
              <li><a href="#" className="text-white hover:text-blue-300 transition-colors">Partner with Us</a></li>
              <li><a href="#" className="text-white hover:text-blue-300 transition-colors">Donate</a></li>
              <li><a href="#" className="text-white hover:text-blue-300 transition-colors">Licensing</a></li>
              <li><a href="mailto:jmyers31@gmail.com" className="text-white hover:text-blue-300 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-600">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-sm">
              Copyright © Combat Antisemitism with AI, 2025. All rights reserved 
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white hover:text-blue-300 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white hover:text-blue-300 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-white hover:text-blue-300 text-sm transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;