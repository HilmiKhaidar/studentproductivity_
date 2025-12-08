import React, { useState } from 'react';
import { User as UserIcon, Mail, Calendar, LogOut, Camera, Edit2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, logout } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [name, setName] = useState(user?.name || '');

  const handleLogout = async () => {
    if (window.confirm('Yakin ingin keluar?')) {
      await logout();
      toast.success('Berhasil logout!');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for simple storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'users', user.id), {
        name,
        photoURL,
        bio,
      });
      
      // Update local store
      useStore.setState({
        user: { ...user, name, photoURL, bio }
      });
      
      toast.success('Profil berhasil diupdate!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal update profil');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight">Profil Saya</h2>
          <p className="notion-text-secondary text-sm mt-2">Informasi akun kamu</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-medium transition-all flex items-center gap-2 border border-red-500/30"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="notion-card p-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 notion-text" />
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-800 notion-text p-2 rounded-full cursor-pointer transition-all shadow-lg">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl font-bold notion-heading mb-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <h3 className="text-2xl font-bold notion-heading mb-1">{user.name}</h3>
            )}
            {isEditing ? (
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio singkat tentang kamu..."
                className="notion-text bg-white/10 border border-white/20 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="notion-text">{bio || 'Student'}</p>
            )}
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className="bg-gray-800 hover:bg-gray-800 notion-text px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save size={18} />
                Simpan
              </>
            ) : (
              <>
                <Edit2 size={18} />
                Edit
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 notion-card">
            <Mail className="notion-text" size={20} />
            <div>
              <p className="notion-text-secondary text-sm">Email</p>
              <p className="notion-text font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 notion-card">
            <Calendar className="notion-text" size={20} />
            <div>
              <p className="notion-text-secondary text-sm">Bergabung Sejak</p>
              <p className="notion-text font-medium">
                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 notion-card">
            <UserIcon className="notion-text" size={20} />
            <div>
              <p className="notion-text-secondary text-sm">User ID</p>
              <p className="notion-text font-medium font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-gray-300/30">
        <h3 className="notion-text font-bold mb-4 flex items-center gap-2">
          <span>📊</span> Statistik Akun
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-[40px] font-bold notion-heading leading-tight">0</p>
            <p className="notion-text text-sm mt-1">Tugas Selesai</p>
          </div>
          <div className="text-center">
            <p className="text-[40px] font-bold notion-heading leading-tight">0</p>
            <p className="notion-text text-sm mt-1">Sesi Pomodoro</p>
          </div>
          <div className="text-center">
            <p className="text-[40px] font-bold notion-heading leading-tight">0</p>
            <p className="notion-text text-sm mt-1">Hari Streak</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
        <h3 className="notion-text font-bold mb-2">💡 Tips</h3>
        <ul className="notion-text/80 text-sm space-y-1">
          <li>• Data kamu tersimpan aman di Firebase Cloud</li>
          <li>• Bisa akses dari device manapun dengan login</li>
          <li>• Jangan share password ke siapa pun</li>
          <li>• Logout jika menggunakan komputer umum</li>
        </ul>
      </div>
    </div>
  );
};
