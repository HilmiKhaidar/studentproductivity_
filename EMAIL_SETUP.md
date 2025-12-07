# 📧 Setup Email OTP dengan EmailJS

Panduan lengkap untuk mengaktifkan fitur kirim OTP via email menggunakan EmailJS (GRATIS).

## 🚀 Langkah Setup (5 Menit)

### 1. Daftar EmailJS (Gratis)

1. Buka: https://www.emailjs.com/
2. Klik **Sign Up** (atau login dengan Google/GitHub)
3. Verifikasi email kamu

### 2. Buat Email Service

1. Di dashboard EmailJS, klik **Email Services**
2. Klik **Add New Service**
3. Pilih provider email kamu:
   - **Gmail** (paling mudah)
   - Outlook
   - Yahoo
   - Custom SMTP
4. Klik **Connect Account** dan login dengan email kamu
5. Klik **Create Service**
6. **Copy Service ID** (contoh: `service_abc123`)

### 3. Buat Email Template

1. Klik **Email Templates**
2. Klik **Create New Template**
3. Isi template dengan format ini:

**Subject:**
```
Kode OTP Verifikasi - Student Hub
```

**Content:**
```html
Halo {{user_name}},

Terima kasih telah mendaftar di Student Productivity Hub!

Kode OTP kamu adalah:

{{otp_code}}

Kode ini berlaku selama 5 menit.

Jangan bagikan kode ini ke siapa pun.

Salam,
Student Hub Team
```

4. Klik **Save**
5. **Copy Template ID** (contoh: `template_xyz789`)

### 4. Dapatkan Public Key

1. Klik **Account** di menu
2. Klik **General** tab
3. Lihat bagian **Public Key**
4. **Copy Public Key** (contoh: `abcdefghijk123456`)

### 5. Update Konfigurasi di Project

Buka file `src/utils/emailService.ts` dan ganti:

```typescript
const EMAILJS_SERVICE_ID = 'service_abc123'; // Ganti dengan Service ID kamu
const EMAILJS_TEMPLATE_ID = 'template_xyz789'; // Ganti dengan Template ID kamu
const EMAILJS_PUBLIC_KEY = 'abcdefghijk123456'; // Ganti dengan Public Key kamu
```

### 6. Test!

1. Jalankan aplikasi: `npm run dev`
2. Klik **Daftar**
3. Isi form registrasi
4. Klik **Daftar**
5. Cek email kamu untuk OTP!

---

## 📝 Template Variables

Pastikan template email kamu menggunakan variables ini:

- `{{to_email}}` - Email penerima (otomatis)
- `{{user_name}}` - Nama user
- `{{otp_code}}` - Kode OTP 6 digit

---

## 🎯 Contoh Template Email yang Bagus

### Template 1: Simple

```
Hi {{user_name}},

Your OTP code is: {{otp_code}}

Valid for 5 minutes.

- Student Hub
```

### Template 2: Professional

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .otp-box { 
      background: #f5f5f5; 
      padding: 20px; 
      text-align: center; 
      font-size: 32px; 
      font-weight: bold;
      letter-spacing: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🎓 Student Productivity Hub</h2>
    <p>Halo <strong>{{user_name}}</strong>,</p>
    <p>Terima kasih telah mendaftar! Gunakan kode OTP di bawah untuk verifikasi akun:</p>
    
    <div class="otp-box">
      {{otp_code}}
    </div>
    
    <p><small>Kode berlaku selama 5 menit. Jangan bagikan ke siapa pun.</small></p>
    
    <hr>
    <p><small>Email ini dikirim otomatis. Jangan balas email ini.</small></p>
  </div>
</body>
</html>
```

---

## 🔒 Keamanan

- ✅ OTP berlaku 5 menit
- ✅ OTP hanya bisa dipakai 1 kali
- ✅ Public Key aman digunakan di frontend
- ✅ EmailJS gratis untuk 200 email/bulan
- ⚠️ Jangan commit Private Key ke Git!

---

## 🐛 Troubleshooting

### Email tidak terkirim?

1. **Cek spam folder** - Email OTP mungkin masuk spam
2. **Verifikasi email service** - Pastikan email service sudah connected
3. **Cek quota** - EmailJS gratis: 200 email/bulan
4. **Cek console** - Lihat error di browser console (F12)

### OTP tidak valid?

1. **Cek waktu** - OTP berlaku 5 menit
2. **Cek typo** - Pastikan input 6 digit benar
3. **Cek localStorage** - Buka DevTools > Application > Local Storage

### Masih error?

- Cek console browser (F12) untuk error detail
- Pastikan semua ID dan Key sudah benar
- Restart dev server: `npm run dev`

---

## 💡 Tips

1. **Gmail**: Paling mudah dan reliable
2. **Template**: Buat template yang jelas dan professional
3. **Testing**: Test dengan email kamu sendiri dulu
4. **Backup**: Simpan Service ID, Template ID, dan Public Key di tempat aman

---

## 🎉 Selesai!

Sekarang aplikasi kamu bisa kirim OTP via email secara otomatis!

Jika EmailJS belum dikonfigurasi, OTP akan tetap muncul di console browser untuk development.

---

## 📚 Resources

- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Dashboard: https://dashboard.emailjs.com/
- Support: https://www.emailjs.com/docs/faq/

---

**Happy Coding! 🚀**
