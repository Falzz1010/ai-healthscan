import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Moon, Sun } from 'lucide-react';

interface DiagnosisHistory {
  date: string;
  symptoms: string[];
  diagnosis: {
    possibleConditions: string[];
    severity: 'rendah' | 'sedang' | 'tinggi';
    recommendation: string;
  };
}

const History: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistory[]>(() => {
    const saved = localStorage.getItem('diagnosisHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchHistory, setSearchHistory] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDeleteHistory = (index: number) => {
    const updatedHistory = diagnosisHistory.filter((_, i) => i !== index);
    setDiagnosisHistory(updatedHistory);
    localStorage.setItem('diagnosisHistory', JSON.stringify(updatedHistory));
  };

  const filteredHistory = diagnosisHistory.filter(entry => {
    const entryDate = new Date(entry.date);
    const matchesSearch = entry.symptoms.some(symptom => 
      symptom.toLowerCase().includes(searchHistory.toLowerCase())
    ) || entry.diagnosis.possibleConditions.some(condition =>
      condition.toLowerCase().includes(searchHistory.toLowerCase())
    );
    
    const matchesDate = (!dateRange.start || entryDate >= new Date(dateRange.start)) &&
                       (!dateRange.end || entryDate <= new Date(dateRange.end));
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-50 to-white'
    }`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <HistoryIcon className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Riwayat Diagnosis
              </h1>
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className={`rounded-lg shadow-lg p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <h2 className="text-xl font-semibold">Riwayat Diagnosis</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className={`px-3 py-1 rounded-md ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                }`}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={`px-3 py-1 rounded-md ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                }`}
              />
              <input
                type="text"
                placeholder="Cari riwayat..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className={`px-3 py-1 rounded-md w-full sm:w-64 ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                }`}
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Tidak ada riwayat diagnosis yang sesuai</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredHistory.map((entry, index) => (
                <div key={index} className={`p-4 rounded-md relative ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <button
                    onClick={() => handleDeleteHistory(index)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-500/10"
                    title="Hapus riwayat"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-red-400 hover:text-red-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString('id-ID')}
                  </p>
                  <p className="font-medium mt-2">Gejala: {entry.symptoms.join(', ')}</p>
                  <p className="mt-2">Diagnosis: {entry.diagnosis.possibleConditions.join(', ')}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm mt-2 ${
                    entry.diagnosis.severity === 'tinggi'
                      ? 'bg-red-900/20 text-red-400'
                      : entry.diagnosis.severity === 'sedang'
                        ? 'bg-yellow-900/20 text-yellow-400'
                        : 'bg-green-900/20 text-green-400'
                  }`}>
                    {entry.diagnosis.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className={`mt-auto ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50 border-t border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            © 2024 Diagnosis Kesehatan AI. Ini adalah proyek demonstrasi. Tidak untuk penggunaan medis yang sebenarnya.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default History;
