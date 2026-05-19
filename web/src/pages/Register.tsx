import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register, signIn } = useAuth();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
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

  const switchMode = (next: 'register' | 'login') => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (mode === 'register' && !name.trim()) {
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
      const result = mode === 'login'
        ? await signIn(email.trim())
        : await register(name.trim(), email.trim());
      setIsReturning(result.isReturning);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || (mode === 'login' ? 'Sign in failed. Please try again.' : 'Registration failed. Please try again.'));
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
        <div className="max-w-xl mx-auto">
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

          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-2xl p-8">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {isReturning ? 'Welcome back!' : 'Welcome to CAAI!'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {isReturning
                      ? 'You\'re signed in. You can now access the ACT on this device.'
                      : 'Thank you for joining our mission. You now have access to our AI tools and will receive updates about our initiatives.'}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {mode === 'login'
                      ? 'Sign in to your account to use the ACT'
                      : 'Create your account for free access to use the ACT'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === 'register' && (
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
                    )}
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
                      {isSubmitting
                        ? (mode === 'login' ? 'Signing in...' : 'Registering...')
                        : (mode === 'login' ? 'Sign in' : 'Register')}
                    </button>

                    <p className="text-sm text-gray-600 text-center">
                      {mode === 'register' ? (
                        <>Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="text-blue-700 hover:text-blue-800 underline font-medium"
                          >
                            Sign in
                          </button>
                        </>
                      ) : (
                        <>Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('register')}
                            className="text-blue-700 hover:text-blue-800 underline font-medium"
                          >
                            Register
                          </button>
                        </>
                      )}
                    </p>

                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      Disclaimer: Registration to use the ACT implies acceptance of the fact that the ACT, in it's current Beta version, can give variable results which may not always be accurate. The tool is therefore for guidance only and CAAI take no responsibility for how users employ results.
                    </p>
                  </form>
                </>
              )}
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-3 text-center">Privacy & Security</h4>
              <p className="text-blue-100 text-sm text-center">
                We take your privacy seriously. Your email will only be used for CAAI updates and tool access.
                We never share your information with third parties and you can unsubscribe at any time by contacting us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
