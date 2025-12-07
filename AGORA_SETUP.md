# Setup Agora Video Call

Untuk mengaktifkan fitur video call yang benar-benar berfungsi, ikuti langkah berikut:

## 1. Daftar Agora Account (GRATIS)

1. Buka https://console.agora.io/
2. Sign up dengan email kamu
3. Verifikasi email

## 2. Buat Project Baru

1. Di Agora Console, klik "Create Project"
2. Masukkan nama project: "Student Productivity Hub"
3. Pilih "Secured mode: APP ID + Token" (recommended untuk production)
4. Atau pilih "Testing mode: APP ID" (untuk development cepat)
5. Klik "Submit"

## 3. Dapatkan App ID

1. Setelah project dibuat, kamu akan lihat **App ID**
2. Copy App ID tersebut

## 4. Update Kode

Buka file `src/services/videoCallService.ts` dan ganti:

```typescript
const AGORA_APP_ID = 'YOUR_AGORA_APP_ID';
```

Dengan App ID kamu:

```typescript
const AGORA_APP_ID = 'abc123def456...'; // Your actual App ID
```

## 5. Testing

1. Buka aplikasi di 2 browser berbeda (atau 2 device)
2. Login dengan 2 user berbeda
3. User 1 create study session
4. User 1 invite User 2
5. User 2 join session
6. Kamera dan microphone akan otomatis aktif!

## 6. Troubleshooting

### Kamera/Mic tidak muncul?
- Pastikan browser meminta permission untuk camera & microphone
- Check browser console untuk error messages
- Pastikan App ID sudah benar

### Video tidak muncul?
- Pastikan kedua user sudah join session
- Check network connection
- Pastikan tidak ada firewall blocking

## 7. Free Tier Limits

Agora free tier memberikan:
- **10,000 menit gratis per bulan**
- Unlimited participants
- HD video quality

Cukup untuk development dan testing!

## 8. Production (Optional)

Untuk production, sebaiknya:
1. Generate token di backend (bukan hardcode App ID)
2. Implement token refresh
3. Add error handling yang lebih robust

## Dokumentasi Lengkap

https://docs.agora.io/en/video-calling/get-started/get-started-sdk

---

**Note**: Tanpa setup Agora, video call hanya akan menampilkan UI mockup (avatar saja).
Setelah setup Agora, video & audio akan benar-benar berfungsi!
