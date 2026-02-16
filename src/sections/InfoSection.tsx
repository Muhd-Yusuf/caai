import React from 'react';
import { Link } from 'react-router-dom';

const InfoSection: React.FC = () => {
  const handleJoinForumClick = () => {
    window.open('https://chat.whatsapp.com/GKHHEgY1NvI2xBA7PxLEyC', '_blank');
  };

  return (
    <section id="about" className="py-16 md:py-24" style={{backgroundColor: '#252525'}}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            CAAI's Mission is to Combat Antisemitism with AI Solutions
          </h2>
          <p className="text-xl text-white leading-relaxed">
            As Jew-hate continues to rise online - seemingly like a black hole without end - we're leveraging cutting-edge artificial intelligence technology to identify, analyse, and counter harmful content across digital platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="rounded-lg p-6 border-l-4 border-blue-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{backgroundColor: '#ececec'}}>
            <h3 className="text-xl font-bold mb-3 text-gray-900">AI Tools</h3>
            <p className="text-gray-700">
              We build AI tools to combat Jew-hate on social media, and specifically to work at scale. We also build other tools, such as ACT (Antisemitism Checker Tool), available by clicking the blue button above, to help people and companies identify antisemitic content in text and images. It's free to use – register{' '}
              <Link
                to="/register"
                className="text-red-600 hover:text-red-700 underline font-medium"
              >
                here
              </Link>.
            </p>
          </div>

          <div className="rounded-lg p-6 border-l-4 border-blue-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{backgroundColor: '#ececec'}}>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Forum</h3>
            <p className="text-gray-700">
              The CAAI forum is a group dedicated to applying AI to combating Jew-hate. It brings together corporate AI leaders, academics, including those specialising in AI, professionals, students, and those simply interested in the field.
            </p>
          </div>

          <div className="rounded-lg p-6 border-l-4 border-blue-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{backgroundColor: '#ececec'}}>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Detection and Response</h3>
            <p className="text-gray-700">
              We're creating an artificially-intelligent bot called 'Judah's Hammer' that analyses online sources, identifying antisemitic content across different platforms with high accuracy - even recognising subtle forms of hate speech. It then produces an AI-generated response, which it posts back to the platform.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleJoinForumClick}
            className="font-medium transition-colors border-2 px-3 py-1 rounded-md text-white hover:text-blue-200"
            style={{borderColor: '#ed7c30'}}
          >
            Join the forum
          </button>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
