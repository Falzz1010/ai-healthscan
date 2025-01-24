import React, { useState, useEffect } from 'react';
import { Stethoscope, Building2, MessageSquare, AlertCircle, Moon, Sun, Info, History } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link, Routes, Route } from 'react-router-dom';
import NotFound from './components/NotFound';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface HealthFacility {
  name: string;
  type: string;
  address: string;
  distance: string;
}

interface DiagnosisHistory {
  date: string;
  symptoms: string[];
  diagnosis: {
    possibleConditions: string[];
    severity: 'rendah' | 'sedang' | 'tinggi';
    recommendation: string;
  };
}

// Enhanced AI diagnosis logic with improved accuracy
const diagnoseSymptoms = async (symptoms: string[]): Promise<{
  possibleConditions: string[];
  severity: 'rendah' | 'sedang' | 'tinggi';
  recommendation: string;
}> => {
  // Tambahkan rate limiting sederhana
  const lastCallTime = localStorage.getItem('lastDiagnosisTime');
  const now = Date.now();
  if (lastCallTime && now - parseInt(lastCallTime) < 5000) { // 5 detik cooldown
    throw new Error('Mohon tunggu beberapa saat sebelum melakukan diagnosis baru');
  }
  localStorage.setItem('lastDiagnosisTime', now.toString());

  try {
    // Validasi input
    if (!Array.isArray(symptoms) || symptoms.length === 0 || symptoms.length > 3) {
      throw new Error('Jumlah gejala tidak valid (1-3 gejala)');
    }

    if (symptoms.some(symptom => !commonSymptoms.includes(symptom))) {
      throw new Error('Ditemukan gejala yang tidak valid');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Anda adalah sistem AI diagnostik medis yang sangat terlatih dengan pengetahuan medis komprehensif. Analisis gejala berikut dengan sangat teliti dan berikan diagnosis dalam Bahasa Indonesia: ${symptoms.join(', ')}

PANDUAN ANALISIS MENDALAM:
1. Evaluasi setiap gejala:
   - Durasi dan intensitas gejala
   - Gejala utama vs gejala sekunder
   - Pola kemunculan gejala
   - Faktor pemicu atau yang memperburuk

2. Analisis hubungan antar gejala:
   - Keterkaitan patofisiologis
   - Sindrom atau pola penyakit yang umum
   - Kemungkinan komplikasi

3. Pertimbangan faktor risiko:
   - Tingkat kegawatdaruratan
   - Potensi penyebaran (jika infeksius)
   - Risiko komplikasi jangka pendek
   - Dampak jangka panjang

SISTEM PENILAIAN KEPARAHAN:
1. Gejala Kritis (Tinggi):
   - Sesak nafas berat/kesulitan bernafas
   - Nyeri dada akut
   - Penurunan kesadaran
   - Demam sangat tinggi (>40°C)
   - Kejang
   - Perdarahan tidak terkontrol
   - Muntah/diare parah dengan dehidrasi
   - Kelemahan/kelumpuhan mendadak
   - Kebingungan mental akut
   - Nyeri hebat yang tidak tertahankan

2. Gejala Sedang:
   - Demam 38.5-40°C
   - Sesak nafas ringan-sedang
   - Muntah/diare persisten
   - Nyeri sedang yang mengganggu aktivitas
   - Pusing berputar (vertigo)
   - Dehidrasi ringan-sedang
   - Batuk produktif terus-menerus
   - Nyeri perut yang menetap
   - Gejala infeksi yang memburuk
   - Kelemahan umum yang mengganggu aktivitas

3. Gejala Ringan:
   - Demam ringan (<38.5°C)
   - Batuk ringan
   - Pilek/hidung tersumbat
   - Nyeri ringan
   - Kelelahan ringan
   - Sakit kepala ringan
   - Mual ringan
   - Gejala alergi ringan
   - Gejala flu ringan
   - Gangguan tidur ringan

ATURAN PENENTUAN TINGKAT KEPARAHAN:
1. Tinggi (Harus memenuhi minimal SATU kriteria):
   - Terdapat MINIMAL SATU gejala kritis
   - Kombinasi gejala yang berpotensi mengancam jiwa
   - Membutuhkan penanganan medis segera
   - Risiko komplikasi serius dalam 24-48 jam

2. Sedang (Harus memenuhi minimal SATU kriteria):
   - Terdapat MINIMAL DUA gejala sedang
   - Gejala mengganggu aktivitas sehari-hari
   - Memerlukan evaluasi medis dalam 24-72 jam
   - Berpotensi memburuk jika tidak ditangani

3. Rendah (Harus memenuhi SEMUA kriteria):
   - Hanya terdapat gejala ringan
   - Tidak ada gejala kritis atau sedang
   - Aktivitas sehari-hari tidak terganggu signifikan
   - Dapat ditangani dengan perawatan mandiri

FORMAT RESPONS (JSON):
{
  "possibleConditions": [
    "Diagnosis primer dengan penjelasan singkat",
    "Diagnosis diferensial pertama",
    "Diagnosis diferensial kedua"
  ],
  "severity": "rendah/sedang/tinggi",
  "severityReason": "Penjelasan detail mengapa tingkat keparahan ini dipilih, berdasarkan kriteria spesifik yang terpenuhi",
  "recommendation": "Rekomendasi terperinci mencakup:
    1. Tindakan segera yang diperlukan
    2. Pengobatan yang disarankan (termasuk dosis jika relevan)
    3. Perubahan gaya hidup dan diet
    4. Tanda-tanda perburukan yang perlu diwaspadai
    5. Kapan harus mencari bantuan medis darurat
    6. Tindakan pencegahan dan pemulihan"
}

ATURAN PENTING:
1. Evaluasi SETIAP gejala terhadap kriteria keparahan
2. Pertimbangkan interaksi dan efek kumulatif gejala
3. Selalu prioritaskan keselamatan pasien
4. Berikan penjelasan logis untuk tingkat keparahan yang dipilih
5. Sertakan rekomendasi spesifik sesuai tingkat keparahan
6. Pertimbangkan faktor risiko dan komorbiditas
7. Dokumentasikan alasan penentuan tingkat keparahan

Berikan respons dalam format JSON yang valid, tanpa teks tambahan.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Enhanced text cleaning and validation
    text = text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format respons tidak valid');
    }
    
    const jsonText = jsonMatch[0];
    const parsedResponse = JSON.parse(jsonText);
    
    // Comprehensive response validation
    if (!parsedResponse || typeof parsedResponse !== 'object') {
      throw new Error('Struktur respons tidak valid');
    }
    
    // Enhanced response processing with severity explanation
    return {
      possibleConditions: Array.isArray(parsedResponse.possibleConditions) 
        ? parsedResponse.possibleConditions
            .filter(condition => typeof condition === 'string' && condition.trim().length > 0)
            .slice(0, 3)
        : ['Tidak dapat menentukan diagnosis spesifik'],
      severity: ['rendah', 'sedang', 'tinggi'].includes(parsedResponse.severity)
        ? parsedResponse.severity as 'rendah' | 'sedang' | 'tinggi'
        : 'rendah',
      recommendation: typeof parsedResponse.recommendation === 'string' && parsedResponse.recommendation.trim().length > 0
        ? `${parsedResponse.recommendation}\n\nAlasan tingkat keparahan: ${parsedResponse.severityReason || 'Tidak tersedia'}`
        : 'Silakan konsultasikan dengan dokter untuk evaluasi lebih lanjut.'
    };
  } catch (error) {
    console.error('Detailed error in AI diagnosis:', error);
    
    let errorMessage = 'Terjadi kesalahan dalam memproses diagnosis';
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        errorMessage = 'Terlalu banyak permintaan. Mohon tunggu beberapa saat.';
      } else if (error.message.includes('invalid')) {
        errorMessage = 'Input tidak valid. Mohon periksa kembali gejala yang dipilih.';
      }
    }
    
    throw new Error(errorMessage);
  }
};

// Replace fetchHealthFacilities function
const fetchHealthFacilities = async (location: string = 'Jakarta'): Promise<HealthFacility[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Sebagai sistem informasi kesehatan yang komprehensif, berikan rekomendasi 3 fasilitas kesehatan NYATA dan TERVERIFIKASI di ${location}.

KRITERIA PEMILIHAN:
1. Prioritaskan rumah sakit dengan:
   - Fasilitas lengkap dan modern
   - Layanan gawat darurat 24 jam
   - Reputasi dan akreditasi baik
   - Aksesibilitas lokasi

FORMAT RESPONS (JSON):
{
  "facilities": [
    {
      "name": "Nama lengkap dan resmi fasilitas kesehatan",
      "type": "Tipe spesifik (RS Umum/RS Khusus/Klinik) dan level pelayanan",
      "address": "Alamat lengkap dan detail termasuk landmark",
      "distance": "Perkiraan jarak dalam KM dari pusat ${location}"
    }
  ]
}

ATURAN PENTING:
1. Hanya cantumkan fasilitas kesehatan yang BENAR-BENAR ADA
2. Pastikan informasi lokasi dan jarak AKURAT
3. Prioritaskan fasilitas dengan pelayanan KOMPREHENSIF
4. Sertakan informasi SPESIFIK tentang tipe dan level pelayanan

Berikan respons dalam format JSON yang valid, tanpa teks tambahan.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    return parsedResponse.facilities || [];
  } catch (error) {
    console.error('Error fetching health facilities:', error);
    return [];
  }
};

const commonSymptoms = [
  'Sakit Kepala',
  'Demam',
  'Batuk',
  'Kelelahan',
  'Sakit Tenggorokan',
  'Nyeri Badan',
  'Mual',
  'Pusing',
  'Pilek',
  'Sesak Nafas',
  'Diare',
  'Kehilangan Nafsu Makan'
];

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<{
    possibleConditions: string[];
    severity: 'rendah' | 'sedang' | 'tinggi';
    recommendation: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [healthFacilities, setHealthFacilities] = useState<HealthFacility[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState('Jakarta');
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistory[]>(() => {
    const saved = localStorage.getItem('diagnosisHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchHistory, setSearchHistory] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchHealthFacilities().then(facilities => {
      setHealthFacilities(facilities);
    });
  }, []);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      }
      
      if (prev.length >= 3) {
        Swal.fire({
          title: 'Peringatan',
          text: 'Anda hanya dapat memilih maksimal 3 gejala',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6'
        });
        return prev;
      }
      
      return [...prev, symptom];
    });
    setError(null);
  };

  const handleLocationSearch = async (location: string) => {
    if (!diagnosis) {
      Swal.fire({
        title: 'Error',
        text: 'Silakan lakukan diagnosis terlebih dahulu sebelum mencari fasilitas kesehatan',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setIsLoading(true);
    try {
      const facilities = await fetchHealthFacilities(location);
      setHealthFacilities(facilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnosis = async () => {
    if (selectedSymptoms.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Silakan pilih minimal satu gejala',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await diagnoseSymptoms(selectedSymptoms);
      setDiagnosis(result);
      
      // Add to history
      const newHistory: DiagnosisHistory = {
        date: new Date().toISOString(),
        symptoms: selectedSymptoms,
        diagnosis: result
      };
      
      setDiagnosisHistory(prev => {
        const updated = [newHistory, ...prev].slice(0, 10); // Keep last 10 entries
        localStorage.setItem('diagnosisHistory', JSON.stringify(updated));
        return updated;
      });
      
      if (result.severity === 'tinggi') {
        Swal.fire({
          title: 'Perhatian!',
          text: 'Gejala Anda terindikasi memiliki tingkat keparahan tinggi. Segera kunjungi fasilitas kesehatan terdekat.',
          icon: 'warning',
          confirmButtonText: 'Lihat Faskes Terdekat',
          confirmButtonColor: '#3B82F6'
        });
      }
    } catch (error) {
      console.error('Error getting diagnosis:', error);
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan saat memproses diagnosis. Silakan coba lagi.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportDiagnosis = () => {
    if (!diagnosis) return;
    
    const report = `
Laporan Diagnosis Kesehatan
Tanggal: ${new Date().toLocaleDateString('id-ID')}

Gejala yang dialami:
${selectedSymptoms.join(', ')}

Kemungkinan Kondisi:
${diagnosis.possibleConditions.join('\n')}

Tingkat Keparahan: ${diagnosis.severity}

Rekomendasi:
${diagnosis.recommendation}

Catatan: Ini adalah diagnosis awal berbasis AI. Harap konsultasikan dengan tenaga medis profesional.
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnosis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareViaWhatsApp = () => {
    if (!diagnosis) return;
    
    const text = `
*Hasil Diagnosis Kesehatan*
Tanggal: ${new Date().toLocaleDateString('id-ID')}

*Gejala:*
${selectedSymptoms.join(', ')}

*Kemungkinan Kondisi:*
${diagnosis.possibleConditions.join('\n')}

*Tingkat Keparahan:* ${diagnosis.severity}

*Rekomendasi:*
${diagnosis.recommendation}

_Ini adalah diagnosis awal berbasis AI. Harap konsultasikan dengan tenaga medis profesional._
    `.trim();

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleDeleteHistory = (index: number) => {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah Anda yakin ingin menghapus riwayat diagnosis ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#3B82F6',
    }).then((result) => {
      if (result.isConfirmed) {
        setDiagnosisHistory(prev => {
          const updated = prev.filter((_, i) => i !== index);
          localStorage.setItem('diagnosisHistory', JSON.stringify(updated));
          return updated;
        });
        
        Swal.fire({
          title: 'Berhasil',
          text: 'Riwayat diagnosis telah dihapus',
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
      }
    });
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

  const DiagnosisHistoryComponent = () => (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 mt-8 ${
      darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">Riwayat Diagnosis</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className={`px-3 py-1.5 rounded-md flex-1 sm:flex-none ${
                darkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className={`px-3 py-1.5 rounded-md flex-1 sm:flex-none ${
                darkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <input
            type="text"
            placeholder="Cari riwayat..."
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            className={`px-3 py-1.5 rounded-md w-full sm:w-64 ${
              darkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-50 border border-gray-200 text-gray-900'
            }`}
          />
        </div>
      </div>
      {filteredHistory.length === 0 ? (
        <p className="text-gray-500">Tidak ada riwayat diagnosis yang sesuai</p>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {filteredHistory.map((entry, index) => (
            <div key={index} className={`p-4 rounded-lg shadow-sm relative ${
              darkMode
                ? 'bg-gray-700'
                : 'bg-white border border-gray-200'
            }`}>
              <button
                onClick={() => handleDeleteHistory(index)}
                className={`absolute top-2 right-2 p-1 rounded-full hover:bg-red-500/10`}
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
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDeleteHistory(index)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    darkMode
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                  }`}
                >
                  Hapus
                </button>
                <button
                  onClick={() => exportDiagnosis()}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    darkMode
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                  }`}
                >
                  Ekspor
                </button>
                <button
                  onClick={() => shareViaWhatsApp()}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    darkMode
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                  }`}
                >
                  Bagikan
                </button>
              </div>
              <span className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {new Date(entry.date).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <p className="font-medium">Gejala: {entry.symptoms.join(', ')}</p>
              <p>Diagnosis: {entry.diagnosis.possibleConditions.join(', ')}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                entry.diagnosis.severity === 'tinggi'
                  ? darkMode
                    ? 'bg-red-900/50 text-red-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                  : entry.diagnosis.severity === 'sedang'
                    ? darkMode
                      ? 'bg-yellow-900/50 text-yellow-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : darkMode
                    ? 'bg-green-900/50 text-green-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {entry.diagnosis.severity.charAt(0).toUpperCase() + entry.diagnosis.severity.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Add custom scrollbar styles to your CSS
  const scrollbarStyles = `
    /* For Webkit browsers (Chrome, Safari) */
    .overflow-y-auto::-webkit-scrollbar {
      width: 8px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
      background: ${darkMode ? '#1f2937' : '#f3f4f6'};
      border-radius: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: ${darkMode ? '#4b5563' : '#d1d5db'};
      border-radius: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: ${darkMode ? '#6b7280' : '#9ca3af'};
    }

    /* For Firefox */
    .overflow-y-auto {
      scrollbar-width: thin;
      scrollbar-color: ${darkMode ? '#4b5563 #1f2937' : '#d1d5db #f3f4f6'};
    }
  `;

  // Add the styles to the head of the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [darkMode]);

  // Update the AboutModal component
  const AboutModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      showAbout ? 'opacity-100' : 'opacity-0 pointer-events-none'
    } transition-opacity duration-300`}>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowAbout(false)}
      />
      <div className={`relative w-full max-w-lg transform transition-all duration-300 ${
        showAbout ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <div className={`overflow-y-auto max-h-[90vh] p-4 sm:p-6 rounded-xl shadow-2xl ${
          darkMode ? 'bg-gray-800/95' : 'bg-white/95'
        } backdrop-blur-sm`}>
          <button
            onClick={() => setShowAbout(false)}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700/80 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Stethoscope className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Tentang Aplikasi
              </h2>
            </div>

            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className={`p-3 sm:p-4 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <p className="text-sm sm:text-base leading-relaxed">
                  AI HealthScan adalah aplikasi inovatif yang menggunakan kecerdasan buatan 
                  untuk memberikan diagnosis awal berdasarkan gejala yang dialami pengguna.
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h3 className={`text-sm sm:text-base font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Fitur Utama
                </h3>
                <ul className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  {[
                    'Diagnosis berbasis AI',
                    'Pencarian faskes terdekat',
                    'Riwayat diagnosis',
                    'Ekspor hasil',
                    'Mode gelap/terang',
                    'Antarmuka responsif'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className={`w-1 h-1 rounded-full ${
                        darkMode ? 'bg-blue-400' : 'bg-blue-600'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border ${
                darkMode 
                  ? 'border-red-500/20 bg-red-500/5' 
                  : 'border-red-100 bg-red-50'
              }`}>
                <h3 className={`text-sm sm:text-base font-semibold mb-2 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  Peringatan Penting
                </h3>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  Aplikasi ini hanya untuk tujuan edukasi dan tidak menggantikan konsultasi 
                  dengan tenaga medis profesional.
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h3 className={`text-sm sm:text-base font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Kontak & Informasi
                </h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p>Email: naufalrizkyputera@gmail.com</p>
                  <p>Telepon: 0881-6771-6665</p>
                  <p>Versi: 1.0.0 (Beta)</p>
                  <p>Teknologi: React, TypeScript, Tailwind</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={
        <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
          darkMode 
            ? 'bg-gray-900 text-white' 
            : 'bg-gray-50 text-gray-900'
        }`}>
          <header className={`${
            darkMode 
              ? 'bg-gray-800 shadow-md' 
              : 'bg-white shadow-sm border-b border-gray-200'
          } sticky top-0 z-40 transition-colors duration-200`}>
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Stethoscope className={`h-8 w-8 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h1 className="text-xl sm:text-2xl font-bold">
                    AI HealthScan
                  </h1>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Link
                    to="/history"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">Riwayat</span>
                  </Link>
                  <button
                    onClick={() => setShowAbout(true)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800'
                    }`}
                  >
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">Tentang</span>
                  </button>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-full transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                    }`}
                  >
                    {darkMode ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <AboutModal />

          <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-8">
              <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Periksa Gejala
                  </h2>
                </div>
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Pilih maksimal 3 gejala yang Anda alami untuk mendapatkan diagnosis awal.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => handleSymptomToggle(symptom)}
                      className={`p-2 rounded-md text-sm transition-colors w-full ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : darkMode
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
                <div className="mb-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Gejala terpilih ({selectedSymptoms.length}/3): {selectedSymptoms.join(', ')}
                  </p>
                </div>
                <button
                  onClick={handleDiagnosis}
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-md transition-colors ${
                    isLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isLoading ? 'Memproses...' : 'Dapatkan Diagnosis'}
                </button>
              </div>

              <div className={`rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800' 
                  : 'bg-white border border-gray-200'
              } h-auto md:h-[600px] flex flex-col`}>
                <div className="flex items-center space-x-2 mb-4">
                  <Building2 className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Hasil Diagnosis
                  </h2>
                </div>
                
                <div className="overflow-y-auto flex-1">
                  {diagnosis ? (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Kemungkinan Kondisi:
                        </h3>
                        <ul className={`list-disc list-inside ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {diagnosis.possibleConditions.map(condition => (
                            <li key={condition}>{condition}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mb-4">
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Tingkat Keparahan:
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                          diagnosis.severity === 'tinggi'
                            ? 'bg-red-100 text-red-700'
                            : diagnosis.severity === 'sedang'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Rekomendasi:
                        </h3>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {diagnosis.recommendation}
                        </p>
                      </div>

                      {healthFacilities.length > 0 && (
                        <div className="mt-6">
                          <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Rekomendasi Fasilitas Kesehatan:
                          </h3>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {healthFacilities.map((facility, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-md border ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600' 
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {facility.name}
                                </h4>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {facility.type}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {facility.address}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Jarak: {facility.distance}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`p-4 rounded-md mt-4 ${
                        darkMode ? 'bg-blue-900/20' : 'bg-blue-50 border border-blue-100'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                            Ini adalah diagnosis awal berbasis AI. Selalu konsultasikan dengan tenaga medis profesional.
                          </p>
                        </div>
                      </div>

                      <div className="mb-6 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={exportDiagnosis}
                          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Ekspor
                        </button>
                        <button
                          onClick={shareViaWhatsApp}
                          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Bagikan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Pilih gejala dan klik "Dapatkan Diagnosis" untuk melihat hasil
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Masukkan lokasi..."
                      className={`flex-1 p-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={() => handleLocationSearch(searchLocation)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Cari
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className={`mt-auto transition-colors duration-200 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50 border-t border-gray-200'
          }`}>
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2024 Diagnosis Kesehatan AI. Ini adalah proyek demonstrasi. Tidak untuk penggunaan medis yang sebenarnya.
              </p>
            </div>
          </footer>
        </div>
      } />
      
      <Route path="/history" element={
        <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-50 to-white'
        }`}>
          <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800'
                    }`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span className="font-medium">Kembali</span>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <History className={`h-6 w-6 sm:h-8 sm:w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Riwayat Diagnosis
                    </h1>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <DiagnosisHistoryComponent />
          </main>

          <footer className={`mt-auto transition-colors duration-200 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50 border-t border-gray-200'
          }`}>
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                © 2024 Diagnosis Kesehatan AI. Ini adalah proyek demonstrasi. Tidak untuk penggunaan medis yang sebenarnya.
              </p>
            </div>
          </footer>
        </div>
      } />

      <Route path="*" element={<NotFound darkMode={darkMode} />} />
    </Routes>
  );
}

export default App;





