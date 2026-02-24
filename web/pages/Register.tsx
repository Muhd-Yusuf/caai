import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, AlertCircle, ArrowLeft, Shield, Users, Zap, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/detect');
    }
  }, [isAuthenticated, navigate]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Please enter your name');
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(name.trim(), email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            to="/"
            className="inline-flex items-center text-white hover:text-blue-200 transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Join the Fight Against Antisemitism
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              Register to access our AI-powered tools and become part of a community dedicated to combating hate speech online and offline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="bg-white rounded-xl shadow-2xl p-8">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CAAI!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for joining our mission. You now have access to our AI tools and will receive updates about our initiatives.
                  </p>
                  <Link
                    to="/detect"
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 bg-blue-700 text-white hover:bg-blue-800 text-base px-6 py-3"
                    style={{borderColor: '#ed7c30'}}
                  >
                    Try ACT Tool Now
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 rounded-md border ${
                          error ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-lg`}
                        placeholder="Enter your email address"
                      />
                      {error && (
                        <div className="flex items-center mt-2 text-red-600">
                          <AlertCircle size={16} className="mr-1" />
                          <p className="text-sm">{error}</p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 bg-blue-700 text-white hover:bg-blue-800 text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{borderColor: '#ed7c30'}}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating Account...' : 'Join CAAI'}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">What You'll Get</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mr-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Free Access to ACT Tool</h4>
                      <p className="text-blue-100">
                        Use our Antisemitism Checker Tool to analyze text and images for antisemitic content with advanced AI detection.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Community Access</h4>
                      <p className="text-blue-100">
                        Join our forum of AI leaders, academics, professionals, and advocates working together to combat antisemitism.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Early Access</h4>
                      <p className="text-blue-100">
                        Be the first to try new AI tools and features as we develop advanced solutions for combating hate speech.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mr-4">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Regular Updates</h4>
                      <p className="text-blue-100">
                        Receive weekly updates on our initiatives, research findings, and the latest developments in AI-powered hate speech detection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3">Privacy & Security</h4>
                <p className="text-blue-100 text-sm">
                  We take your privacy seriously. Your email will only be used for CAAI updates and tool access.
                  We never share your information with third parties and you can unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
