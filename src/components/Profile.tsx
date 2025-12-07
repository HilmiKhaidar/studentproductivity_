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
          <h2 className="text-3xl font-bold text-white">Profil Saya</h2>
          <p className="text-white/70 mt-1">Informasi akun kamu</p>
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
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer transition-all shadow-lg">
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
                className="text-2xl font-bold text-white mb-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
            )}
            {isEditing ? (
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio singkat tentang kamu..."
                className="text-purple-200 bg-white/10 border border-white/20 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-purple-200">{bio || 'Student'}</p>
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
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
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <Mail className="text-purple-400" size={20} />
            <div>
              <p className="text-white/60 text-sm">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <Calendar className="text-purple-400" size={20} />
            <div>
              <p className="text-white/60 text-sm">Bergabung Sejak</p>
              <p className="text-white font-medium">
                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <UserIcon className="text-purple-400" size={20} />
            <div>
              <p className="text-white/60 text-sm">User ID</p>
              <p className="text-white font-medium font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>📊</span> Statistik Akun
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-purple-200 text-sm mt-1">Tugas Selesai</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-purple-200 text-sm mt-1">Sesi Pomodoro</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-purple-200 text-sm mt-1">Hari Streak</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-white font-bold mb-2">💡 Tips</h3>
        <ul className="text-white/80 text-sm space-y-1">
          <li>• Data kamu tersimpan aman di Firebase Cloud</li>
          <li>• Bisa akses dari device manapun dengan login</li>
          <li>• Jangan share password ke siapa pun</li>
          <li>• Logout jika menggunakan komputer umum</li>
        </ul>
      </div>
    </div>
  );
};
