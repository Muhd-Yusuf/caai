import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Image, Search, HelpCircle, Globe } from 'lucide-react';

// Example images users can download and run through the ACT. The first eight are
// examples of antisemitic imagery (IHRA tropes); the car is a deliberate control
// — content the tool should recognise as NOT antisemitic. Laid out in rows of
// 5, 3 and 1 (the car last), per the brief.
const EXAMPLE_IMAGES: { src: string; caption: string }[] = [
  // Row 1 (5)
  { src: '/examples/jew-on-money-bags.jpg', caption: 'Caricature of a Jew atop money bags' },
  { src: '/examples/anti-israel-art.jpg', caption: 'Anti-Israel art' },
  { src: '/examples/neo-nazis-saluting.jpg', caption: 'Neo-Nazis saluting' },
  { src: '/examples/yellow-star.jpg', caption: 'Yellow star' },
  { src: '/examples/jewish-tentacles-globe.jpg', caption: '“Jewish tentacles” encircling the globe' },
  // Row 2 (3)
  { src: '/examples/swastika-israeli-flag.jpg', caption: 'Swastika in an Israeli-style flag' },
  { src: '/examples/antisemitic-figurine.jpg', caption: 'Antisemitic figurine' },
  { src: '/examples/silencing-criticism-of-israel.jpg', caption: 'Silencing criticism of Israel trope' },
  // Row 3 (1) — the control
  { src: '/examples/red-sports-car.jpg', caption: 'Red sports car — a “not antisemitic” control' },
];

const ExampleTile: React.FC<{ src: string; caption: string }> = ({ src, caption }) => (
  <figure className="w-36 sm:w-40 flex flex-col">
    <div className="h-28 rounded-lg bg-gray-900/60 ring-1 ring-white/10 overflow-hidden flex items-center justify-center">
      <img src={src} alt={caption} loading="lazy" className="max-h-full max-w-full object-contain" />
    </div>
    <figcaption className="mt-2 text-xs text-blue-100 text-center leading-snug">{caption}</figcaption>
  </figure>
);

const HowToUseACT: React.FC = () => {
  const row1 = EXAMPLE_IMAGES.slice(0, 5);
  const row2 = EXAMPLE_IMAGES.slice(5, 8);
  const carImage = EXAMPLE_IMAGES[8];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #3a3838 0%, #252525 100%)',
      }}
    >
      <div className="container mx-auto px-4 md:px-6 pt-24 sm:pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            to="/detect" 
            className="inline-flex items-center text-white hover:text-blue-200 transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to ACT Tool
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              How to Use the ACT
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              Simple instructions for using our Antisemitism Checker Tool
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            
            {/* Basic Instructions */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <Search className="w-8 h-8 text-blue-300 mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">How to Use</h2>
              </div>

              <div className="space-y-6 text-blue-100">
                <p className="text-lg">
                  Into the box, paste a piece of text or an image or upload an image from your device using the camera icon. Once activated the tool will tell you whether your input is antisemitic or not.
                </p>
                
                <p className="text-lg">
                  The analysis for images will activate automatically; for text, press 'Send'
                </p>
                
                <p className="text-lg">
                  Text may be a short piece as below or a document of many pages.
                </p>

                <p className="text-lg">
                  You can also save or export a record of your analysis to a PDF
                  using the Save button.
                </p>
              </div>
            </section>

            {/* Asking Questions & Follow-ups */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <HelpCircle className="w-8 h-8 text-blue-300 mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Ask Questions &amp; Get More Detail</h2>
              </div>

              <div className="space-y-4 text-blue-100 text-lg">
                <p>
                  As well as submitting content for analysis, you can ask the ACT
                  questions, for example <span className="italic">"What is the Jewish blood libel?"</span>
                </p>
                <p>
                  You can direct it for further information on content it has
                  already analysed, for example <span className="italic">"Tell me more"</span>,
                  or instruct it to expand on its response, for example
                  <span className="italic"> "Expand on the topic in relation to the last image analysed."</span>
                </p>
              </div>
            </section>

            {/* Languages */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <Globe className="w-8 h-8 text-green-300 mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Languages</h2>
              </div>

              <div className="space-y-4 text-blue-100 text-lg">
                <p>
                  Content may be entered in a wide variety of languages in addition
                  to English. The ACT will analyse it and give its response in
                  English.
                </p>
                <p>
                  If you have entered text in another language and would like to read
                  it in English, use the <span className="italic">Translate last</span> button
                  to see a translation of your most recent entry.
                </p>
              </div>
            </section>

            {/* Example Quote */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-green-300 mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Example</h2>
              </div>

              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                <p className="text-blue-100 italic">
                  'Congresswoman Marjorie Taylor Greene (R-GA) had blamed "space lasers... beaming the sun's power down to Earth," funded by "Rothschild Inc"'
                </p>
              </div>
            </section>

            {/* Test Examples */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <Image className="w-8 h-8 text-purple-300 mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Try These Examples</h2>
              </div>

              <p className="text-blue-100 mb-6">
                Here are some images and texts to try as examples – simply copy and paste them into the ACT:
              </p>

              <div className="space-y-6">
                {/* Example 1 */}
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">Example 1:</h4>
                  <p className="text-blue-100 leading-relaxed">
                    When Jews are viewed as privileged white oppressors, they may feel that their Jewish identities are erased and that their co-workers are viewing them through stereotypes about Jewish conspiracy and power," Marcus says. "[Employers] must use DE&I as a tool, but they must also recognize that this tool has sometimes been compromised
                  </p>
                </div>

                {/* Example 2 */}
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">Example 2:</h4>
                  <p className="text-blue-100 leading-relaxed">
                    Despite clear recommendations from previous reports, and the Labour Party's acknowledgment of the requirement, the Party has failed to deliver adequate training to those individuals who are responsible for handling antisemitism complaints. The Party's provision of academic education rather than practical training fails to equip decision-makers with the knowledge and skills they need. This failure contradicts the Party's zero-tolerance commitment, and contributes to a lack of trust and confidence in the complaint handling system. The failure to provide adequate training to those handling antisemitism complaints was unjustified and indirectly discriminates against Jewish Labour Party members. We consider it justifiable for the Labour Party to have six months, following publication of our report, in which to arrange and implement appropriate practical training, in consultation with Jewish stakeholders, and therefore do not make a finding that the current failure to do so is unlawful.
                  </p>
                </div>

                {/* Example images */}
                <div>
                  <h4 className="font-semibold text-white mb-2">Example images:</h4>
                  <p className="text-blue-100 mb-6 text-sm sm:text-base">
                    Save any of these images and upload them with the camera icon. The
                    first eight are examples of antisemitic imagery; the last (the car)
                    is a control &mdash; content the ACT should recognise as <span className="italic">not</span> antisemitic.
                  </p>

                  {/* Row 1 — 5 images */}
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mb-5">
                    {row1.map((img) => (
                      <ExampleTile key={img.src} src={img.src} caption={img.caption} />
                    ))}
                  </div>
                  {/* Row 2 — 3 images */}
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mb-5">
                    {row2.map((img) => (
                      <ExampleTile key={img.src} src={img.src} caption={img.caption} />
                    ))}
                  </div>
                  {/* Row 3 — the car (control) */}
                  <div className="flex justify-center">
                    <ExampleTile src={carImage.src} caption={carImage.caption} />
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <Link 
                to="/detect"
                className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 bg-blue-700 text-white hover:bg-blue-800 px-3 py-1"
                style={{borderColor: '#ed7c30'}}
              >
                Try the ACT Tool Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HowToUseACT;