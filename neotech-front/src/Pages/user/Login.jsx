// Login.jsx
import React, { useState, useEffect } from 'react';
import { useLoginMutation } from '../../store/API';
import { jwtDecode } from "jwt-decode";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from || '/';
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const setCookie = (name, value, expiresAt) => {
    const expires = "expires=" + new Date(expiresAt).toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax; Secure`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      }).unwrap();

      setCookie("token", result.token, result.expiresAt);
      const token = jwtDecode(result.token);

      if (token.role != "Admin") {
        if (from && from !== '/') {
          navigate(from, { replace: true });
        } else {
          window.location.href = '/'
        }
      } else {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error?.status === 401) {
        toast.error("Login failed. Invalid email or password.");
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Log In</h2>
          <p className="text-gray-600 text-sm mb-6">Login your account in a seconds</p>

          <form className="space-y-4" onSubmit={handleLogin}>
            <input 
              type="email" 
              required 
              name='email' 
              onChange={handleChange} 
              placeholder="Email Address" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
            />
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required 
                minLength={8} 
                name='password' 
                onChange={handleChange} 
                placeholder="Password" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12" 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform cursor-pointer -translate-y-1/2 text-gray-400" 
                onClick={togglePassword}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className="text-right">
              <button 
                type="button" 
                className="text-indigo-600 text-sm" 
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isLoginLoading} 
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
            >
              {isLoginLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Log in'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account? <button type="button" className="text-indigo-600" onClick={() => navigate('/register')}>Sign up</button>
          </div>

          <div className="mt-4 text-center">
            <button type="button" className="text-gray-500 text-sm hover:text-gray-700 underline" onClick={() => {navigate('/'); window.location.reload();}}>Continue without logging in</button>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in</h2>
            <p className="text-gray-600 text-sm mb-8">Login your account in a seconds</p>

            <form onSubmit={handleLogin} className="space-y-6">
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
              
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  minLength={8} 
                  name='password' 
                  onChange={handleChange} 
                  placeholder="Password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12" 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400" 
                  onClick={togglePassword}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <div className="text-right">
                <button 
                  type="button" 
                  className="text-indigo-600 text-sm hover:underline" 
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
              >
                {isLoginLoading ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'Log in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account? <button type="button" className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/register')}>Sign up</button>
            </div>

            <div className="mt-4 text-center">
              <button type="button" className="text-gray-500 text-sm hover:text-gray-700 underline" onClick={() => {navigate('/'); window.location.reload();}}>Continue without logging in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


