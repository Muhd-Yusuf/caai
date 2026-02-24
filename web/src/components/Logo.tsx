import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img 
        src="https://i.ibb.co/zWjpW88R/oLb64bk.png"
        alt="Combat Antisemitism Logo" 
        className="h-12 sm:h-16 flex-shrink-0"
      />
      <div className="ml-2 sm:ml-4 text-white min-w-0 flex-1">
        <span 
          className="font-bold whitespace-nowrap overflow-hidden text-ellipsis block"
          style={{
            fontSize: 'clamp(0.75rem, 4vw, 1.125rem)'
          }}
        >
          CAAI - Combat Antisemitism with AI
        </span>
      </div>
    </div>
  );
};

export default Logo;