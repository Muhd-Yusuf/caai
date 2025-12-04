import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description, className = '' }) => {
  return (
    <div className={`rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg ${className}`} style={{backgroundColor: '#ececec'}}>
      <div className="text-white mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default Card;