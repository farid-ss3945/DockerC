// Register.jsx
import React, { useState, useEffect } from 'react';
import { useSignupMutation } from '../../store/API';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    confirmPassword: ""
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();

  const [signup, { isLoading: isSignLoading }] = useSignupMutation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePassword = (inputId) => {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
    } else {
      input.type = 'password';
      button.textContent = '👁';
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password.trim(),
        confirmPassword: formData.confirmPassword.trim()
      }).unwrap();
      
      toast.success("Signed up successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);

      if (error?.status === 400) {
        toast.error(error?.data || "Email or phone already exists");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h2>
          <p className="text-gray-600 text-sm mb-6">Create your account in a seconds</p>

          <form className="space-y-4" onSubmit={handleSignUp}>
            <input 
              type="text" 
              required 
              name='firstName' 
              onChange={handleChange} 
              placeholder="First Name" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
            />
            <input 
              type="text" 
              required 
              name='lastName' 
              onChange={handleChange} 
              placeholder="Last Name" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
            />
            <input 
              type="email" 
              required 
              name='email' 
              onChange={handleChange} 
              placeholder="Email Address" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
            />
            <div className="flex">
              <div className="flex items-center px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-sm">
                🇦🇿 (+994)
              </div>
              <input 
                type="tel" 
                required 
                name='phoneNumber' 
                onChange={handleChange} 
                placeholder="xxx xx xx" 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg" 
              />
            </div>
            <div className="relative">
              <input 
                type="password" 
                required 
                minLength={8} 
                name='password' 
                onChange={handleChange} 
                id="mobileSignupPassword" 
                placeholder="Create Password" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12" 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400" 
                onClick={() => togglePassword('mobileSignupPassword')}
              >
                👁
              </button>
            </div>
            <div className="relative">
              <input 
                type="password" 
                required 
                minLength={8} 
                name='confirmPassword' 
                onChange={handleChange} 
                id="mobileAgain" 
                placeholder="Confirm Password" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12" 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform cursor-pointer -translate-y-1/2 text-gray-400" 
                onClick={() => togglePassword('mobileAgain')}
              >
                👁
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isSignLoading} 
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
            >
              {isSignLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Create an account'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already a member? <button type="button" className="text-blue-600" onClick={() => navigate('/login')}>Login</button>
          </div>

          <div className="mt-4 text-center">
            <button type="button" className="text-gray-500 text-sm hover:text-gray-700 underline" onClick={() => navigate('/')}>Continue without logging in</button>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h2>
            <p className="text-gray-600 text-sm mb-8">Create your account in a seconds</p>

            <form className="space-y-6" onSubmit={handleSignUp}>
              <div>
                <input 
                  type="text" 
                  required 
                  name='firstName' 
                  onChange={handleChange} 
                  placeholder="First Name" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              
              <div>
                <input 
                  type="text" 
                  required 
                  name='lastName' 
                  onChange={handleChange} 
                  placeholder="Last Name" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              
              <div>
                <input 
                  type="email" 
                  required 
                  name='email' 
                  onChange={handleChange} 
                  placeholder="Email Address" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>

              <div className="flex">
                <div className="flex items-center px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-sm">
                  🇦🇿 (+994)
                </div>
                <input 
                  type="tel" 
                  required 
                  name='phoneNumber' 
                  onChange={handleChange} 
                  placeholder="xxx xx xx" 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  minLength={8} 
                  id="signupPassword" 
                  name='password' 
                  onChange={handleChange} 
                  placeholder="Create Password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12" 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform cursor-pointer -translate-y-1/2 text-gray-400" 
                  onClick={() => togglePassword('signupPassword')}
                >
                  👁
                </button>
              </div>

              <div className="relative">
                <input 
                  type="password" 
                  required 
                  minLength={8} 
                  id="confirmpass" 
                  name='confirmPassword' 
                  onChange={handleChange} 
                  placeholder="Confirm Password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12" 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform cursor-pointer -translate-y-1/2 text-gray-400" 
                  onClick={() => togglePassword('confirmpass')}
                >
                  👁
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSignLoading} 
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
              >
                {isSignLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Create an account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already a member? <button type="button" className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Login</button>
            </div>

            <div className="mt-4 text-center">
              <button type="button" className="text-gray-500 text-sm hover:text-gray-700 underline" onClick={() => navigate('/')}>Continue without logging in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
