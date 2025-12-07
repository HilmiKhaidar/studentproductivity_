# 🎓 Student Productivity Hub

Aplikasi web modern dan komprehensif untuk membantu mahasiswa mengelola waktu, produktivitas, pola tidur, dan kebiasaan dengan efektif.

## ✨ Fitur Utama

### 📊 Dashboard Interaktif
- Statistik produktivitas real-time
- Visualisasi data dengan grafik interaktif
- Skor produktivitas harian
- Quick access ke tugas mendesak dan target aktif

### ✅ Manajemen Tugas
- Buat, edit, dan hapus tugas dengan mudah
- Kategorisasi tugas (Belajar, Tugas, Ujian, Proyek, Personal)
- Prioritas tugas (Rendah, Sedang, Tinggi, Mendesak)
- Filter dan pencarian advanced
- Estimasi waktu pengerjaan
- Tracking deadline

### 🌙 Pelacak Tidur
- Catat jam tidur dan bangun
- Analisis kualitas tidur
- Grafik durasi tidur 14 hari
- Target jam tidur personal
- Tracking gangguan tidur
- Insights pola tidur

### ⏱️ Pomodoro Timer
- Timer fokus dengan teknik Pomodoro
- Kustomisasi durasi kerja dan istirahat
- Tracking sesi Pomodoro
- Statistik produktivitas harian
- Notifikasi browser
- Visual progress indicator

### 🎯 Target & Tujuan
- Set target akademik dan personal
- Milestone tracking
- Progress bar visual
- Kategori target
- Deadline management

### ⚡ Pelacak Kebiasaan
- Bangun kebiasaan baik
- Streak tracking
- Calendar view mingguan
- Warna kustom per kebiasaan
- Statistik kebiasaan

### 📈 Analitik & Insights
- Analisis produktivitas 30 hari
- Grafik performa per kategori
- Insights dan rekomendasi AI
- Tingkat penyelesaian tugas
- Rata-rata tidur
- Total sesi Pomodoro

### 📅 Kalender
- View bulanan dengan aktivitas
- Indikator tugas dan Pomodoro
- Tracking tidur
- Navigasi bulan
- Highlight hari ini

### ⚙️ Pengaturan
- Kustomisasi durasi Pomodoro
- Target tidur personal
- Notifikasi browser
- Mode gelap (coming soon)
- Preferensi personal

## 🚀 Teknologi

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand dengan persist
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 📦 Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd student-productivity-hub
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser dan akses:
```
http://localhost:5173
```

## 🏗️ Build untuk Production

```bash
npm run build
```

File production akan ada di folder `dist/`

## 📱 Fitur Browser

- **LocalStorage**: Data tersimpan di browser (tidak hilang saat refresh)
- **Notifications**: Notifikasi browser untuk Pomodoro timer
- **Responsive**: Tampilan optimal di desktop, tablet, dan mobile
- **PWA Ready**: Bisa diinstall sebagai aplikasi

## 🎨 Desain

- **Modern UI**: Glassmorphism design dengan gradient
- **Smooth Animations**: Transisi halus antar komponen
- **Color Coded**: Kategori dan prioritas dengan warna berbeda
- **Dark Theme**: Background gradient purple-indigo
- **Accessible**: Desain yang mudah digunakan

## 📊 Data Storage

Semua data disimpan di browser menggunakan LocalStorage:
- Tasks
- Sleep Records
- Pomodoro Sessions
- Goals & Milestones
- Habits & Streaks
- User Settings

## 🔒 Privacy

- **100% Offline**: Tidak ada data yang dikirim ke server
- **Local Only**: Semua data tersimpan di browser kamu
- **No Tracking**: Tidak ada analytics atau tracking
- **Secure**: Data hanya bisa diakses dari browser kamu

## 💡 Tips Penggunaan

1. **Mulai dengan Target**: Set target semester/tahun di menu Goals
2. **Buat Kebiasaan**: Tambahkan kebiasaan baik di menu Habits
3. **Gunakan Pomodoro**: Tingkatkan fokus dengan teknik Pomodoro
4. **Catat Tidur**: Track pola tidur untuk produktivitas optimal
5. **Review Analytics**: Lihat insights mingguan untuk improvement

## 🤝 Kontribusi

Aplikasi ini dibuat untuk membantu mahasiswa meningkatkan produktivitas dan manajemen waktu. Feel free to customize sesuai kebutuhan!

## 📄 License

MIT License - Free to use and modify

## 🎯 Roadmap

- [ ] Export data ke PDF/Excel
- [ ] Sync antar device
- [ ] Mobile app (React Native)
- [ ] AI recommendations
- [ ] Study group features
- [ ] Integration dengan Google Calendar
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

---

Dibuat dengan ❤️ untuk mahasiswa Indonesia
