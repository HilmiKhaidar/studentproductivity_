# 📦 Panduan Instalasi Student Productivity Hub

## Prasyarat

Sebelum memulai, pastikan kamu sudah menginstall:

### 1. Node.js dan npm

**Download dan Install Node.js:**
- Kunjungi: https://nodejs.org/
- Download versi LTS (Long Term Support) - Recommended
- Jalankan installer dan ikuti instruksi
- Node.js akan otomatis menginstall npm (Node Package Manager)

**Verifikasi Instalasi:**
```bash
node --version
npm --version
```

Jika muncul versi number, berarti instalasi berhasil!

## Langkah Instalasi Aplikasi

### 1. Extract atau Clone Project

Jika kamu mendapat file ZIP:
```bash
# Extract file ZIP ke folder yang diinginkan
# Buka Command Prompt atau PowerShell
# Navigate ke folder project
cd path/to/student-productivity-hub
```

Jika dari Git:
```bash
git clone <repository-url>
cd student-productivity-hub
```

### 2. Install Dependencies

Jalankan perintah berikut di terminal/command prompt:

```bash
npm install
```

Proses ini akan:
- Download semua package yang dibutuhkan
- Membuat folder `node_modules`
- Memakan waktu 2-5 menit tergantung koneksi internet

### 3. Jalankan Development Server

Setelah instalasi selesai:

```bash
npm run dev
```

Output yang akan muncul:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4. Buka di Browser

- Buka browser (Chrome, Firefox, Edge, dll)
- Akses: `http://localhost:5173`
- Aplikasi siap digunakan! 🎉

## Build untuk Production

Jika ingin membuat versi production:

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

Untuk preview build:
```bash
npm run preview
```

## Troubleshooting

### Error: npm not found
**Solusi:** Install Node.js terlebih dahulu dari https://nodejs.org/

### Error: Port 5173 already in use
**Solusi:** 
- Tutup aplikasi lain yang menggunakan port tersebut
- Atau edit `vite.config.ts` untuk menggunakan port lain:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000 // ganti dengan port yang diinginkan
  }
})
```

### Error saat npm install
**Solusi:**
```bash
# Hapus folder node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

### Aplikasi lambat atau tidak responsive
**Solusi:**
- Clear browser cache
- Gunakan browser modern (Chrome, Firefox, Edge versi terbaru)
- Pastikan tidak ada extension browser yang mengganggu

### Data hilang setelah clear browser
**Catatan:** Data disimpan di LocalStorage browser. Jika clear browser data, data aplikasi akan hilang. Untuk backup:
- Export data (fitur akan datang)
- Atau jangan clear LocalStorage saat clear browser data

## Sistem Requirements

### Minimum:
- **OS:** Windows 7+, macOS 10.12+, Linux
- **RAM:** 2GB
- **Browser:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Node.js:** v16.0.0 atau lebih baru
- **Disk Space:** 500MB untuk node_modules

### Recommended:
- **OS:** Windows 10/11, macOS 12+, Ubuntu 20.04+
- **RAM:** 4GB+
- **Browser:** Chrome/Edge versi terbaru
- **Node.js:** v18.0.0 atau lebih baru
- **Disk Space:** 1GB
- **Internet:** Untuk download dependencies (hanya saat install)

## Tips Penggunaan

1. **Development Mode:**
   - Gunakan `npm run dev` untuk development
   - Hot reload otomatis saat edit code
   - Error messages lebih detail

2. **Production Mode:**
   - Gunakan `npm run build` untuk production
   - File lebih kecil dan optimal
   - Deploy folder `dist/` ke hosting

3. **Browser Notifications:**
   - Izinkan notifikasi browser untuk fitur Pomodoro
   - Klik "Allow" saat diminta permission

4. **Data Persistence:**
   - Data tersimpan otomatis di browser
   - Tidak perlu login atau registrasi
   - Backup data secara manual jika perlu

## Struktur Folder

```
student-productivity-hub/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── store/          # Zustand store
│   ├── types/          # TypeScript types
│   ├── utils/          # Helper functions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
└── tailwind.config.js  # Tailwind config
```

## Update Aplikasi

Jika ada update baru:

```bash
# Pull update (jika dari Git)
git pull

# Install dependencies baru
npm install

# Jalankan aplikasi
npm run dev
```

## Uninstall

Untuk menghapus aplikasi:

1. Hapus folder project
2. (Opsional) Hapus Node.js dari Control Panel jika tidak digunakan lagi

## Support

Jika mengalami masalah:
1. Cek dokumentasi di README.md
2. Cek error message di console browser (F12)
3. Pastikan semua dependencies terinstall dengan benar
4. Coba restart development server

---

Selamat menggunakan Student Productivity Hub! 🚀
