# 🔐 Fitur OTP Email - Student Productivity Hub

## ✨ Fitur yang Sudah Diimplementasi

### 1. **Email OTP Service** ✅
- Integrasi dengan EmailJS untuk kirim email otomatis
- Generate OTP 6 digit random
- OTP berlaku 5 menit
- Fallback ke console jika EmailJS belum dikonfigurasi

### 2. **Register dengan OTP** ✅
- User register dengan nama, email, password
- Sistem kirim OTP ke email
- User harus verifikasi OTP sebelum bisa login
- Tidak auto-login setelah register

### 3. **Login Manual** ✅
- Setelah verifikasi OTP, user harus login manual
- Validasi email & password
- Hanya user terverifikasi yang bisa login

### 4. **Dark Mode** ✅
- Toggle dark mode di Settings
- Tema hitam-putih (black & white)
- Smooth transition
- Tersimpan di localStorage

---

## 🚀 Cara Menggunakan

### Development Mode (Tanpa Setup EmailJS)

1. **Register:**
   - Klik "Daftar"
   - Isi nama, email, password
   - Klik "Daftar"
   - OTP akan muncul di **console browser (F12)**

2. **Verifikasi OTP:**
   - Buka console (F12)
   - Copy OTP 6 digit
   - Paste di form verifikasi
   - Klik "Verifikasi"

3. **Login:**
   - Setelah verifikasi berhasil
   - Input email & password
   - Klik "Masuk"

### Production Mode (Dengan EmailJS)

1. **Setup EmailJS** (lihat `EMAIL_SETUP.md`)
2. **Update konfigurasi** di `src/utils/emailService.ts`
3. **Test register** - OTP akan dikirim ke email asli!

---

## 📁 File yang Ditambahkan/Diubah

### File Baru:
- `src/utils/emailService.ts` - Service untuk kirim email OTP
- `EMAIL_SETUP.md` - Panduan setup EmailJS
- `OTP_FEATURES.md` - Dokumentasi fitur (file ini)

### File Diubah:
- `src/store/useStore.ts` - Tambah auth logic dengan OTP
- `src/components/Auth.tsx` - UI login/register dengan OTP
- `src/App.tsx` - Handle auth flow & dark mode
- `src/components/Settings.tsx` - Tambah dark mode toggle & logout
- `src/index.css` - Dark mode styles (black & white theme)
- `tailwind.config.js` - Enable dark mode class
- `package.json` - Tambah @emailjs/browser dependency

---

## 🎯 Flow Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTER FLOW                             │
└─────────────────────────────────────────────────────────────┘

1. User klik "Daftar"
   ↓
2. Isi form (nama, email, password)
   ↓
3. Klik "Daftar"
   ↓
4. Sistem generate OTP 6 digit
   ↓
5. Kirim OTP via EmailJS ke email user
   ↓
6. Tampilkan form verifikasi OTP
   ↓
7. User input OTP dari email
   ↓
8. Klik "Verifikasi"
   ↓
9. Sistem validasi OTP
   ↓
10. Jika valid: Akun dibuat & redirect ke login
    Jika invalid: Error message
   ↓
11. User login manual dengan email & password

┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────┘

1. User klik "Masuk"
   ↓
2. Isi email & password
   ↓
3. Klik "Masuk"
   ↓
4. Sistem validasi:
   - Email terdaftar?
   - Password benar?
   - Akun sudah diverifikasi?
   ↓
5. Jika semua valid: Login berhasil → Dashboard
   Jika tidak: Error message

┌─────────────────────────────────────────────────────────────┐
│                    DARK MODE FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. User buka Settings
   ↓
2. Toggle "Mode Gelap"
   ↓
3. Klik "Simpan Pengaturan"
   ↓
4. Dark mode langsung apply
   ↓
5. Setting tersimpan di localStorage
```

---

## 🔒 Keamanan

### ✅ Yang Sudah Diimplementasi:
- OTP 6 digit random
- OTP expire 5 menit
- OTP hanya bisa dipakai 1 kali
- Password minimal 6 karakter
- Email validation
- Hanya user terverifikasi yang bisa login

### ⚠️ Untuk Production:
- Gunakan HTTPS
- Implement rate limiting
- Hash password dengan bcrypt (backend)
- Implement CAPTCHA untuk prevent spam
- Email verification link sebagai alternatif OTP
- 2FA optional

---

## 🎨 Tema Hitam-Putih

### Light Mode:
- Background: Gradient putih-abu (#f5f5f5 → #e0e0e0)
- Cards: White with transparency
- Text: Black/Gray

### Dark Mode:
- Background: Gradient hitam pekat (#0a0a0a → #1a1a1a)
- Cards: Black with transparency
- Text: White/Gray

---

## 📊 Data Storage

### LocalStorage Keys:
- `users` - Array of registered users
- `pending_otp` - Temporary OTP data (5 min)
- `student-productivity-storage` - App state (Zustand persist)

### User Object:
```typescript
{
  id: string;
  email: string;
  password: string; // In production: hash this!
  name: string;
  createdAt: string;
  verified: boolean;
}
```

### Pending OTP Object:
```typescript
{
  email: string;
  otp: string;
  user: User;
  expiresAt: number; // timestamp
}
```

---

## 🧪 Testing

### Test Scenario 1: Register Success
1. Register dengan email baru
2. Cek console untuk OTP
3. Input OTP yang benar
4. Verifikasi berhasil
5. Login dengan email & password
6. Masuk ke dashboard

### Test Scenario 2: Register Duplicate Email
1. Register dengan email yang sudah ada
2. Error: "Email sudah terdaftar!"

### Test Scenario 3: OTP Invalid
1. Register dengan email baru
2. Input OTP yang salah
3. Error: "OTP salah atau sudah kadaluarsa!"

### Test Scenario 4: OTP Expired
1. Register dengan email baru
2. Tunggu 5 menit
3. Input OTP
4. Error: "OTP salah atau sudah kadaluarsa!"

### Test Scenario 5: Login Before Verification
1. Register tapi tidak verifikasi OTP
2. Coba login
3. Error: "Email atau password salah, atau akun belum diverifikasi!"

### Test Scenario 6: Dark Mode
1. Login ke aplikasi
2. Buka Settings
3. Toggle "Mode Gelap"
4. Klik "Simpan Pengaturan"
5. UI berubah ke dark mode
6. Refresh browser - dark mode tetap aktif

---

## 💡 Tips Development

### Lihat OTP di Console:
```javascript
// Buka browser console (F12)
// OTP akan muncul seperti ini:
📧 OTP untuk user@example.com : 123456
```

### Clear Data untuk Testing:
```javascript
// Buka console (F12) dan jalankan:
localStorage.clear();
location.reload();
```

### Test dengan Multiple Users:
```javascript
// User 1
Email: user1@test.com
Password: password123

// User 2
Email: user2@test.com
Password: password456
```

---

## 🐛 Troubleshooting

### OTP tidak muncul di console?
- Buka DevTools (F12)
- Tab "Console"
- Refresh dan register lagi

### Email tidak terkirim?
- Cek `src/utils/emailService.ts`
- Pastikan EmailJS sudah dikonfigurasi
- Lihat `EMAIL_SETUP.md` untuk setup

### Dark mode tidak jalan?
- Buka Settings
- Toggle dark mode
- Klik "Simpan Pengaturan"
- Refresh browser

### Login gagal setelah register?
- Pastikan sudah verifikasi OTP
- Cek email & password benar
- Cek console untuk error

---

## 📚 Resources

- **EmailJS**: https://www.emailjs.com/
- **EmailJS Docs**: https://www.emailjs.com/docs/
- **Zustand**: https://github.com/pmndrs/zustand
- **TailwindCSS Dark Mode**: https://tailwindcss.com/docs/dark-mode

---

## 🎉 Next Steps

### Fitur yang Bisa Ditambahkan:
- [ ] Forgot password dengan email reset
- [ ] Resend OTP button
- [ ] OTP countdown timer (5:00)
- [ ] Email verification link (alternatif OTP)
- [ ] Social login (Google, GitHub)
- [ ] Profile picture upload
- [ ] Change password
- [ ] Delete account
- [ ] Export data
- [ ] Backend API integration

---

**Happy Coding! 🚀**
