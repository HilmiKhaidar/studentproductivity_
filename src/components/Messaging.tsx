import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Smile,
  Phone,
  Video,
  Paperclip,
  X,
  Search,
  ArrowLeft,
  Mic,
  Sticker as StickerIcon,
  Wallpaper,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  limit,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  photoURL?: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'sticker';
  timestamp: any;
  read: boolean;
  mediaUrl?: string;
}

export const Messaging: React.FC = () => {
  const { user } = useStore();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  // const [isRecording, setIsRecording] = useState(false); // Disabled - requires Storage
  const [wallpaper, setWallpaper] = useState<string>('');
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const audioChunksRef = useRef<Blob[]>([]);

  // Detect online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🟢 Online Mode - All features available');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('🔴 Offline Mode - Messaging disabled');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for incoming calls
  useEffect(() => {
    if (!user || !isOnline) return;

    const q = query(
      collection(db, 'calls'),
      where('receiverId', '==', user.id),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        const callData = docSnap.data();
        const call = { ...callData, id: docSnap.id };
        setIncomingCall(call);
        toast.success(`📞 Incoming ${callData.type} call from ${callData.callerName}`, {
          duration: 10000,
        });
      });
    });

    return () => unsubscribe();
  }, [user, isOnline]);

  // Listen for notifications
  useEffect(() => {
    if (!user || !isOnline) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        const notif = docSnap.data();
        if (notif.type === 'message') {
          toast(`💬 ${notif.fromName}: ${notif.content}`, {
            duration: 5000,
            icon: '💬',
          });
        } else if (notif.type === 'media') {
          toast(`${notif.fromName}: ${notif.content}`, {
            duration: 5000,
          });
        } else if (notif.type === 'wallpaper') {
          toast(`🖼️ ${notif.fromName} changed wallpaper`, {
            duration: 3000,
          });
        }
        // Mark as read
        updateDoc(doc(db, 'notifications', docSnap.id), { read: true }).catch(console.error);
      });
    });

    return () => unsubscribe();
  }, [user, isOnline]);

  // Load call history
  useEffect(() => {
    if (!user || !isOnline) return;

    const q = query(
      collection(db, 'callHistory'),
      where('participants', 'array-contains', user.id),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history: any[] = [];
      snapshot.docs.forEach((doc) => {
        history.push({ ...doc.data(), id: doc.id });
      });
      setCallHistory(history);
    });

    return () => unsubscribe();
  }, [user, isOnline]);

  // Update user online status
  useEffect(() => {
    if (!user || !isOnline) return;

    const updateStatus = async () => {
      try {
        await setDoc(doc(db, 'userStatus', user.id), {
          id: user.id,
          name: user.name,
          photoURL: user.photoURL || '',
          status: 'online',
          lastSeen: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30s

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      setDoc(doc(db, 'userStatus', user.id), {
        id: user.id,
        name: user.name,
        photoURL: user.photoURL || '',
        status: 'offline',
        lastSeen: new Date().toISOString(),
      }).catch(console.error);
    };
  }, [user, isOnline]);

  // Listen to online users
  useEffect(() => {
    if (!user || !isOnline) return;

    const q = query(collection(db, 'userStatus'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: User[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as User;
        if (data.id !== user.id) {
          // Check if user is still online (within last 1 minute)
          const lastSeen = new Date(data.lastSeen);
          const now = new Date();
          const isActive = now.getTime() - lastSeen.getTime() < 60000;
          users.push({
            ...data,
            status: isActive ? 'online' : 'offline',
          });
        }
      });
      setOnlineUsers(users.sort((a, b) => {
        if (a.status === 'online' && b.status === 'offline') return -1;
        if (a.status === 'offline' && b.status === 'online') return 1;
        return a.name.localeCompare(b.name);
      }));
    });

    return () => unsubscribe();
  }, [user, isOnline]);

  // Listen to messages with selected user
  useEffect(() => {
    if (!user || !selectedUser || !isOnline) return;

    // Create chat ID (sorted to ensure consistency)
    const chatId = [user.id, selectedUser.id].sort().join('_');
    
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as Message;
        msgs.push({ ...data, id: doc.id });
      });
      setMessages(msgs);
      
      // Mark messages as read
      msgs.forEach((msg) => {
        if (msg.receiverId === user.id && !msg.read) {
          updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), { read: true }).catch(console.error);
        }
      });
    });

    return () => unsubscribe();
  }, [user, selectedUser, isOnline]);

  // Load wallpaper
  useEffect(() => {
    if (!user || !selectedUser) return;
    const chatId = [user.id, selectedUser.id].sort().join('_');
    const savedWallpaper = localStorage.getItem(`wallpaper_${chatId}`);
    if (savedWallpaper) {
      setWallpaper(savedWallpaper);
    }
  }, [user, selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send text message
  const sendMessage = async () => {
    if (!messageInput.trim() || !user || !selectedUser || !isOnline) return;

    try {
      const chatId = [user.id, selectedUser.id].sort().join('_');
      
      // Add message to subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.id,
        receiverId: selectedUser.id,
        content: messageInput,
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update chat metadata
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.id, selectedUser.id],
        lastMessage: messageInput,
        lastMessageTime: serverTimestamp(),
        lastSenderId: user.id,
      }, { merge: true });

      // Send notification to receiver
      await addDoc(collection(db, 'notifications'), {
        userId: selectedUser.id,
        type: 'message',
        from: user.id,
        fromName: user.name,
        content: messageInput,
        timestamp: serverTimestamp(),
        read: false,
      });

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Upload and send media (DISABLED - requires Firebase Storage upgrade)
  const handleFileUpload = async (_file: File, _type: 'image' | 'video') => {
    if (!user || !selectedUser || !isOnline) return;

    toast.error('Media upload requires Firebase Storage upgrade to Blaze Plan. Feature disabled for now.');
    return;

    // Uncomment below if you upgrade to Blaze Plan
    /*
    try {
      toast.loading('Uploading...');
      const storageRef = ref(storage, `messages/${user.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const chatId = [user.id, selectedUser.id].sort().join('_');

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.id,
        receiverId: selectedUser.id,
        content: '',
        type,
        mediaUrl: url,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update chat metadata
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.id, selectedUser.id],
        lastMessage: type === 'image' ? '📷 Photo' : '🎥 Video',
        lastMessageTime: serverTimestamp(),
        lastSenderId: user.id,
      }, { merge: true });

      // Send notification
      await addDoc(collection(db, 'notifications'), {
        userId: selectedUser.id,
        type: 'media',
        from: user.id,
        fromName: user.name,
        content: type === 'image' ? '📷 Sent a photo' : '🎥 Sent a video',
        timestamp: serverTimestamp(),
        read: false,
      });

      toast.dismiss();
      toast.success('Sent!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.dismiss();
      toast.error('Failed to upload');
    }
    */
  };

  // Voice recording disabled - requires Firebase Storage upgrade
  // Uncomment below if you upgrade to Blaze Plan
  /*
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleFileUpload(audioBlob as File, 'image');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Microphone access denied');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  */

  // Send sticker
  const sendSticker = async (stickerUrl: string) => {
    if (!user || !selectedUser || !isOnline) return;

    try {
      const chatId = [user.id, selectedUser.id].sort().join('_');

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.id,
        receiverId: selectedUser.id,
        content: '',
        type: 'sticker',
        mediaUrl: stickerUrl,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update chat metadata
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.id, selectedUser.id],
        lastMessage: '🎨 Sticker',
        lastMessageTime: serverTimestamp(),
        lastSenderId: user.id,
      }, { merge: true });

      // Send notification
      await addDoc(collection(db, 'notifications'), {
        userId: selectedUser.id,
        type: 'sticker',
        from: user.id,
        fromName: user.name,
        content: `Sent a sticker ${stickerUrl}`,
        timestamp: serverTimestamp(),
        read: false,
      });

      setShowStickerPicker(false);
    } catch (error) {
      console.error('Error sending sticker:', error);
      toast.error('Failed to send sticker');
    }
  };

  // Change wallpaper
  const changeWallpaper = async (wallpaperUrl: string) => {
    if (!user || !selectedUser) return;
    const chatId = [user.id, selectedUser.id].sort().join('_');
    localStorage.setItem(`wallpaper_${chatId}`, wallpaperUrl);
    setWallpaper(wallpaperUrl);
    setShowWallpaperPicker(false);
    toast.success('Wallpaper changed!');

    // Notify other user
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: selectedUser.id,
        type: 'wallpaper',
        from: user.id,
        fromName: user.name,
        content: 'Changed chat wallpaper',
        timestamp: serverTimestamp(),
        read: false,
      });
    } catch (error) {
      console.error('Error sending wallpaper notification:', error);
    }
  };

  // Start call
  const startCall = async (type: 'voice' | 'video') => {
    if (!user || !selectedUser || !isOnline) return;

    try {
      const callDoc = await addDoc(collection(db, 'calls'), {
        callerId: user.id,
        callerName: user.name,
        receiverId: selectedUser.id,
        receiverName: selectedUser.name,
        type,
        status: 'ringing',
        timestamp: serverTimestamp(),
      });

      // Add to call history
      await addDoc(collection(db, 'callHistory'), {
        participants: [user.id, selectedUser.id],
        callerId: user.id,
        callerName: user.name,
        receiverId: selectedUser.id,
        receiverName: selectedUser.name,
        type,
        status: 'outgoing',
        duration: 0,
        timestamp: serverTimestamp(),
      });

      // Send notification
      await addDoc(collection(db, 'notifications'), {
        userId: selectedUser.id,
        type: 'call',
        from: user.id,
        fromName: user.name,
        content: `Incoming ${type} call`,
        callId: callDoc.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      if (type === 'voice') {
        setIsVoiceCall(true);
      } else {
        setIsVideoCall(true);
      }

      toast.success(`Calling ${selectedUser.name}...`);
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  };

  // Answer call
  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      await updateDoc(doc(db, 'calls', incomingCall.id), {
        status: 'connected',
      });

      if (incomingCall.type === 'voice') {
        setIsVoiceCall(true);
      } else {
        setIsVideoCall(true);
      }

      setIncomingCall(null);
      toast.success('Call connected');
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }
  };

  // Reject call
  const rejectCall = async () => {
    if (!incomingCall) return;

    try {
      await updateDoc(doc(db, 'calls', incomingCall.id), {
        status: 'rejected',
      });

      setIncomingCall(null);
      toast('Call rejected');
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  // End call
  const endCall = async () => {
    setIsVoiceCall(false);
    setIsVideoCall(false);
    toast('Call ended');
  };

  // Predefined wallpapers
  const wallpapers = [
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800',
    'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800',
    '',
  ];

  // Predefined stickers (emoji-based)
  const stickers = [
    '😀', '😂', '🥰', '😎', '🤔', '😴', '🎉', '🎊', '🎈', '🎁',
    '❤️', '💯', '🔥', '⭐', '✨', '🌟', '💪', '👍', '👏', '🙌',
    '📚', '📖', '✏️', '📝', '🎓', '🏆', '🥇', '🎯', '💡', '🚀',
  ];

  // Emojis
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  ];

  const filteredUsers = onlineUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header with online status */}
      <div className="px-4 py-3 border-b border-[#E9E9E7] dark:border-[#373737]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold notion-heading">
              💬 Messages
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="notion-text-secondary text-xs sm:text-sm">
                {isOnline ? 'Online Mode' : 'Offline Mode'}
              </p>
            </div>
          </div>
          <div className="notion-card px-3 py-2">
            <span className="notion-text text-sm font-medium">
              {onlineUsers.filter(u => u.status === 'online').length} online
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Users List */}
        <div className={`${selectedUser ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-[#E9E9E7] dark:border-[#373737] flex flex-col`}>
          {/* Search */}
          <div className="p-3 border-b border-[#E9E9E7] dark:border-[#373737]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 notion-input text-sm"
                disabled={!isOnline}
              />
            </div>
          </div>

          {/* Online Users */}
          <div className="flex-1 overflow-y-auto">
            {!isOnline ? (
              <div className="p-4 text-center">
                <p className="notion-text-secondary text-sm">
                  🔴 Offline - Connect to internet to chat
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center">
                <p className="notion-text-secondary text-sm">No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                    selectedUser?.id === u.id ? 'bg-black/5 dark:bg-white/5' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="notion-text font-semibold">{u.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      u.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="notion-text font-medium text-sm">{u.name}</p>
                    <p className="notion-text-secondary text-xs">
                      {u.status === 'online' ? 'Online' : `Last seen ${new Date(u.lastSeen).toLocaleTimeString()}`}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b border-[#E9E9E7] dark:border-[#373737] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden notion-button p-2"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="notion-text font-semibold">{selectedUser.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                    selectedUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <p className="notion-text font-medium text-sm">{selectedUser.name}</p>
                  <p className="notion-text-secondary text-xs">
                    {selectedUser.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startCall('voice')}
                  className="notion-button p-2"
                  disabled={!isOnline}
                  title="Voice Call"
                >
                  <Phone size={20} />
                </button>
                <button
                  onClick={() => startCall('video')}
                  className="notion-button p-2"
                  disabled={!isOnline}
                  title="Video Call"
                >
                  <Video size={20} />
                </button>
                <button
                  onClick={() => setShowWallpaperPicker(!showWallpaperPicker)}
                  className="notion-button p-2"
                  title="Change Wallpaper"
                >
                  <Wallpaper size={20} />
                </button>
                <button
                  onClick={() => setShowCallHistory(!showCallHistory)}
                  className="notion-button p-2"
                  title="Call History"
                >
                  <Phone size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage: wallpaper ? `url(${wallpaper})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="notion-text-secondary text-sm">No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMine ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 notion-text'} rounded-lg p-3 shadow-sm`}>
                        {msg.type === 'text' && (
                          <p className="text-sm break-words">{msg.content}</p>
                        )}
                        {msg.type === 'image' && msg.mediaUrl && (
                          <img src={msg.mediaUrl} alt="Shared" className="rounded max-w-full" />
                        )}
                        {msg.type === 'video' && msg.mediaUrl && (
                          <video src={msg.mediaUrl} controls className="rounded max-w-full" />
                        )}
                        {msg.type === 'sticker' && msg.mediaUrl && (
                          <span className="text-6xl">{msg.mediaUrl}</span>
                        )}
                        <div className={`flex items-center gap-1 mt-1 text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                          <span>{msg.timestamp?.toDate?.()?.toLocaleTimeString() || ''}</span>
                          {isMine && (
                            msg.read ? <CheckCheck size={14} /> : <Check size={14} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Wallpaper Picker */}
            {showWallpaperPicker && (
              <div className="p-3 border-t border-[#E9E9E7] dark:border-[#373737] bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-2">
                  <p className="notion-text text-sm font-medium">Choose Wallpaper</p>
                  <button onClick={() => setShowWallpaperPicker(false)} className="notion-button p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {wallpapers.map((wp, idx) => (
                    <button
                      key={idx}
                      onClick={() => changeWallpaper(wp)}
                      className="aspect-square rounded border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors overflow-hidden"
                      style={{
                        backgroundImage: wp ? `url(${wp})` : 'none',
                        backgroundColor: wp ? 'transparent' : '#f3f4f6',
                        backgroundSize: 'cover',
                      }}
                    >
                      {!wp && <span className="text-xs">None</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sticker Picker */}
            {showStickerPicker && (
              <div className="p-3 border-t border-[#E9E9E7] dark:border-[#373737] bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-2">
                  <p className="notion-text text-sm font-medium">Choose Sticker</p>
                  <button onClick={() => setShowStickerPicker(false)} className="notion-button p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {stickers.map((sticker, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendSticker(sticker)}
                      className="aspect-square rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-2xl"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="p-3 border-t border-[#E9E9E7] dark:border-[#373737] bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-2">
                  <p className="notion-text text-sm font-medium">Choose Emoji</p>
                  <button onClick={() => setShowEmojiPicker(false)} className="notion-button p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMessageInput(messageInput + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="aspect-square rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-[#E9E9E7] dark:border-[#373737] bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="notion-button p-2"
                  disabled={!isOnline}
                  title="Add Emoji"
                >
                  <Smile size={20} />
                </button>
                <button
                  onClick={() => setShowStickerPicker(!showStickerPicker)}
                  className="notion-button p-2"
                  disabled={!isOnline}
                  title="Send Sticker"
                >
                  <StickerIcon size={20} />
                </button>
                <button
                  onClick={() => toast.error('Media upload disabled. Upgrade to Blaze Plan to enable.')}
                  className="notion-button p-2 opacity-50 cursor-not-allowed"
                  disabled={true}
                  title="Media Upload (Disabled - Requires Storage)"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="text"
                  placeholder={isOnline ? "Type a message..." : "Offline - Connect to send messages"}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 notion-input"
                  disabled={!isOnline}
                />
                <button
                  onClick={() => toast.error('Voice recording disabled. Upgrade to Blaze Plan to enable.')}
                  className="notion-button p-2 opacity-50 cursor-not-allowed"
                  disabled={true}
                  title="Voice Recording (Disabled - Requires Storage)"
                >
                  <Mic size={20} />
                </button>
                <button
                  onClick={sendMessage}
                  className="notion-button-primary p-2"
                  disabled={!messageInput.trim() || !isOnline}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <p className="notion-text text-lg font-medium">Select a user to start chatting</p>
              <p className="notion-text-secondary text-sm mt-2">
                {isOnline ? 'Choose from the list on the left' : 'Connect to internet first'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="notion-card p-6 max-w-sm w-full text-center animate-pulse">
            {incomingCall.type === 'voice' ? (
              <Phone size={64} className="mx-auto text-green-500 mb-4 animate-bounce" />
            ) : (
              <Video size={64} className="mx-auto text-blue-500 mb-4 animate-bounce" />
            )}
            <p className="notion-text text-xl font-bold mb-2">{incomingCall.callerName}</p>
            <p className="notion-text-secondary text-sm mb-6">
              Incoming {incomingCall.type} call...
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={rejectCall}
                className="notion-button-primary bg-red-500 hover:bg-red-600 px-6 py-3 rounded-full"
              >
                ✕ Reject
              </button>
              <button
                onClick={answerCall}
                className="notion-button-primary bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full"
              >
                ✓ Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Call Modal */}
      {isVoiceCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="notion-card p-6 max-w-sm w-full text-center">
            <Phone size={48} className="mx-auto text-green-500 mb-4" />
            <p className="notion-text text-lg font-medium mb-2">Voice Call</p>
            <p className="notion-text-secondary text-sm mb-4">
              {selectedUser?.name}
            </p>
            <button
              onClick={endCall}
              className="notion-button-primary bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {isVideoCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="notion-card p-6 max-w-sm w-full text-center">
            <Video size={48} className="mx-auto text-blue-500 mb-4" />
            <p className="notion-text text-lg font-medium mb-2">Video Call</p>
            <p className="notion-text-secondary text-sm mb-4">
              {selectedUser?.name}
            </p>
            <button
              onClick={endCall}
              className="notion-button-primary bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Call History Modal */}
      {showCallHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="notion-card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="notion-heading text-lg font-bold">Call History</h3>
              <button onClick={() => setShowCallHistory(false)} className="notion-button p-2">
                <X size={20} />
              </button>
            </div>
            {callHistory.length === 0 ? (
              <p className="notion-text-secondary text-center py-8">No call history</p>
            ) : (
              <div className="space-y-2">
                {callHistory.map((call) => {
                  const isOutgoing = call.callerId === user?.id;
                  const otherUser = isOutgoing ? call.receiverName : call.callerName;
                  return (
                    <div key={call.id} className="notion-card p-3 flex items-center gap-3">
                      {call.type === 'voice' ? (
                        <Phone size={20} className={isOutgoing ? 'text-green-500' : 'text-blue-500'} />
                      ) : (
                        <Video size={20} className={isOutgoing ? 'text-green-500' : 'text-blue-500'} />
                      )}
                      <div className="flex-1">
                        <p className="notion-text text-sm font-medium">{otherUser}</p>
                        <p className="notion-text-secondary text-xs">
                          {isOutgoing ? '↗ Outgoing' : '↙ Incoming'} • {call.timestamp?.toDate?.()?.toLocaleString() || ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const targetUser = onlineUsers.find(u => 
                            u.name === otherUser
                          );
                          if (targetUser) {
                            setSelectedUser(targetUser);
                            setShowCallHistory(false);
                          }
                        }}
                        className="notion-button p-2"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
