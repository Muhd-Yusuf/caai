import React from 'react';
import Card from '../components/Card';
import { BarChart2, Search, Shield, MessageSquare, FileText, Users } from 'lucide-react';

const CardSection: React.FC = () => {
  return (
    <section id="capabilities" className="py-16 md:py-24" style={{backgroundColor: '#252525'}}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Learn About Our Forthcoming AI-Powered Capabilities
          </h2>
          <p className="text-xl text-white">
            Advanced artificial intelligence initiatives and tools for future development will provide comprehensive solutions for identifying and combating antisemitic content on- and off-line.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#323232'}}>
            <div className="text-white mb-4">
              <BarChart2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Pattern Analysis</h3>
            <p className="text-gray-300">Analyze trends and patterns in antisemitic rhetoric to better understand how hate speech evolves and spreads.</p>
          </div>
          
          <div className="rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#323232'}}>
            <div className="text-white mb-4">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Protective Monitoring</h3>
            <p className="text-gray-300">Monitor digital spaces in real-time to provide early warning of antisemitic activity surges.</p>
          </div>

          <div className="rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#323232'}}>
            <div className="text-white mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Advanced Content Detection</h3>
            <p className="text-gray-300">Refinements to our systems for Identifying antisemitic content across various platforms with advanced AI – for example to detect and respond in multiple national languages.</p>
          </div>
          
          <div className="rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#323232'}}>
            <div className="text-white mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Counter-Narrative Creation</h3>
            <p className="text-gray-300">Generative AI tool to produce more comprehensive counter-narratives to combat antisemitic misinformation, disinformation and propaganda on- and off-line – particularly aimed at media use.</p>
          </div>
          
          <div className="rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#323232'}}>
            <div className="text-white mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Educational Resources</h3>
            <p className="text-gray-300">AI-based educational materials (including code) to help groups recognise and respond with their own ideas or systems to combat Jew-hate at a grassroots level.</p>
          </div>
          
          <div className="rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#323232'}}>
            <div className="text-white mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Community Support</h3>
            <p className="text-gray-300">Resources and tools provided to help Jewish institutions or communities worldwide affected by social media antisemitism.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardSection;