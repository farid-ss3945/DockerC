import React from 'react';
import { Home, ShoppingCart } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-200 via-yellow-100 via-green-100 via-blue-100 to-purple-200 flex items-center justify-center">
      {/* Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Diagonal Lines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.5) 10px, rgba(255, 255, 255, 0.5) 11px)'
        }}
      />

      {/* Floating Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-20 h-20 bg-indigo-500 rounded-full opacity-15 top-[10%] left-[10%] animate-float" />
        <div className="absolute w-16 h-16 bg-gray-800 rounded-xl opacity-15 top-[70%] right-[15%] animate-float-delayed" />
        <div className="absolute w-24 h-24 bg-gray-600 rounded-full opacity-15 bottom-[15%] left-[20%] animate-float-more-delayed" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-10 py-12 max-w-2xl animate-fade-in-up">
        {/* 404 Code */}
        <div className="text-[150px] font-black text-gray-800 leading-none mb-5 animate-glitch">
          404
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Səhifə Tapılmadı
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          Üzr istəyirik, axtardığınız səhifə mövcud deyil və ya köçürülüb. 
          Zəhmət olmasa ana səhifəyə qayıdın və ya məhsulları nəzərdən keçirin.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Ana Səhifə
          </button>

          <button
            onClick={() => window.location.href = '/products'}
            className="flex items-center gap-3 px-10 py-4 bg-white text-gray-800 font-semibold rounded-lg shadow-lg border-2 border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
          >
            <ShoppingCart className="w-5 h-5" />
            Məhsullar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glitch {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease;
        }

        .animate-glitch {
          animation: glitch 3s infinite;
        }

        .animate-float {
          animation: float 20s infinite ease-in-out;
        }

        .animate-float-delayed {
          animation: float 20s infinite ease-in-out;
          animation-delay: 5s;
        }

        .animate-float-more-delayed {
          animation: float 20s infinite ease-in-out;
          animation-delay: 10s;
        }

        @media (max-width: 768px) {
          .text-\[150px\] {
            font-size: 100px;
          }
        }
      `}</style>
    </div>
  );
}
