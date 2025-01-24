# AI HealthScan

AI HealthScan adalah aplikasi berbasis web yang menggunakan kecerdasan buatan untuk memberikan diagnosis awal berdasarkan gejala yang dialami pengguna. Aplikasi ini dibangun menggunakan React, TypeScript, dan Tailwind CSS.

![AI HealthScan Screenshot](screenshot.png)

## 🌟 Fitur Utama

- 🔍 Diagnosis berbasis AI menggunakan Google Gemini Pro
- 🏥 Pencarian fasilitas kesehatan terdekat
- 📊 Riwayat diagnosis dengan fitur pencarian dan filter
- 📱 Antarmuka responsif dan mudah digunakan
- 🌓 Mode gelap/terang
- 📤 Ekspor hasil diagnosis
- 💬 Berbagi hasil via WhatsApp

## 🛠️ Teknologi yang Digunakan

- React 18
- TypeScript
- Tailwind CSS
- Google Generative AI (Gemini Pro)
- React Router DOM
- Lucide React (Icons)
- SweetAlert2
- Axios

## 📋 Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:

- Node.js (versi 14 atau lebih baru)
- npm atau yarn
- Google Gemini API Key

## ⚙️ Instalasi

1. Clone repositori

```bash
git clone https://github.com/username/ai-healthscan.git
cd ai-healthscan
```

2. Instal dependensi
```bash
npm install
# atau
yarn install
```

3. Salin file `.env.example` ke `.env`
```bash
cp .env.example .env
```

4. Atur API key Gemini di file `.env`
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

5. Jalankan aplikasi dalam mode development
```bash
npm run dev
# atau
yarn dev
```

## 🚀 Memulai

1. Buka aplikasi di browser (default: http://localhost:5173)
2. Pilih gejala yang dialami (maksimal 3 gejala)
3. Klik "Dapatkan Diagnosis" untuk melihat hasil
4. Lihat rekomendasi fasilitas kesehatan terdekat
5. Ekspor atau bagikan hasil diagnosis jika diperlukan

## 📱 Tampilan Responsif

Aplikasi mendukung berbagai ukuran layar:
- Desktop (> 1024px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🔒 Keamanan

- Validasi input pengguna
- Sanitasi data API
- Penanganan error yang aman
- Rate limiting untuk API calls

## 🌐 API Endpoints

Aplikasi menggunakan Google Gemini API untuk:
- Analisis gejala dan diagnosis
- Pencarian fasilitas kesehatan

## 📦 Build untuk Production

```bash
npm run build
# atau
yarn build
```

File build akan tersedia di folder `dist`

## 🧪 Testing

```bash
npm run test
# atau
yarn test
```

## 📄 Lisensi

[MIT License](LICENSE)

## ⚠️ Disclaimer

Aplikasi ini hanya untuk tujuan edukasi dan demonstrasi. Tidak direkomendasikan untuk menggantikan konsultasi dengan tenaga medis profesional.

## 📞 Kontak

Naufal Rizky Putera - naufalrizkyputera@gmail.com

## 🙏 Pengakuan

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Generative AI](https://ai.google.dev/)
- [Lucide Icons](https://lucide.dev/)
- [SweetAlert2](https://sweetalert2.github.io/)

---

Dibuat dengan ❤️ oleh [Naufal Rizky Putera](https://github.com/username)

