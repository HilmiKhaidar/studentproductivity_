import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckSquare, Coffee, ThumbsUp, Zap, Video, MessageCircle, Volume2, UserPlus, X, Play, Pause } from 'lucide-react';
import { useStore } from '../store/useStore';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface OnlineFriend {
  id: string;
  name: string;
  photoURL?: string;
  status: 'online' | 'studying' | 'break';
  currentActivity?: string;
  lastSeen: string;
}

interface StudyRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  participants: string[];
  pomodoroTime: number;
  pomodoroRunning: boolean;
  pomodoroStartedAt?: string;
  sharedTasks: SharedTask[];
  reactions: Reaction[];
  ambientSound?: string;
  createdAt: string;
}

interface SharedTask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  completedBy?: string;
}

interface Reaction {
  userId: string;
  userName: string;
  emoji: string;
  timestamp: string;
}

export const CoStudyRoom: React.FC = () => {
  const { user } = useStore();
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([]);
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);

  // Load online friends
  useEffect(() => {
    if (!user) return;

    const presenceRef = collection(db, 'presence');
    const q = query(presenceRef, where('status', '!=', 'offline'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const friends: OnlineFriend[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.userId !== user.id) {
          friends.push({
            id: data.userId,
            name: data.userName,
            photoURL: data.photoURL,
            status: data.status,
            currentActivity: data.currentActivity,
            lastSeen: data.lastSeen,
          });
        }
      });
      setOnlineFriends(friends);
    });

    return () => unsubscribe();
  }, [user]);

  // Update own presence
  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      const presenceRef = doc(db, 'presence', user.id);
      await updateDoc(presenceRef, {
        userId: user.id,
        userName: user.name,
        photoURL: user.photoURL || '',
        status: activeRoom ? 'studying' : 'online',
        currentActivity: activeRoom ? `In ${activeRoom.name}` : '',
        lastSeen: serverTimestamp(),
      }).catch(async () => {
        // Create if doesn't exist
        await addDoc(collection(db, 'presence'), {
          userId: user.id,
          userName: user.name,
          photoURL: user.photoURL || '',
          status: 'online',
          currentActivity: '',
          lastSeen: serverTimestamp(),
        });
      });
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [user, activeRoom]);

  // Pomodoro timer
  useEffect(() => {
    if (!activeRoom || !activeRoom.pomodoroRunning) return;

    const interval = setInterval(() => {
      if (activeRoom.pomodoroStartedAt) {
        const startTime = new Date(activeRoom.pomodoroStartedAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = activeRoom.pomodoroTime * 60 - elapsed;
        
        if (remaining <= 0) {
          setTimeLeft(0);
          toast.success('Pomodoro completed! 🎉');
        } else {
          setTimeLeft(remaining);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  const createRoom = async () => {
    if (!user || !roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    try {
      const roomData = {
        name: roomName,
        hostId: user.id,
        hostName: user.name,
        participants: [user.id, ...selectedFriends],
        pomodoroTime: pomodoroMinutes,
        pomodoroRunning: false,
        sharedTasks: [],
        reactions: [],
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'coStudyRooms'), roomData);
      
      // Send notifications to invited friends
      for (const friendId of selectedFriends) {
        await addDoc(collection(db, 'notifications'), {
          userId: friendId,
          type: 'study_room_invite',
          title: 'Study Room Invitation',
          message: `${user.name} invited you to join "${roomName}"`,
          roomId: docRef.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success('Study room created!');
      setShowCreateRoom(false);
      setRoomName('');
      setSelectedFriends([]);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };

  const startPomodoro = async () => {
    if (!activeRoom) return;

    try {
      await updateDoc(doc(db, 'coStudyRooms', activeRoom.id), {
        pomodoroRunning: true,
        pomodoroStartedAt: new Date().toISOString(),
      });
      toast.success('Pomodoro started for everyone! 🍅');
    } catch (error) {
      console.error('Error starting pomodoro:', error);
    }
  };

  const pausePomodoro = async () => {
    if (!activeRoom) return;

    try {
      await updateDoc(doc(db, 'coStudyRooms', activeRoom.id), {
        pomodoroRunning: false,
      });
      toast('Pomodoro paused');
    } catch (error) {
      console.error('Error pausing pomodoro:', error);
    }
  };

  const addSharedTask = async () => {
    if (!activeRoom || !user || !newTaskTitle.trim()) return;

    try {
      const newTask: SharedTask = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
        assignedTo: user.id,
      };

      await updateDoc(doc(db, 'coStudyRooms', activeRoom.id), {
        sharedTasks: arrayUnion(newTask),
      });

      setNewTaskTitle('');
      toast.success('Task added!');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const sendReaction = async (emoji: string) => {
    if (!activeRoom || !user) return;

    try {
      const reaction: Reaction = {
        userId: user.id,
        userName: user.name,
        emoji,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'coStudyRooms', activeRoom.id), {
        reactions: arrayUnion(reaction),
      });
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-[40px] font-bold notion-heading leading-tight">Co-Study Room</h1>
        <p className="notion-text-secondary text-sm">Study together with friends in real-time</p>
      </div>

      <div className="border-b border-[#E9E9E7] dark:border-[#373737]"></div>

      {/* Online Friends */}
      <div className="notion-card p-6">
        <h3 className="text-lg font-semibold notion-heading mb-4 flex items-center gap-2">
          <Users size={18} className="text-green-500" />
          Friends Online ({onlineFriends.length})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {onlineFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-2 p-3 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="relative">
                {friend.photoURL ? (
                  <img src={friend.photoURL} alt={friend.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  friend.status === 'studying' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="notion-text text-sm font-medium truncate">{friend.name}</p>
                <p className="notion-text-secondary text-xs truncate">
                  {friend.currentActivity || friend.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {onlineFriends.length === 0 && (
          <p className="notion-text-secondary text-center py-8 text-sm">
            No friends online right now
          </p>
        )}
      </div>

      {/* Create Room Button */}
      {!activeRoom && (
        <button
          onClick={() => setShowCreateRoom(true)}
          className="notion-button-primary w-full py-3 flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          Create Study Room
        </button>
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="notion-card p-6 max-w-md w-full notion-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold notion-heading">Create Study Room</h3>
              <button
                onClick={() => setShowCreateRoom(false)}
                className="notion-text-secondary hover:notion-text"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium notion-text mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="notion-input w-full"
                  placeholder="e.g., Math Study Session"
                />
              </div>

              <div>
                <label className="block text-sm font-medium notion-text mb-2">Pomodoro Duration (minutes)</label>
                <input
                  type="number"
                  value={pomodoroMinutes}
                  onChange={(e) => setPomodoroMinutes(parseInt(e.target.value))}
                  className="notion-input w-full"
                  min="5"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium notion-text mb-2">Invite Friends</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {onlineFriends.map((friend) => (
                    <label
                      key={friend.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFriends([...selectedFriends, friend.id]);
                          } else {
                            setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="notion-text text-sm">{friend.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="notion-button flex-1 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  className="notion-button-primary flex-1 py-2"
                >
                  Create Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Room */}
      {activeRoom && (
        <div className="space-y-4">
          {/* Room Header */}
          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold notion-heading">{activeRoom.name}</h3>
                <p className="notion-text-secondary text-sm">
                  {activeRoom.participants.length} participants
                </p>
              </div>
              <button
                onClick={() => setActiveRoom(null)}
                className="notion-button px-4 py-2"
              >
                Leave Room
              </button>
            </div>

            {/* Pomodoro Timer */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded p-6 text-center">
              <div className="text-5xl font-bold notion-heading mb-4">
                {formatTime(timeLeft || activeRoom.pomodoroTime * 60)}
              </div>
              <div className="flex items-center justify-center gap-3">
                {!activeRoom.pomodoroRunning ? (
                  <button
                    onClick={startPomodoro}
                    className="notion-button-primary px-6 py-2 flex items-center gap-2"
                  >
                    <Play size={16} />
                    Start Pomodoro
                  </button>
                ) : (
                  <button
                    onClick={pausePomodoro}
                    className="notion-button px-6 py-2 flex items-center gap-2"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Reactions */}
          <div className="notion-card p-4">
            <p className="notion-text-secondary text-xs mb-3">Quick Reactions</p>
            <div className="flex gap-2">
              {['👍', '🎉', '☕', '💪', '🔥', '😴'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Shared Tasks */}
          <div className="notion-card p-6">
            <h4 className="text-base font-semibold notion-heading mb-4">Shared Tasks</h4>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSharedTask()}
                className="notion-input flex-1"
                placeholder="Add a task..."
              />
              <button
                onClick={addSharedTask}
                className="notion-button-primary px-4 py-2"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {activeRoom.sharedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-4 h-4"
                  />
                  <span className={`notion-text text-sm flex-1 ${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
