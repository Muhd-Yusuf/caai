import React from 'react';

const QuoteSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 text-white" style={{backgroundColor: '#000000'}}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <svg 
            className="w-12 h-12 mx-auto mb-6 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
            "To fight antisemitism, you have to fight the <em>spread</em> of Jew-hate rather than countering just the lie"
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              <img 
                src="https://i.ibb.co/0jpN3Ck9/2i8EOiJ.png" 
                alt="Dr. Jonathan Myers" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-bold">Dr. Jonathan Myers</p>
              <p className="text-blue-300">Founder Combat Antisemitism with AI</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;