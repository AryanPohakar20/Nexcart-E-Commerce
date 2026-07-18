import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[500px] flex items-center justify-center py-6">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-6">
        <h1 className="text-6xl font-black text-primary tracking-wider animate-pulse">404</h1>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Lost in Orbit</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">The page you are trying to browse does not exist or has been shifted in the galaxy.</p>
        </div>
        <Link to="/" className="btn-glow-yellow text-xs font-bold py-3 block text-center">
          Return Storefront
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
