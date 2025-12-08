# 🔥 Firebase Setup Guide

## ⚠️ PENTING: Setup Firebase Rules

Untuk fitur messaging berfungsi dengan baik, Anda **HARUS** mengkonfigurasi Firebase Security Rules.

---

## 📋 Langkah-Langkah Setup

### 1. Buka Firebase Console
1. Go to https://console.firebase.google.com/
2. Pilih project: **student-productivity-hub-a2329**
3. Login dengan akun yang memiliki akses

### 2. Setup Firestore Rules

1. Di sidebar kiri, klik **Firestore Database**
2. Klik tab **Rules**
3. Copy semua isi dari file `firestore.rules` di project ini
4. Paste ke editor Firebase
5. Klik **Publish**

### 3. Setup Storage Rules

1. Di sidebar kiri, klik **Storage**
2. Klik tab **Rules**
3. Copy semua isi dari file `storage.rules` di project ini
4. Paste ke editor Firebase
5. Klik **Publish**

---

## 🗂️ Struktur Database

### Firestore Collections

#### 1. `userStatus`
```
userStatus/
  └── {userId}/
      ├── id: string
      ├── name: string
      ├── photoURL: string
      ├── status: "online" | "offline"
      └── lastSeen: timestamp
```

#### 2. `chats`
```
chats/
  └── {chatId}/  (format: userId1_userId2, sorted)
      ├── participants: [userId1, userId2]
      ├── lastMessage: string
      ├── lastMessageTime: timestamp
      ├── lastSenderId: string
      └── messages/  (subcollection)
          └── {messageId}/
              ├── senderId: string
              ├── receiverId: string
              ├── content: string
              ├── type: "text" | "image" | "video" | "audio" | "sticker"
              ├── mediaUrl?: string
              ├── timestamp: timestamp
              └── read: boolean
```

#### 3. `notifications`
```
notifications/
  └── {notifId}/
      ├── userId: string (recipient)
      ├── type: "message" | "media" | "call" | "wallpaper" | "sticker"
      ├── from: string (sender userId)
      ├── fromName: string
      ├── content: string
      ├── timestamp: timestamp
      └── read: boolean
```

#### 4. `calls`
```
calls/
  └── {callId}/
      ├── callerId: string
      ├── callerName: string
      ├── receiverId: string
      ├── receiverName: string
      ├── type: "voice" | "video"
      ├── status: "ringing" | "connected" | "rejected" | "ended"
      └── timestamp: timestamp
```

#### 5. `callHistory`
```
callHistory/
  └── {historyId}/
      ├── participants: [userId1, userId2]
      ├── callerId: string
      ├── callerName: string
      ├── receiverId: string
      ├── receiverName: string
      ├── type: "voice" | "video"
      ├── status: "outgoing" | "incoming" | "missed"
      ├── duration: number (seconds)
      └── timestamp: timestamp
```

---

## 🔒 Security Rules Explained

### Firestore Rules

```javascript
// User Status - anyone can read, only owner can write
match /userStatus/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```
- Semua user yang login bisa lihat status online/offline user lain
- Hanya owner yang bisa update status sendiri

```javascript
// Chats - only participants can access
match /chats/{chatId} {
  allow read, write: if request.auth != null && 
    request.auth.uid in resource.data.participants;
  
  match /messages/{messageId} {
    allow read, write: if request.auth != null;
  }
}
```
- Hanya participant yang bisa akses chat
- Messages bisa diakses oleh authenticated users (akan difilter di client)

```javascript
// Notifications - only recipient can read
match /notifications/{notifId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow write: if request.auth != null;
}
```
- Hanya penerima yang bisa baca notifikasi
- Semua authenticated user bisa kirim notifikasi

### Storage Rules

```javascript
match /messages/{userId}/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```
- Semua user bisa download media
- Hanya owner folder yang bisa upload

---

## 🧪 Testing

### Test 1: Send Message
1. Login sebagai User A
2. Pilih User B dari list
3. Kirim pesan "Hello"
4. **Expected**: User B menerima notifikasi toast

### Test 2: Send Media
1. Login sebagai User A
2. Klik paperclip icon
3. Upload gambar
4. **Expected**: 
   - Upload berhasil
   - User B menerima notifikasi "📷 Sent a photo"

### Test 3: Voice Call
1. Login sebagai User A
2. Klik phone icon
3. **Expected**:
   - User B menerima incoming call popup
   - Call history tercatat

### Test 4: Change Wallpaper
1. Login sebagai User A
2. Klik wallpaper icon
3. Pilih wallpaper
4. **Expected**:
   - Wallpaper berubah
   - User B menerima notifikasi "🖼️ Changed chat wallpaper"

---

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"

**Penyebab**: Firebase Rules belum di-setup

**Solusi**:
1. Buka Firebase Console
2. Setup Firestore Rules (lihat langkah di atas)
3. Setup Storage Rules
4. Publish rules
5. Refresh aplikasi

### Error: "Failed to send message"

**Penyebab**: 
- Tidak ada koneksi internet
- Firebase Rules salah
- User tidak authenticated

**Solusi**:
1. Check koneksi internet
2. Verify Firebase Rules
3. Logout & login ulang

### Pesan tidak sampai ke user lain

**Penyebab**:
- User B tidak online
- Firestore Rules block access
- Chat ID tidak konsisten

**Solusi**:
1. Pastikan kedua user online
2. Check Firebase Console → Firestore → lihat data `chats`
3. Verify chat ID format: `userId1_userId2` (sorted)

### Incoming call tidak muncul

**Penyebab**:
- User B tidak online
- Notification listener belum jalan
- Firestore Rules block

**Solusi**:
1. Pastikan User B buka halaman Messages
2. Check browser console untuk errors
3. Verify Firestore Rules untuk collection `calls`

---

## 📊 Monitoring

### Check Data di Firebase Console

1. **Firestore Database**
   - Lihat collections: `chats`, `notifications`, `calls`, `callHistory`
   - Verify data structure sesuai dokumentasi

2. **Storage**
   - Lihat folder `messages/{userId}/`
   - Check uploaded files

3. **Authentication**
   - Verify users logged in
   - Check user IDs

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Firebase Rules di-publish
- [ ] Test semua fitur messaging
- [ ] Test incoming call notifications
- [ ] Test media upload
- [ ] Test wallpaper change
- [ ] Verify call history
- [ ] Check notification system
- [ ] Test dengan 2+ users
- [ ] Monitor Firebase usage
- [ ] Setup Firebase billing alerts

---

## 💰 Firebase Pricing

### Free Tier (Spark Plan)

**Firestore**:
- Reads: 50,000/day
- Writes: 20,000/day
- Deletes: 20,000/day
- Storage: 1 GB

**Storage**:
- Storage: 5 GB
- Downloads: 1 GB/day
- Uploads: Unlimited

**Estimated Usage** (50 active users):
- Messages: ~5,000 writes/day ✅
- Status updates: ~2,000 writes/day ✅
- Notifications: ~3,000 writes/day ✅
- Media storage: ~500 MB ✅
- **Total: Within free tier!** 🎉

### Upgrade to Blaze (Pay-as-you-go)

Jika usage melebihi free tier:
- Firestore: $0.06 per 100K reads
- Storage: $0.026 per GB
- Bandwidth: $0.12 per GB

**Estimated cost** (100 users):
- ~$5-10/month

---

## 📞 Support

Jika masih ada masalah:
1. Check Firebase Console → Usage tab
2. Check browser console untuk errors
3. Verify all Firebase Rules published
4. Test dengan incognito mode
5. Clear browser cache & localStorage

---

## ✅ Summary

Setup Firebase Rules adalah **WAJIB** untuk fitur messaging berfungsi. Tanpa rules yang benar:
- ❌ Pesan tidak terkirim
- ❌ Notifikasi tidak muncul
- ❌ Call tidak berfungsi
- ❌ Media tidak bisa diupload

Setelah setup rules:
- ✅ Real-time messaging
- ✅ Incoming call notifications
- ✅ Media sharing
- ✅ Call history
- ✅ Wallpaper sync
- ✅ Toast notifications

**Next step**: Copy `firestore.rules` dan `storage.rules` ke Firebase Console!
