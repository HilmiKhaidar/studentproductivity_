import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, MessageCircle, Phone, PhoneOff, UserPlus, Clock, Send, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { collection, query, where, getDocs, addDoc, doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { videoCallService } from '../services/videoCallService';
import toast from 'react-hot-toast';

export const Multiplayer: React.FC = () => {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'sessions' | 'messages'>('sessions');
  
  // Study Sessions
  const [sessions, setSessions] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inSession, setInSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const localVideoRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => {
    if (isMuted) {
      videoCallService.unmuteAudio();
    } else {
      videoCallService.muteAudio();
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (isVideoOn) {
      videoCallService.muteVideo();
    } else {
      videoCallService.unmuteVideo();
    }
    setIsVideoOn(!isVideoOn);
  };
  
  // Session form
  const [sessionForm, setSessionForm] = useState({
    title: '',
    subject: '',
    type: 'video' as 'video' | 'audio' | 'silent',
    maxParticipants: 5,
  });
  
  // Session chat
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [newSessionMessage, setNewSessionMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // Private Messages (for future use)
  // const [conversations, setConversations] = useState<any[]>([]);
  // const [selectedConversation, setSelectedConversation] = useState<any>(null);
  // const [messages, setMessages] = useState<any[]>([]);
  // const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadFriends();
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    if (currentSession) {
      // Subscribe to session messages
      const messagesRef = collection(db, 'sessionMessages');
      const q = query(messagesRef, where('sessionId', '==', currentSession.id));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
          };
        });
        setSessionMessages(msgs.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
      });
      
      return () => unsubscribe();
    }
  }, [currentSession]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const friendsRef = collection(db, 'friends');
      
      const q1 = query(friendsRef, where('userId', '==', user.id), where('status', '==', 'accepted'));
      const q2 = query(friendsRef, where('friendId', '==', user.id), where('status', '==', 'accepted'));
      
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const friendsList: any[] = [];
      
      for (const docSnap of snapshot1.docs) {
        const data = docSnap.data();
        const userDoc = await getDoc(doc(db, 'users', data.friendId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          friendsList.push({
            id: data.friendId,
            name: userData.name,
            email: userData.email,
            photoURL: userData.photoURL,
          });
        }
      }
      
      for (const docSnap of snapshot2.docs) {
        const data = docSnap.data();
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          friendsList.push({
            id: data.userId,
            name: userData.name,
            email: userData.email,
            photoURL: userData.photoURL,
          });
        }
      }
      
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadSessions = async () => {
    if (!user) return;
    try {
      const sessionsRef = collection(db, 'studySessions');
      const q = query(sessionsRef, where('isActive', '==', true));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const sessionsList = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          // Only show sessions where user is invited or is host
          if (data.hostId === user.id || data.invitedUsers?.includes(user.id)) {
            sessionsList.push({
              id: docSnap.id,
              ...data
            });
          }
        }
        
        setSessions(sessionsList);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // const loadConversations = async () => {
  //   if (!user) return;
  //   // Load conversations with friends - for future use
  // };

  const handleCreateSession = async () => {
    if (!user || !sessionForm.title.trim()) {
      toast.error('Please fill in session title');
      return;
    }

    try {
      const sessionData = {
        hostId: user.id,
        hostName: user.name,
        title: sessionForm.title,
        subject: sessionForm.subject,
        type: sessionForm.type,
        maxParticipants: sessionForm.maxParticipants,
        participants: [user.id],
        invitedUsers: selectedFriends,
        isActive: true,
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'studySessions'), sessionData);
      
      toast.success('Study session created!');
      setShowCreateSession(false);
      setShowInviteFriends(false);
      setSelectedFriends([]);
      setSessionForm({
        title: '',
        subject: '',
        type: 'video',
        maxParticipants: 5,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const handleJoinSession = async (session: any) => {
    if (!user) return;
    
    try {
      // Update session participants in Firebase
      await updateDoc(doc(db, 'studySessions', session.id), {
        participants: arrayUnion(user.id)
      });
      
      setCurrentSession(session);
      setInSession(true);
      
      // Join Agora video call
      const channelName = session.id;
      await videoCallService.joinChannel(channelName, user.id);
      
      // Create and publish local tracks
      const tracksResult = await videoCallService.createLocalTracks();
      if (tracksResult.success) {
        await videoCallService.publishTracks();
        
        // Play local video
        if (localVideoRef.current) {
          videoCallService.playLocalVideo('local-video');
        }
        
        // Subscribe to remote users
        videoCallService.subscribeToRemoteUsers((remoteUser, mediaType) => {
          console.log('Remote user published:', remoteUser.uid, mediaType);
          setRemoteUsers(videoCallService.getRemoteUsers());
        });
      }
      
      toast.success(`Joined ${session.title}`);
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session. Make sure camera/mic permissions are granted.');
    }
  };

  const handleLeaveSession = async () => {
    if (!currentSession || !user) return;
    
    try {
      // Leave Agora video call first
      await videoCallService.leaveChannel();
      
      // Update session participants in Firebase
      const sessionRef = doc(db, 'studySessions', currentSession.id);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        const updatedParticipants = data.participants.filter((id: string) => id !== user.id);
        
        await updateDoc(sessionRef, {
          participants: updatedParticipants
        });
      }
      
      setInSession(false);
      setCurrentSession(null);
      setSessionMessages([]);
      setRemoteUsers([]);
      toast.success('Left the session');
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
    }
  };

  const handleSendSessionMessage = async () => {
    if (!newSessionMessage.trim() || !currentSession || !user) return;
    
    try {
      await addDoc(collection(db, 'sessionMessages'), {
        sessionId: currentSession.id,
        senderId: user.id,
        senderName: user.name,
        message: newSessionMessage,
        timestamp: new Date().toISOString(),
      });
      
      setNewSessionMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users size={32} />
            Multiplayer Study
          </h2>
          <p className="text-white/70 mt-1">Study together with friends in real-time</p>
        </div>
      </div>

      {/* In Session View */}
      {inSession && currentSession && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Session Header */}
          <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{currentSession.title}</h3>
                <p className="text-white/60 text-sm">
                  {currentSession.participants?.length || 0} participants • {currentSession.subject}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  Chat
                </button>
                <button
                  onClick={handleLeaveSession}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <PhoneOff size={18} />
                  Leave
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Video Grid */}
            <div className="flex-1 p-4 grid grid-cols-2 gap-4">
              {/* Local Video */}
              <div className="bg-gray-800 rounded-xl relative overflow-hidden">
                <div 
                  id="local-video" 
                  ref={localVideoRef}
                  className="w-full h-full"
                  style={{ minHeight: '300px' }}
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-white font-semibold">You</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  You {isMuted && '🔇'}
                </div>
              </div>

              {/* Remote Videos */}
              {remoteUsers.map((remoteUser) => (
                <div key={remoteUser.uid} className="bg-gray-800 rounded-xl relative overflow-hidden">
                  <div 
                    id={`remote-${remoteUser.uid}`}
                    className="w-full h-full"
                    style={{ minHeight: '300px' }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    User {remoteUser.uid}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Sidebar */}
            {showChat && (
              <div className="w-80 bg-white/10 backdrop-blur-lg border-l border-white/20 flex flex-col">
                <div className="p-4 border-b border-white/20 flex items-center justify-between">
                  <h3 className="text-white font-bold">Session Chat</h3>
                  <button onClick={() => setShowChat(false)} className="text-white/60 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {sessionMessages.map((msg) => (
                    <div key={msg.id} className={`${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                        msg.senderId === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-white'
                      }`}>
                        {msg.senderId !== user?.id && (
                          <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
                        )}
                        <p>{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/20">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSessionMessage}
                      onChange={(e) => setNewSessionMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendSessionMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button
                      onClick={handleSendSessionMessage}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-all ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isMuted ? <MicOff className="text-white" size={24} /> : <Mic className="text-white" size={24} />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${
                  !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isVideoOn ? <Video className="text-white" size={24} /> : <VideoOff className="text-white" size={24} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'sessions'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Video size={18} className="inline mr-2" />
          Study Sessions
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'messages'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <MessageCircle size={18} className="inline mr-2" />
          Messages
        </button>
      </div>

      {/* Study Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Active Study Sessions</h3>
            <button
              onClick={() => setShowCreateSession(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <UserPlus size={18} />
              Create Session
            </button>
          </div>

          {/* Create Session Modal */}
          {showCreateSession && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="text-white font-bold mb-4">Create Study Session</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Session title *"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={sessionForm.subject}
                  onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  value={sessionForm.type}
                  onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Only</option>
                  <option value="silent">Silent Study</option>
                </select>
                <input
                  type="number"
                  placeholder="Max participants"
                  min="2"
                  max="10"
                  value={sessionForm.maxParticipants}
                  onChange={(e) => setSessionForm({ ...sessionForm, maxParticipants: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                {/* Invite Friends */}
                <div>
                  <button
                    onClick={() => setShowInviteFriends(!showInviteFriends)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    Invite Friends ({selectedFriends.length})
                  </button>
                  
                  {showInviteFriends && (
                    <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
                      {friends.length === 0 ? (
                        <p className="text-white/60 text-sm text-center py-4">No friends to invite</p>
                      ) : (
                        friends.map((friend) => (
                          <label
                            key={friend.id}
                            className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFriends.includes(friend.id)}
                              onChange={() => toggleFriendSelection(friend.id)}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {friend.photoURL ? (
                                <img src={friend.photoURL} alt={friend.name} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {friend.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-white text-sm">{friend.name}</span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCreateSession(false);
                    setShowInviteFriends(false);
                    setSelectedFriends([]);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Video size={48} className="text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No active sessions. Create one to start!</p>
              </div>
            )}
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {session.type === 'video' ? (
                      <Video className="text-purple-400" size={24} />
                    ) : session.type === 'audio' ? (
                      <Mic className="text-blue-400" size=  {24} />
                    ) : (
                      <Users className="text-green-400" size={24} />
                    )}
                    <div>
                      <h4 className="text-white font-bold">{session.title}</h4>
                      <p className="text-white/60 text-sm">Host: {session.hostName}</p>
                    </div>
                  </div>
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                    Live
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {session.participants?.length || 0}/{session.maxParticipants}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(session.startTime).toLocaleTimeString()}
                  </span>
                </div>
                {session.subject && (
                  <span className="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs mb-4">
                    {session.subject}
                  </span>
                )}
                <button
                  onClick={() => handleJoinSession(session)}
                  disabled={session.participants?.length >= session.maxParticipants}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone size={18} />
                  Join Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-bold mb-4">Private Messages</h3>
          <p className="text-white/60 text-center py-8">
            Private messaging feature coming soon! For now, use session chat during study sessions.
          </p>
        </div>
      )}
    </div>
  );
};
