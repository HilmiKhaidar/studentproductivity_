import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, MessageCircle, Trophy, Target, Clock, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  level: number;
  totalTasks: number;
  streak: number;
  photoURL?: string;
  bio?: string;
}

export const Friends: React.FC = () => {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [friends, setFriends] = useState<UserSearchResult[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
      
      // Auto-refresh friend requests every 5 seconds
      const interval = setInterval(() => {
        loadFriendRequests();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const friendsRef = collection(db, 'friends');
      
      // Query where user is userId
      const q1 = query(
        friendsRef,
        where('userId', '==', user.id),
        where('status', '==', 'accepted')
      );
      
      // Query where user is friendId
      const q2 = query(
        friendsRef,
        where('friendId', '==', user.id),
        where('status', '==', 'accepted')
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
      
      const friendsList: UserSearchResult[] = [];
      
      // Process first query results
      for (const docSnap of snapshot1.docs) {
        const data = docSnap.data();
        const friendId = data.friendId;
        
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          friendsList.push({
            id: friendId,
            email: userData.email,
            name: userData.name,
            level: userData.level || 1,
            totalTasks: userData.totalTasks || 0,
            streak: userData.streak || 0,
            photoURL: userData.photoURL,
            bio: userData.bio,
          });
        }
      }
      
      // Process second query results
      for (const docSnap of snapshot2.docs) {
        const data = docSnap.data();
        const friendId = data.userId;
        
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          friendsList.push({
            id: friendId,
            email: userData.email,
            name: userData.name,
            level: userData.level || 1,
            totalTasks: userData.totalTasks || 0,
            streak: userData.streak || 0,
            photoURL: userData.photoURL,
            bio: userData.bio,
          });
        }
      }
      
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    try {
      const requestsRef = collection(db, 'friends');
      const q = query(
        requestsRef,
        where('friendId', '==', user.id),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      
      const requests = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (userDoc.exists()) {
          requests.push({
            id: docSnap.id,
            ...data,
            senderName: userDoc.data().name,
            senderEmail: userDoc.data().email,
          });
        }
      }
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Masukkan email atau nama untuk mencari');
      return;
    }

    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', searchQuery.toLowerCase()));
      const snapshot = await getDocs(q);
      
      const results: UserSearchResult[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== user?.id) {
          results.push({
            id: doc.id,
            email: data.email,
            name: data.name,
            level: data.level || 1,
            totalTasks: data.totalTasks || 0,
            streak: data.streak || 0,
            photoURL: data.photoURL,
            bio: data.bio,
          });
        }
      });
      
      setSearchResults(results);
      if (results.length === 0) {
        toast.error('User tidak ditemukan');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Gagal mencari user');
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    
    try {
      // Check if already friends or request exists
      const friendsRef = collection(db, 'friends');
      
      // Check if already sent request
      const q1 = query(
        friendsRef,
        where('userId', '==', user.id),
        where('friendId', '==', friendId)
      );
      
      // Check if received request
      const q2 = query(
        friendsRef,
        where('userId', '==', friendId),
        where('friendId', '==', user.id)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
      
      if (!snapshot1.empty || !snapshot2.empty) {
        toast.error('Friend request sudah ada atau kalian sudah berteman!');
        return;
      }
      
      // Send new request
      await addDoc(collection(db, 'friends'), {
        userId: user.id,
        friendId: friendId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      
      toast.success('Friend request berhasil dikirim!');
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Gagal mengirim friend request');
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'friends', requestId), {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      });
      toast.success('Friend request diterima!');
      loadFriends();
      loadFriendRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Gagal menerima friend request');
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'friends', requestId), {
        status: 'rejected',
      });
      toast.success('Friend request ditolak');
      loadFriendRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Gagal menolak friend request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users size={32} />
            Friends & Collaboration
          </h2>
          <p className="text-white/70 mt-1">Terhubung dengan teman dan belajar bersama</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'friends'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Teman ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Cari Teman
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Permintaan
          {friendRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {friendRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users size={48} className="text-white/30 mx-auto mb-4" />
              <p className="text-white/60">Belum ada teman. Cari dan tambahkan teman!</p>
            </div>
          )}
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => setSelectedProfile(friend)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {friend.photoURL ? (
                    <img
                      src={friend.photoURL}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white">{friend.name}</h3>
                    <p className="text-white/60 text-sm">{friend.bio || `Level ${friend.level}`}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-white/70 mb-1">
                    <Target size={14} />
                    <span>Tasks</span>
                  </div>
                  <p className="text-white font-bold">{friend.totalTasks}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-white/70 mb-1">
                    <Trophy size={14} />
                    <span>Streak</span>
                  </div>
                  <p className="text-white font-bold">{friend.streak} 🔥</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                <MessageCircle size={16} />
                Lihat Profil
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Mencari...' : 'Cari'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {result.photoURL ? (
                      <img
                        src={result.photoURL}
                        alt={result.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {result.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white">{result.name}</h3>
                      <p className="text-white/60 text-sm">{result.email}</p>
                      <p className="text-white/60 text-sm">{result.bio || `Level ${result.level}`}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(result.id)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                  >
                    <UserPlus size={16} />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {friendRequests.length === 0 && (
            <div className="text-center py-12">
              <UserPlus size={48} className="text-white/30 mx-auto mb-4" />
              <p className="text-white/60">Tidak ada permintaan pertemanan</p>
            </div>
          )}
          {friendRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {request.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{request.senderName}</h3>
                    <p className="text-white/60 text-sm">{request.senderEmail}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Terima
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-xl p-8 max-w-2xl w-full border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {selectedProfile.photoURL ? (
                  <img
                    src={selectedProfile.photoURL}
                    alt={selectedProfile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-purple-500"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                    {selectedProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedProfile.name}</h3>
                  <p className="text-white/70">{selectedProfile.email}</p>
                  {selectedProfile.bio && (
                    <p className="text-white/80 text-sm mt-2 italic">"{selectedProfile.bio}"</p>
                  )}
                  <p className="text-white/60 text-sm mt-1">Level {selectedProfile.level}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-white/70 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Target className="text-blue-400 mx-auto mb-2" size={32} />
                <p className="text-2xl font-bold text-white">{selectedProfile.totalTasks}</p>
                <p className="text-white/70 text-sm">Total Tasks</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Trophy className="text-yellow-400 mx-auto mb-2" size={32} />
                <p className="text-2xl font-bold text-white">{selectedProfile.streak}</p>
                <p className="text-white/70 text-sm">Day Streak</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Clock className="text-green-400 mx-auto mb-2" size={32} />
                <p className="text-2xl font-bold text-white">{selectedProfile.level}</p>
                <p className="text-white/70 text-sm">Level</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedProfile(null)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
