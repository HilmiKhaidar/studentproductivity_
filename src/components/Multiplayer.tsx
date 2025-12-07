import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, MessageCircle, Share2, Palette, Phone, PhoneOff, UserPlus, Clock, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const Multiplayer: React.FC = () => {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'sessions' | 'messages' | 'activity' | 'whiteboard'>('sessions');
  
  // Study Sessions
  const [sessions, setSessions] = useState<any[]>([
    {
      id: '1',
      hostName: 'Ahmad',
      title: 'Belajar Kalkulus Bareng',
      participants: 3,
      maxParticipants: 5,
      subject: 'Matematika',
      type: 'video',
      isActive: true,
      startTime: new Date().toISOString(),
    },
    {
      id: '2',
      hostName: 'Sarah',
      title: 'Study Group - Algoritma',
      participants: 2,
      maxParticipants: 4,
      subject: 'Informatika',
      type: 'audio',
      isActive: true,
      startTime: new Date().toISOString(),
    },
  ]);
  
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [inSession, setInSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  // Messages
  const [conversations] = useState<any[]>([
    {
      id: '1',
      friendId: 'friend1',
      friendName: 'Ahmad',
      lastMessage: 'Ayo belajar bareng!',
      timestamp: new Date().toISOString(),
      unread: 2,
    },
    {
      id: '2',
      friendId: 'friend2',
      friendName: 'Sarah',
      lastMessage: 'Thanks for helping!',
      timestamp: new Date().toISOString(),
      unread: 0,
    },
  ]);
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Activity Feed
  const [activities, setActivities] = useState<any[]>([
    {
      id: '1',
      userName: 'Ahmad',
      userPhoto: null,
      type: 'task_completed',
      content: 'completed 5 tasks today! 🎉',
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
    },
    {
      id: '2',
      userName: 'Sarah',
      userPhoto: null,
      type: 'streak_milestone',
      content: 'reached a 30-day streak! 🔥',
      timestamp: new Date().toISOString(),
      likes: ['user1'],
      comments: [],
    },
  ]);

  const handleCreateSession = () => {
    const newSession = {
      id: Date.now().toString(),
      hostName: user?.name || 'You',
      title: 'New Study Session',
      participants: 1,
      maxParticipants: 5,
      subject: 'General',
      type: 'video',
      isActive: true,
      startTime: new Date().toISOString(),
    };
    setSessions([newSession, ...sessions]);
    toast.success('Study session created!');
    setShowCreateSession(false);
  };

  const handleJoinSession = (session: any) => {
    setCurrentSession(session);
    setInSession(true);
    toast.success(`Joined ${session.title}`);
  };

  const handleLeaveSession = () => {
    setInSession(false);
    setCurrentSession(null);
    toast.success('Left the session');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const message = {
      id: Date.now().toString(),
      senderId: user?.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    toast.success('Message sent!');
  };

  const handleLikeActivity = (activityId: string) => {
    setActivities(activities.map(a => {
      if (a.id === activityId) {
        const likes = a.likes.includes(user?.id)
          ? a.likes.filter((id: string) => id !== user?.id)
          : [...a.likes, user?.id];
        return { ...a, likes };
      }
      return a;
    }));
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
                <p className="text-white/60 text-sm">{currentSession.participants} participants</p>
              </div>
              <button
                onClick={handleLeaveSession}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <PhoneOff size={18} />
                Leave
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-4 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                    {i === 1 ? user?.name?.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <p className="text-white font-semibold">{i === 1 ? 'You' : `User ${i}`}</p>
                </div>
                {i === 1 && !isVideoOn && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Camera Off
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isMuted ? <MicOff className="text-white" size={24} /> : <Mic className="text-white" size={24} />}
              </button>
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-4 rounded-full transition-all ${
                  !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isVideoOn ? <Video className="text-white" size={24} /> : <VideoOff className="text-white" size={24} />}
              </button>
              <button className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                <Share2 className="text-white" size={24} />
              </button>
              <button className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                <Palette className="text-white" size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
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
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'messages'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <MessageCircle size={18} className="inline mr-2" />
          Messages
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Activity size={18} className="inline mr-2" />
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab('whiteboard')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'whiteboard'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Palette size={18} className="inline mr-2" />
          Whiteboard
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

          {showCreateSession && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="text-white font-bold mb-4">Create Study Session</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Session title"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Only</option>
                  <option value="silent">Silent Study</option>
                </select>
                <input
                  type="number"
                  placeholder="Max participants"
                  min="2"
                  max="10"
                  defaultValue="5"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowCreateSession(false)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Mic className="text-blue-400" size={24} />
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
                    {session.participants}/{session.maxParticipants}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(session.startTime).toLocaleTimeString()}
                  </span>
                </div>
                <span className="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs mb-4">
                  {session.subject}
                </span>
                <button
                  onClick={() => handleJoinSession(session)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversations List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-bold mb-4">Conversations</h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedConversation?.id === conv.id
                      ? 'bg-purple-600/30 border border-purple-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold">{conv.friendName}</span>
                    {conv.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm truncate">{conv.lastMessage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-white/20">
                  <h3 className="text-white font-bold">{selectedConversation.friendName}</h3>
                  <p className="text-white/60 text-sm">Online</p>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderId === user?.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <p>{msg.text}</p>
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
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className="text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Feed Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Friend Activity</h3>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {activity.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-bold">{activity.userName}</span> {activity.content}
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleLikeActivity(activity.id)}
                        className={`flex items-center gap-2 text-sm transition-all ${
                          activity.likes.includes(user?.id)
                            ? 'text-red-400'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        ❤️ {activity.likes.length}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-all">
                        💬 {activity.comments.length}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Whiteboard Tab */}
      {activeTab === 'whiteboard' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Shared Whiteboard</h3>
            <div className="flex gap-2">
              <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all">
                ✏️ Pen
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all">
                ⬜ Shape
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all">
                🗑️ Clear
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl h-[500px] flex items-center justify-center">
            <p className="text-gray-400">Whiteboard canvas - Draw here to collaborate!</p>
          </div>
        </div>
      )}
    </div>
  );
};
