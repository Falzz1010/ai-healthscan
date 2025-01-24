import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

interface NotFoundProps {
  darkMode: boolean;
}

const NotFound: React.FC<NotFoundProps> = ({ darkMode }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-50 to-white'
    }`}>
      <div className="text-center">
        <h1 className={`text-9xl font-bold ${
          darkMode ? 'text-gray-700' : 'text-gray-200'
        }`}>
          404
        </h1>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className={`text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Halaman Tidak Ditemukan
          </h2>
          
          <p className={`mt-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>

          <Link
            to="/"
            className={`mt-8 inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
