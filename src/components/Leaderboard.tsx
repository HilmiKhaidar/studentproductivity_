import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Calendar, Target, Zap, Award, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LeaderboardEntry, Achievement } from '../types';
import { achievements } from '../data/achievements';
import toast from 'react-hot-toast';

export const Leaderboard: React.FC = () => {
  const { user, tasks, pomodoroSessions } = useStore();
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'achievements' | 'challenges'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadLeaderboard();
      checkAchievements();
    }
  }, [user, tasks, pomodoroSessions]);

  const calculateUserScore = (tasksCount: number, pomodoroCount: number, streak: number) => {
    return (tasksCount * 10) + (pomodoroCount * 5) + (streak * 20);
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const entries: LeaderboardEntry[] = [];
      
      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        
        // Get user's tasks
        const tasksRef = collection(db, 'tasks');
        const tasksQuery = query(tasksRef);
        const tasksSnapshot = await getDocs(tasksQuery);
        const userTasks = tasksSnapshot.docs.filter(
          doc => doc.data().userId === userDoc.id && doc.data().completed
        );
        
        // Get user's pomodoro sessions
        const pomodoroRef = collection(db, 'pomodoroSessions');
        const pomodoroSnapshot = await getDocs(pomodoroRef);
        const userPomodoros = pomodoroSnapshot.docs.filter(
          doc => doc.data().userId === userDoc.id && doc.data().completed
        );
        
        const tasksCount = userTasks.length;
        const pomodoroCount = userPomodoros.length;
        const streak = userData.streak || 0;
        const score = calculateUserScore(tasksCount, pomodoroCount, streak);
        
        entries.push({
          userId: userDoc.id,
          name: userData.name,
          photoURL: userData.photoURL,
          score,
          rank: 0,
          tasksCompleted: tasksCount,
          pomodoroSessions: pomodoroCount,
          streak,
          level: Math.floor(score / 100) + 1,
          badges: userData.badges || [],
        });
      }
      
      // Sort by score and assign ranks
      entries.sort((a, b) => b.score - a.score);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      
      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Gagal memuat leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAchievements = () => {
    if (!user) return;
    
    const completedTasks = tasks.filter(t => t.completed).length;
    const completedPomodoros = pomodoroSessions.filter(p => p.completed).length;
    const currentStreak = 0; // Calculate from habits or tasks
    
    const unlocked: Achievement[] = [];
    
    achievements.forEach(achievement => {
      let isUnlocked = false;
      
      switch (achievement.category) {
        case 'tasks':
          isUnlocked = completedTasks >= achievement.requirement;
          break;
        case 'pomodoro':
          isUnlocked = completedPomodoros >= achievement.requirement;
          break;
        case 'streak':
          isUnlocked = currentStreak >= achievement.requirement;
          break;
        default:
          break;
      }
      
      if (isUnlocked) {
        unlocked.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
        });
      }
    });
    
    setUserAchievements(unlocked);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-300" size={24} />;
      case 3:
        return <Medal className="text-orange-400" size={24} />;
      default:
        return <span className="notion-text-secondary font-bold">#{rank}</span>;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-500 to-gray-600';
      case 'rare':
        return 'from-blue-500 to-blue-600';
      case 'epic':
        return 'from-gray-700 to-gray-900';
      case 'legendary':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const userEntry = leaderboard.find(entry => entry.userId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight flex items-center gap-2">
            <Trophy size={32} className="text-yellow-400" />
            Leaderboard & Achievements
          </h2>
          <p className="notion-text-secondary text-sm mt-2">Compete with others and unlock achievements</p>
        </div>
      </div>

      {/* User Stats Card */}
      {userEntry && (
        <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-gray-300/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {userEntry.photoURL ? (
                <img
                  src={userEntry.photoURL}
                  alt={userEntry.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-yellow-400"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center notion-text font-bold text-2xl">
                  {userEntry.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold notion-heading">{userEntry.name}</h3>
                <p className="notion-text-secondary">Your Rank: #{userEntry.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-yellow-400">{userEntry.score}</p>
              <p className="notion-text-secondary">Total Score</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Target className="text-blue-400 mx-auto mb-1" size={20} />
              <p className="text-lg font-semibold notion-heading">{userEntry.tasksCompleted}</p>
              <p className="notion-text-secondary text-xs">Tasks</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Zap className="text-yellow-400 mx-auto mb-1" size={20} />
              <p className="text-lg font-semibold notion-heading">{userEntry.pomodoroSessions}</p>
              <p className="notion-text-secondary text-xs">Pomodoros</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <TrendingUp className="text-green-400 mx-auto mb-1" size={20} />
              <p className="text-lg font-semibold notion-heading">{userEntry.streak}</p>
              <p className="notion-text-secondary text-xs">Streak</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Star className="notion-text mx-auto mb-1" size={20} />
              <p className="text-lg font-semibold notion-heading">{userEntry.level}</p>
              <p className="notion-text-secondary text-xs">Level</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'global'
              ? 'bg-blue-50 dark:bg-blue-900/10 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <Trophy size={18} className="inline mr-2" />
          Global Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'weekly'
              ? 'bg-blue-50 dark:bg-blue-900/10 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <Calendar size={18} className="inline mr-2" />
          Weekly Competition
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'achievements'
              ? 'bg-blue-50 dark:bg-blue-900/10 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <Award size={18} className="inline mr-2" />
          Achievements ({userAchievements.length}/{achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'challenges'
              ? 'bg-blue-50 dark:bg-blue-900/10 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Team Challenges
        </button>
      </div>

      {/* Global Leaderboard */}
      {activeTab === 'global' && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="notion-text-secondary mt-4">Loading leaderboard...</p>
            </div>
          ) : (
            <>
              {leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={entry.userId}
                  className={`backdrop-blur-lg rounded-xl p-4 border transition-all hover:scale-[1.02] ${
                    entry.rank === 1
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-yellow-500/50'
                      : entry.rank === 2
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-gray-400/50'
                      : entry.rank === 3
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-orange-400/50'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      {entry.photoURL ? (
                        <img
                          src={entry.photoURL}
                          alt={entry.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center notion-text font-bold">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold notion-text flex items-center gap-2">
                          {entry.name}
                          {entry.userId === user?.id && (
                            <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">You</span>
                          )}
                        </h3>
                        <p className="notion-text-secondary text-sm">Level {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold notion-heading">{entry.score}</p>
                      <p className="notion-text-secondary text-sm">points</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="notion-card p-2 text-center">
                      <p className="notion-text font-bold">{entry.tasksCompleted}</p>
                      <p className="notion-text-secondary text-xs">Tasks</p>
                    </div>
                    <div className="notion-card p-2 text-center">
                      <p className="notion-text font-bold">{entry.pomodoroSessions}</p>
                      <p className="notion-text-secondary text-xs">Pomodoros</p>
                    </div>
                    <div className="notion-card p-2 text-center">
                      <p className="notion-text font-bold">{entry.streak} 🔥</p>
                      <p className="notion-text-secondary text-xs">Streak</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Weekly Competition */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-2xl font-bold notion-heading mb-2">🏆 Weekly Challenge</h3>
            <p className="notion-text-secondary mb-4">Compete this week to win exclusive badges!</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="notion-text-secondary text-sm">Starts</p>
                <p className="notion-text font-bold">Monday, 12:00 AM</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="notion-text-secondary text-sm">Ends</p>
                <p className="notion-text font-bold">Sunday, 11:59 PM</p>
              </div>
            </div>
          </div>

          <div className="notion-card p-6">
            <h3 className="text-lg font-semibold notion-heading mb-4">This Week's Top 3</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 3).map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between notion-card p-4">
                  <div className="flex items-center gap-3">
                    {getRankIcon(entry.rank)}
                    <span className="notion-text font-bold">{entry.name}</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{entry.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-gray-300/30">
            <h3 className="text-lg font-semibold notion-heading mb-4">🎁 Prizes</h3>
            <ul className="space-y-2 notion-text/80">
              <li>🥇 1st Place: Legendary Badge + 500 XP</li>
              <li>🥈 2nd Place: Epic Badge + 300 XP</li>
              <li>🥉 3rd Place: Rare Badge + 200 XP</li>
            </ul>
          </div>
        </div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = userAchievements.some(a => a.id === achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`backdrop-blur-lg rounded-xl p-6 border transition-all ${
                    isUnlocked
                      ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)}/20 border-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'gray'}-500/50`
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold notion-text mb-1">{achievement.name}</h3>
                    <p className="notion-text-secondary text-sm mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                        achievement.rarity === 'epic' ? 'bg-gray-800/20 notion-text' :
                        achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      {isUnlocked && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                          ✓ UNLOCKED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Challenges */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
            <h3 className="text-2xl font-bold notion-heading mb-4">⚔️ Team Battle: Study Warriors</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                <h4 className="text-lg font-semibold notion-heading mb-2">Team Alpha 🔵</h4>
                <p className="text-3xl font-bold text-blue-300 mb-2">1,250 pts</p>
                <p className="notion-text-secondary text-sm">5 members</p>
              </div>
              <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
                <h4 className="text-lg font-semibold notion-heading mb-2">Team Beta 🔴</h4>
                <p className="text-3xl font-bold text-red-300 mb-2">1,180 pts</p>
                <p className="notion-text-secondary text-sm">5 members</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/10 h-full" style={{ width: '52%' }}></div>
              </div>
              <p className="notion-text-secondary text-sm text-center mt-2">Ends in 3 days</p>
            </div>
          </div>

          <div className="notion-card p-6">
            <h3 className="text-lg font-semibold notion-heading mb-4">Create Team Challenge</h3>
            <p className="notion-text-secondary mb-4">Challenge your friends to a productivity battle!</p>
            <button className="w-full notion-button-primary notion-text py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-900 transition-all">
              Create Challenge
            </button>
          </div>

          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
            <h3 className="text-lg font-semibold notion-heading mb-2">💡 How Team Challenges Work</h3>
            <ul className="space-y-2 notion-text/80 text-sm">
              <li>• Create or join a team with your friends</li>
              <li>• Compete against another team for 7 days</li>
              <li>• Earn points by completing tasks and pomodoros</li>
              <li>• Winning team gets exclusive badges and XP</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
