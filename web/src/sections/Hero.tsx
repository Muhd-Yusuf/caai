import React from 'react';

const Hero: React.FC = () => {
  return (
    <section 
      className="pt-20 pb-16 md:pt-32 md:pb-24 text-white relative min-h-screen flex items-center"
      style={{
        backgroundImage: 'url(https://i.ibb.co/RGkRp5Hw/kfQm5Ee.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better visual depth */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Centered title text */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center max-w-5xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white drop-shadow-2xl">
              AI Fighting Hate Against Jews Online and in the Real World
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;