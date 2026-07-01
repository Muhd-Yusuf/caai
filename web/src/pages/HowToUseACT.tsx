import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Image, Search, HelpCircle, Globe } from 'lucide-react';

// Example images users can download and run through the ACT. The first eight are
// examples of antisemitic imagery (IHRA tropes); the car is a deliberate control
// — content the tool should recognise as NOT antisemitic. Laid out in rows of
// 5, 3 and 1 (the car last), per the brief. Order/captions follow the client's
// "How to Use the ACT" document.
const EXAMPLE_IMAGES: { src: string; caption: string }[] = [
  // Row 1 (5)
  { src: '/examples/swastika-israeli-flag.jpg', caption: 'Swastika in an Israeli-type flag image' },
  { src: '/examples/jewish-tentacles-globe.jpg', caption: 'Accusation of Jewish tentacles encircling the globe' },
  { src: '/examples/silencing-criticism-of-israel.jpg', caption: 'Silencing criticism of Israel trope' },
  { src: '/examples/yellow-star.jpg', caption: 'Yellow star' },
  { src: '/examples/anti-israel-art.jpg', caption: 'Anti-Israel art' },
  // Row 2 (3)
  { src: '/examples/antisemitic-figurine.jpg', caption: 'Antisemitic figurine' },
  { src: '/examples/neo-nazis-saluting.jpg', caption: 'Neo-Nazis saluting' },
  { src: '/examples/jew-on-money-bags.jpg', caption: 'Caricatured trope of a Jew on top of money bags' },
  // Row 3 (1) — the control
  { src: '/examples/red-sports-car.jpg', caption: "Red sports car (for 'Not antisemitic' check)" },
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

            {/* What the ACT Is and How to Interact with It */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <Search className="w-8 h-8 text-blue-300 mr-3 flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  What the ACT Is and How to Interact with It
                </h2>
              </div>

              <div className="space-y-6 text-blue-100 text-lg">
                <p>
                  The ACT (Antisemitism Checker Tool) is an application, employing advanced AI,
                  that can determine whether content in the form of text or an image is
                  antisemitic. It does this with reference to the guideline definition produced by
                  IHRA (the International Holocaust Remembrance Alliance) of what constitutes
                  antisemitism; also known as Jew-hate. IHRA is one of several organizations that
                  have developed a definition of antisemitism. But the more comprehensive nature of
                  IHRA's definition mean it is widely applied by a variety of institutional bodies
                  &ndash; whose purpose is to help make clear what Jew-hate is for people who may
                  not always understand why something (a shared image, quote, or joke) is
                  antisemitic and hateful. Our tool has been developed in support of that. If your
                  content, once entered into the ACT, meets any of the IHRA definition clauses then
                  it will be deemed &ldquo;Antisemitic&rdquo;. If it does not, the ACT will tell you
                  that, and return a verdict of &ldquo;Not Antisemitic&rdquo;.
                </p>
                <p>
                  To find out whether your content is antisemitic, paste a piece of text or an image
                  into the box (the ACT interface), or upload an image into the box from your device
                  using the camera icon. Text may be a short piece as below or a document of many
                  pages. Then click &ldquo;Send&rdquo; to start the analysis of your text. For images
                  entered the analysis will activate automatically.
                </p>
                <p>
                  Once activated the ACT will tell you within a few seconds whether your input is
                  antisemitic or not. Sometimes content takes a bit longer to analyze depending on
                  complexity. And, just like a human, the ACT can sometimes be temperamental. It may,
                  for example, analyze too quickly, or not take enough care to go through its
                  knowledge base. If you find that an analysis is clearly wrong, try running it again.
                </p>
                <p>
                  You can save a record of your analysis session to a PDF using the
                  &ldquo;Save&rdquo; button.
                </p>
              </div>
            </section>

            {/* Ask Questions, Get More Detail */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <HelpCircle className="w-8 h-8 text-blue-300 mr-3 flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Ask Questions, Get More Detail</h2>
              </div>

              <div className="space-y-4 text-blue-100 text-lg">
                <p>
                  The ACT can do more than simply analyze content; it can be used as a specialized
                  chatbot. You can ask the ACT questions, such as{' '}
                  <span className="italic">&ldquo;What is matzo?&rdquo;</span> (the traditional
                  Jewish flatbread).
                </p>
                <p>
                  You can also direct it for further information on content it has already analyzed.
                  So, if you want to know more about matzo, you can ask the ACT to{' '}
                  <span className="italic">&ldquo;Tell me more&rdquo;</span>, or when it comes to
                  images, ask it to expand on its response by saying{' '}
                  <span className="italic">
                    &ldquo;Expand on the topic in relation to the last image analyzed.&rdquo;
                  </span>{' '}
                  Try different queries; see how the ACT responds.
                </p>
              </div>
            </section>

            {/* Try These Text Examples */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-green-300 mr-3 flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Try These Text Examples</h2>
              </div>

              <p className="text-blue-100 mb-6">
                Here are some texts to try as examples &ndash; simply copy and paste them into the ACT:
              </p>

              <div className="space-y-6">
                {/* Example 1 */}
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">Example 1:</h4>
                  <p className="text-blue-100 italic leading-relaxed">
                    'Congresswoman Marjorie Taylor Greene (R-GA) had blamed "space lasers... beaming the sun's power down to Earth," funded by "Rothschild Inc"'
                  </p>
                </div>

                {/* Example 2 */}
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">Example 2:</h4>
                  <p className="text-blue-100 leading-relaxed">
                    When Jews are viewed as privileged white oppressors, they may feel that their Jewish identities are erased and that their co-workers are viewing them through stereotypes about Jewish conspiracy and power," Marcus says. "[Employers] must use DE&amp;I as a tool, but they must also recognize that this tool has sometimes been compromised
                  </p>
                </div>

                {/* Example 3 */}
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">Example 3:</h4>
                  <p className="text-blue-100 leading-relaxed">
                    Despite clear recommendations from previous reports, and the Labour Party's acknowledgment of the requirement, the Party has failed to deliver adequate training to those individuals who are responsible for handling antisemitism complaints. The Party's provision of academic education rather than practical training fails to equip decision-makers with the knowledge and skills they need. This failure contradicts the Party's zero-tolerance commitment, and contributes to a lack of trust and confidence in the complaint handling system. The failure to provide adequate training to those handling antisemitism complaints was unjustified and indirectly discriminates against Jewish Labour Party members. We consider it justifiable for the Labour Party to have six months, following publication of our report, in which to arrange and implement appropriate practical training, in consultation with Jewish stakeholders, and therefore do not make a finding that the current failure to do so is unlawful.
                  </p>
                </div>
              </div>
            </section>

            {/* Languages */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <Globe className="w-8 h-8 text-green-300 mr-3 flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Languages</h2>
              </div>

              <div className="space-y-4 text-blue-100 text-lg">
                <p>
                  The ACT allows textual content to be entered in a wide variety of languages in
                  addition to English, including European languages like French, East Asian languages
                  such as Chinese, or others like Arabic, Russian, Hindi, Gujarati, or Punjabi. If you
                  have entered text in another language the ACT's response will be in English.
                  However, if you would like to read your originally-entered text in English, after
                  it's been analyzed click the <span className="italic">&ldquo;Translate last&rdquo;</span>{' '}
                  button. This provides a translation of your most recent entry. Below is a sample
                  antisemitic text to try in English and its equivalent in Arabic.
                </p>
              </div>

              <div className="space-y-4 mt-6">
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">English:</h4>
                  <p className="text-blue-100 italic leading-relaxed">
                    After the Second World War the Jewish people invented the Holocaust &ndash;
                    ensuring that they would never be accountable if they wanted to destroy European
                    nations.
                  </p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-3">Arabic:</h4>
                  <p className="text-blue-100 italic leading-relaxed text-right" dir="rtl" lang="ar">
                    بعد الحرب العالمية الثانية، اخترع اليهود المحرقة - مما يضمن عدم محاسبتهم إذا أرادوا تدمير الدول الأوروبية.
                  </p>
                </div>
              </div>
            </section>

            {/* Try These Image Examples */}
            <section className="bg-white bg-opacity-10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <Image className="w-8 h-8 text-purple-300 mr-3 flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Try These Image Examples</h2>
              </div>

              <p className="text-blue-100 mb-6">
                Save any of these images and upload them with the camera icon. The first eight are
                examples of antisemitic imagery; the last (the car) is a control &mdash; content the
                ACT should recognise as <span className="italic">not</span> antisemitic.
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
