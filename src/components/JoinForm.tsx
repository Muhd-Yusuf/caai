import React, { useState, useEffect } from 'react';
import Button from './Button';
import Modal from 'react-modal';
import { X, Check, AlertCircle } from 'lucide-react';

Modal.setAppElement('#root');

interface JoinFormProps {
  buttonOnly?: boolean;
  onOpen?: () => void;
  onSuccess?: () => void;
  variant?: 'header' | 'hero';
  buttonClassName?: string;
  buttonText?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  hideButton?: boolean;
}

const JoinForm: React.FC<JoinFormProps> = ({
  buttonOnly = false,
  onOpen,
  onSuccess,
  variant = 'header',
  buttonClassName,
  buttonText,
  isOpen: controlledIsOpen,
  onOpenChange,
  hideButton = false,
}) => {
  // Use internal state if not controlled externally
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Determine if we're using controlled or uncontrolled mode
  const isControlled = controlledIsOpen !== undefined && onOpenChange !== undefined;
  const isModalOpen = isControlled ? controlledIsOpen : internalIsOpen;
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with external state when it changes
  useEffect(() => {
    if (isControlled && controlledIsOpen !== undefined) {
      // External state has changed
      if (controlledIsOpen && onOpen) {
        onOpen();
      }
    }
  }, [isControlled, controlledIsOpen, onOpen]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const openModal = () => {
    if (onOpen) {
      onOpen();
    }
    
    if (isControlled && onOpenChange) {
      onOpenChange(true);
    } else {
      setInternalIsOpen(true);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Email Signups';

    const filterFormula = `LOWER({Email}) = '${email.toLowerCase().trim()}'`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    console.log('Checking for existing email:', email);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check for existing email');
    }

    const data = await response.json();
    console.log('Email check result:', data.records?.length || 0, 'records found');
    return data.records && data.records.length > 0;
  };

  const saveEmailToAirtable = async (email: string) => {
    try {
      const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
      const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
      const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Email Signups';

      console.log('Airtable Config Check:', {
        hasApiKey: !!AIRTABLE_API_KEY,
        apiKeyPrefix: AIRTABLE_API_KEY?.substring(0, 10) + '...',
        baseId: AIRTABLE_BASE_ID,
        tableName: AIRTABLE_TABLE_NAME
      });

      if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        throw new Error('Airtable configuration missing. Please check your environment variables.');
      }

      // Validate API key format
      if (!AIRTABLE_API_KEY.startsWith('pat')) {
        throw new Error('Invalid Airtable API key format. Personal Access Tokens should start with "pat".');
      }

      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        console.log('Email already exists:', email);
        throw new Error('This email is already registered');
      }

      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
      
      console.log('Making request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Email': email.toLowerCase().trim(),
          }
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Airtable API Error:', errorData);
        
        // Handle specific Airtable errors
        if (response.status === 401) {
          throw new Error('Invalid API key or insufficient permissions. Please check your Airtable API key.');
        }
        
        if (response.status === 404) {
          throw new Error(`Table "${AIRTABLE_TABLE_NAME}" not found in base "${AIRTABLE_BASE_ID}". Please verify the base ID and table name.`);
        }
        
        if (response.status === 422) {
          // Check if it's a field validation error
          if (errorData.error?.type === 'INVALID_REQUEST_BODY') {
            throw new Error('Invalid field names. Please check your Airtable field names.');
          }
          
          if (errorData.error?.message?.includes('Unknown field name')) {
            throw new Error(`Field name error: ${errorData.error.message}. Check your Airtable column names.`);
          }
        }
        
        throw new Error(errorData.error?.message || `Failed to save email (${response.status})`);
      }

      const data = await response.json();
      console.log('Successfully saved to Airtable:', data);
      return data;
    } catch (error: any) {
      // Only log to console if it's not an expected business logic error
      if (!error.message?.includes('already registered')) {
        console.error('Error saving email to Airtable:', error);
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      await saveEmailToAirtable(email);
      
      setIsSubmitted(true);
      setEmail('');
      setError('');

      setTimeout(() => {
        closeModal();
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered');
      } else if (error.message.includes('configuration missing')) {
        setError('Service temporarily unavailable. Please try again later.');
      } else if (error.message.includes('API key')) {
        setError('Configuration error. Please contact support.');
      } else if (error.message.includes('not found')) {
        setError('Service configuration error. Please contact support.');
      } else if (error.message.includes('field names') || error.message.includes('Field name error')) {
        setError('Service configuration error. Please contact support.');
      } else if (error.message.includes('Failed to check for existing email')) {
        setError('Unable to verify email. Please try again.');
      } else {
        setError(error.message || 'Failed to save email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (isControlled && onOpenChange) {
      onOpenChange(false);
    } else {
      setInternalIsOpen(false);
    }
    
    setEmail('');
    setError('');
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  const defaultButtonText = variant === 'header' ? 'Join Us' : 'Join the forum';
  const buttonSize = variant === 'hero' ? 'lg' : 'md';

  const renderModal = () => (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[90%] max-w-md mx-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="relative p-6">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pr-8">Join Us</h2>
        
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you for joining!</h3>
            <p className="text-gray-600">We'll keep you updated on our initiatives.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-md border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="Enter your email"
              />
              {error && (
                <div className="flex items-center mt-2 text-red-600">
                  <AlertCircle size={16} className="mr-1" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Now'}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );

  // Only render button if not hidden
  if (hideButton) {
    return renderModal();
  }

  if (buttonOnly && buttonClassName) {
    return (
      <>
        <button 
          onClick={openModal}
          className={buttonClassName}
        >
          {buttonText || defaultButtonText}
        </button>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <Button 
        size={buttonSize}
        onClick={openModal}
      >
        {buttonText || defaultButtonText}
      </Button>
      {renderModal()}
    </>
  );
};

export default JoinForm;