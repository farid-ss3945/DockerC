// forgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { useForgotPasswordMutation } from '../../store/API';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('Password reset email sent! Please check your inbox.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error("Forgot password failed:", error);
      if (error?.status === 404) {
        toast.error("Email not found. Please check your email address.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center mb-8 mt-4">
          <div className="font-bold text-4xl tracking-tighter text-gray-900 mb-2">
            Neo<span className="text-[#4F46E5]">Tech</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <button 
            className="flex items-center text-gray-600 text-sm mb-6" 
            onClick={() => navigate('/login')}
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h2>
          <p className="text-gray-600 text-sm mb-6">
            Don't worry! It happens. Please enter the email associated with your account.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Send a code'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Remember password? <button type="button" className="text-blue-600" onClick={() => navigate('/login')}>Log in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-white flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="font-bold text-4xl tracking-tighter text-gray-900 mb-2">
            Neo<span className="text-[#4F46E5]">Tech</span>
          </div>

          <div>
            <button 
              className="flex items-center text-gray-600 text-sm mb-6" 
              onClick={() => navigate('/login')}
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h2>
            <p className="text-gray-600 text-sm mb-8">
              Don't worry! It happens. Please enter the email associated with your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Send a code'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Remember password? <button type="button" className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Log in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

