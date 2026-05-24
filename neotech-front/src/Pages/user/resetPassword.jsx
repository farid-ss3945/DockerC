// resetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useResetPasswordMutation } from '../../store/API';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token. Please request a new password reset.');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const togglePassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      }).unwrap();
      
      toast.success('Password reset successfully! You can now log in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error("Reset password failed:", error);
      if (error?.status === 400) {
        toast.error(error?.data?.message || "Invalid token or password requirements not met.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (!token) {
    return null;
  }

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
            onClick={() => navigate('/forgot-password')}
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h2>
          <p className="text-gray-600 text-sm mb-6">Please type something you'll remember</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input 
                type={showPassword.newPassword ? "text" : "password"}
                required
                minLength={8}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New password" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12" 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform cursor-pointer -translate-y-1/2 text-gray-400" 
                onClick={() => togglePassword('newPassword')}
              >
                {showPassword.newPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword.confirmPassword ? "text" : "password"}
                required
                minLength={8}
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirm new password" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12" 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform cursor-pointer -translate-y-1/2 text-gray-400" 
                onClick={() => togglePassword('confirmPassword')}
              >
                {showPassword.confirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Reset Password'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <button type="button" className="text-blue-600" onClick={() => navigate('/login')}>Log in</button>
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
              onClick={() => navigate('/forgot-password')}
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h2>
            <p className="text-gray-600 text-sm mb-8">Please type something you'll remember</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input 
                  type={showPassword.newPassword ? "text" : "password"}
                  required
                  minLength={8}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12" 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400" 
                  onClick={() => togglePassword('newPassword')}
                >
                  {showPassword.newPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showPassword.confirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12" 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400" 
                  onClick={() => togglePassword('confirmPassword')}
                >
                  {showPassword.confirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account? <button type="button" className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Log in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

