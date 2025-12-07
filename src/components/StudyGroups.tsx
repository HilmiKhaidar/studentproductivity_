import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageCircle, Play, Pause, UserPlus, Send, X, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { StudyGroup, SharedTask, GroupSession, GroupMessage } from '../types';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export const StudyGroups: React.FC = () => {
  const { user, studyGroups, addStudyGroup, updateStudyGroup, sharedTasks, addSharedTask, updateSharedTask, groupMessages, addGroupMessage } = useStore();
  const [activeTab, setActiveTab] = useState<'groups' | 'tasks' | 'sessions'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#8b5cf6',
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  const [chatMessage, setChatMessage] = useState('');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    if (user) {
      loadFriends();
      subscribeToGroups();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      subscribeToGroupMessages(selectedGroup.id);
      subscribeToSharedTasks(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const friendsRef = collection(db, 'friends');
      const q = query(friendsRef, where('status', '==', 'accepted'));
      const snapshot = await getDocs(q);
      
      const friendsList = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const friendId = data.userId === user.id ? data.friendId : data.userId;
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
          friendsList.push({ id: friendId, ...userDoc.data() });
        }
      }
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const subscribeToGroups = () => {
    if (!user) return;
    const groupsRef = collection(db, 'studyGroups');
    const q = query(groupsRef, where('members', 'array-contains', user.id));
    
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const groupData = { id: change.doc.id, ...change.doc.data() } as StudyGroup;
        if (change.type === 'added' || change.type === 'modified') {
          addStudyGroup(groupData);
        }
      });
    });
  };

  const subscribeToGroupMessages = (groupId: string) => {
    const messagesRef = collection(db, 'groupMessages');
    const q = query(messagesRef, where('groupId', '==', groupId));
    
    return onSnapshot(q, (snapshot) => {
      const messages: GroupMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as GroupMessage);
      });
      // Clear and set all messages to avoid duplicates
      messages.forEach(msg => addGroupMessage(msg));
    });
  };

  const subscribeToSharedTasks = (groupId: string) => {
    const tasksRef = collection(db, 'sharedTasks');
    const q = query(tasksRef, where('groupId', '==', groupId));
    
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const taskData = { id: change.doc.id, ...change.doc.data() } as SharedTask;
        if (change.type === 'added' || change.type === 'modified') {
          addSharedTask(taskData);
        }
      });
    });
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupForm.name.trim()) {
      toast.error('Nama group tidak boleh kosong!');
      return;
    }

    try {
      const groupData: Omit<StudyGroup, 'id'> = {
        name: groupForm.name,
        description: groupForm.description,
        creatorId: user.id,
        members: [user.id],
        inviteCode: generateInviteCode(),
        createdAt: new Date().toISOString(),
        isActive: true,
        color: groupForm.color,
        goals: [],
      };

      const docRef = await addDoc(collection(db, 'studyGroups'), groupData);
      addStudyGroup({ id: docRef.id, ...groupData });
      
      toast.success('Study group berhasil dibuat!');
      setIsCreateModalOpen(false);
      setGroupForm({ name: '', description: '', color: colors[0] });
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Gagal membuat study group');
    }
  };

  const handleInviteMember = async (friendId: string) => {
    if (!selectedGroup) return;
    
    try {
      const updatedMembers = [...selectedGroup.members, friendId];
      await updateDoc(doc(db, 'studyGroups', selectedGroup.id), {
        members: updatedMembers,
      });
      
      updateStudyGroup(selectedGroup.id, { members: updatedMembers });
      toast.success('Teman berhasil diundang!');
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Gagal mengundang teman');
    }
  };

  const handleJoinByCode = async () => {
    if (!user || !joinCode.trim()) {
      toast.error('Masukkan kode invite!');
      return;
    }

    try {
      const groupsRef = collection(db, 'studyGroups');
      const q = query(groupsRef, where('inviteCode', '==', joinCode.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error('Kode invite tidak valid!');
        return;
      }

      const groupDoc = snapshot.docs[0];
      const groupData = groupDoc.data() as StudyGroup;

      if (groupData.members.includes(user.id)) {
        toast.error('Kamu sudah menjadi member group ini!');
        return;
      }

      const updatedMembers = [...groupData.members, user.id];
      await updateDoc(doc(db, 'studyGroups', groupDoc.id), {
        members: updatedMembers,
      });

      addStudyGroup({ ...groupData, id: groupDoc.id, members: updatedMembers });
      toast.success(`Berhasil join group "${groupData.name}"!`);
      setJoinCode('');
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Gagal join group');
    }
  };

  const copyInviteCode = () => {
    if (selectedGroup) {
      navigator.clipboard.writeText(selectedGroup.inviteCode);
      toast.success('Kode invite berhasil disalin!');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroup || !taskForm.title.trim()) {
      toast.error('Judul task tidak boleh kosong!');
      return;
    }

    try {
      const taskData: Omit<SharedTask, 'id'> = {
        groupId: selectedGroup.id,
        title: taskForm.title,
        description: taskForm.description,
        assignedTo: taskForm.assignedTo.length > 0 ? taskForm.assignedTo : selectedGroup.members,
        dueDate: taskForm.dueDate,
        completed: false,
        completedBy: [],
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        priority: taskForm.priority,
        category: 'group',
      };

      const docRef = await addDoc(collection(db, 'sharedTasks'), taskData);
      addSharedTask({ id: docRef.id, ...taskData });
      
      toast.success('Task berhasil dibuat!');
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', assignedTo: [], dueDate: '', priority: 'medium' });
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Gagal membuat task');
    }
  };

  const handleCompleteTask = async (taskId: string, task: SharedTask) => {
    if (!user) return;
    
    try {
      const completedBy = task.completedBy.includes(user.id)
        ? task.completedBy.filter(id => id !== user.id)
        : [...task.completedBy, user.id];
      
      const isCompleted = completedBy.length === task.assignedTo.length;
      
      await updateDoc(doc(db, 'sharedTasks', taskId), {
        completedBy,
        completed: isCompleted,
      });
      
      updateSharedTask(taskId, { completedBy, completed: isCompleted });
      toast.success(completedBy.includes(user.id) ? 'Task ditandai selesai!' : 'Task ditandai belum selesai');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Gagal update task');
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedGroup || !chatMessage.trim()) return;

    try {
      const messageData: Omit<GroupMessage, 'id'> = {
        groupId: selectedGroup.id,
        senderId: user.id,
        senderName: user.name,
        message: chatMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      await addDoc(collection(db, 'groupMessages'), messageData);
      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan');
    }
  };

  const handleStartSession = async () => {
    if (!user || !selectedGroup) return;

    try {
      const sessionData: Omit<GroupSession, 'id'> = {
        groupId: selectedGroup.id,
        type: 'pomodoro',
        startTime: new Date().toISOString(),
        duration: 25 * 60,
        activeMembers: [user.id],
        isActive: true,
      };

      await addDoc(collection(db, 'groupSessions'), sessionData);
      setIsSessionActive(true);
      setSessionTimer(0);
      toast.success('Group study session dimulai!');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Gagal memulai session');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const groupTasks = sharedTasks.filter(t => t.groupId === selectedGroup?.id);
  
  // Remove duplicates and sort messages
  const groupChats = groupMessages
    .filter(m => m.groupId === selectedGroup?.id)
    .filter((msg, index, self) => 
      index === self.findIndex((m) => m.id === msg.id)
    )
    .sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users size={32} />
            Study Groups
          </h2>
          <p className="text-white/70 mt-1">Belajar bersama teman-temanmu</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <UserPlus size={20} />
            Join via Code
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Buat Group
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {studyGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group)}
            className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 transition-all text-left hover:bg-white/15 ${
              selectedGroup?.id === group.id ? 'border-purple-500' : 'border-white/20'
            }`}
            style={{ borderLeftWidth: '4px', borderLeftColor: group.color }}
          >
            <h3 className="text-lg font-bold text-white mb-2">{group.name}</h3>
            <p className="text-white/70 text-sm mb-3">{group.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">{group.members.length} members</span>
              <span className="text-white/60">{groupTasks.length} tasks</span>
            </div>
          </button>
        ))}
        {studyGroups.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users size={48} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Belum ada study group. Buat yang pertama!</p>
          </div>
        )}
      </div>

      {/* Selected Group Details */}
      {selectedGroup && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{selectedGroup.name}</h3>
              <p className="text-white/70 mb-3">{selectedGroup.description}</p>
              <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 inline-flex">
                <div>
                  <p className="text-white/60 text-xs mb-1">Invite Code</p>
                  <p className="text-white font-mono text-lg font-bold">{selectedGroup.inviteCode}</p>
                </div>
                <button
                  onClick={copyInviteCode}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                Task
              </button>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Chat
              </button>
              <button
                onClick={isSessionActive ? () => setIsSessionActive(false) : handleStartSession}
                className={`${
                  isSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                } text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2`}
              >
                {isSessionActive ? <Pause size={16} /> : <Play size={16} />}
                {isSessionActive ? formatTime(sessionTimer) : 'Start'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'tasks' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              Tasks ({groupTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'groups' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              Members ({selectedGroup.members.length})
            </button>
          </div>

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {groupTasks.map((task) => (
                <div key={task.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleCompleteTask(task.id, task)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          task.completedBy.includes(user?.id || '')
                            ? 'bg-green-500 border-green-500'
                            : 'border-white/30 hover:border-white/50'
                        }`}
                      >
                        {task.completedBy.includes(user?.id || '') && <CheckCircle size={14} className="text-white" />}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-bold text-white ${task.completed ? 'line-through opacity-50' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-white/60 text-sm mt-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                          <span>Due: {new Date(task.dueDate).toLocaleDateString('id-ID')}</span>
                          <span>•</span>
                          <span>{task.completedBy.length}/{task.assignedTo.length} completed</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
              {groupTasks.length === 0 && (
                <p className="text-white/60 text-center py-8">Belum ada task. Buat task pertama!</p>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'groups' && (
            <div className="space-y-3">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    const friendsNotInGroup = friends.filter(f => !selectedGroup.members.includes(f.id));
                    if (friendsNotInGroup.length === 0) {
                      toast.error('Semua teman sudah ada di group!');
                      return;
                    }
                    const friendId = friendsNotInGroup[0].id;
                    handleInviteMember(friendId);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Invite Friend
                </button>
              </div>
              {selectedGroup.members.map((memberId) => (
                <div key={memberId} className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {memberId.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Member {memberId.slice(0, 8)}</p>
                    <p className="text-white/60 text-sm">
                      {memberId === selectedGroup.creatorId ? 'Creator' : 'Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Sidebar */}
      {isChatOpen && selectedGroup && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-purple-900/98 to-indigo-900/98 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/5">
            <div>
              <h3 className="text-lg font-bold text-white">Group Chat</h3>
              <p className="text-white/60 text-xs">{selectedGroup.name}</p>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {groupChats.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle size={48} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">Belum ada pesan. Mulai chat!</p>
              </div>
            )}
            {groupChats.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${
                  msg.senderId === user?.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : 'bg-white/10'
                } rounded-2xl p-3 shadow-lg`}>
                  {msg.senderId !== user?.id && (
                    <p className="text-xs font-semibold text-white/90 mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-white break-words">{msg.message}</p>
                  <p className="text-xs text-white/50 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/20 bg-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ketik pesan..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join by Code Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Join Study Group</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Masukkan Kode Invite</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center font-mono text-xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ABC123"
                  maxLength={6}
                />
                <p className="text-white/60 text-sm mt-2">Minta kode invite dari teman yang sudah ada di group</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleJoinByCode}
                  disabled={joinCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Group
                </button>
                <button
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setJoinCode('');
                  }}
                  className="px-6 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Buat Study Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Nama Group</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Matematika Study Group"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Deskripsi</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Belajar matematika bersama untuk UTS"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Warna</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setGroupForm({ ...groupForm, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        groupForm.color === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Buat Group
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Buat Task Baru</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Judul Task</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Kerjakan soal latihan"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Deskripsi</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Detail task..."
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Deadline</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Buat Task
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-6 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
