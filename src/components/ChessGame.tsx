import React, { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { Clock, MessageCircle, Send, Trophy, Flag, X, UserPlus, RotateCcw } from 'lucide-react';
import { SimpleChessBoard } from './SimpleChessBoard';
import { useStore } from '../store/useStore';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface ChessMatch {
  id: string;
  whitePlayer: { id: string; name: string; photoURL?: string };
  blackPlayer: { id: string; name: string; photoURL?: string };
  currentTurn: 'white' | 'black';
  fen: string;
  moves: string[];
  status: 'waiting' | 'active' | 'finished';
  winner?: 'white' | 'black' | 'draw';
  whiteTime: number;
  blackTime: number;
  lastMoveTime: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export const ChessGame: React.FC = () => {
  const { user } = useStore();
  const [game, setGame] = useState(new Chess());
  const [currentMatch, setCurrentMatch] = useState<ChessMatch | null>(null);
  const [availableMatches, setAvailableMatches] = useState<ChessMatch[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [matchType, setMatchType] = useState<'friend' | 'random' | 'bot'>('friend');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playingWithBot, setPlayingWithBot] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Array<{ move: string; fen: string; timestamp: Date }>>([]);

  // Update user's lastActive timestamp every minute
  useEffect(() => {
    if (!user) return;

    const updateLastActive = async () => {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          lastActive: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating lastActive:', error);
      }
    };

    // Update immediately
    updateLastActive();

    // Update every minute
    const interval = setInterval(updateLastActive, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Load friends
  useEffect(() => {
    if (!user) return;
    
    const loadFriends = async () => {
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
            photoURL: userData.photoURL,
          });
        }
      }
      
      setFriends(friendsList);
    };
    
    loadFriends();
  }, [user]);

  // Load available matches
  useEffect(() => {
    if (!user) return;

    const matchesRef = collection(db, 'chessMatches');
    const q = query(matchesRef, where('status', '==', 'waiting'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matches: ChessMatch[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as ChessMatch;
        if (data.whitePlayer.id !== user.id) {
          matches.push({ ...data, id: docSnap.id });
        }
      });
      setAvailableMatches(matches);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for matches where user is involved (creator or joiner)
  useEffect(() => {
    if (!user || currentMatch) return;

    const matchesRef = collection(db, 'chessMatches');
    
    // Listen for matches where user is white player (creator)
    const q1 = query(
      matchesRef, 
      where('whitePlayer.id', '==', user.id),
      where('status', 'in', ['waiting', 'active'])
    );

    // Listen for matches where user is black player (joiner)
    const q2 = query(
      matchesRef,
      where('blackPlayer.id', '==', user.id),
      where('status', '==', 'active')
    );

    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      if (!snapshot.empty && !currentMatch) {
        const matchDoc = snapshot.docs[0];
        const matchData = matchDoc.data() as ChessMatch;
        setCurrentMatch({ ...matchData, id: matchDoc.id });
        
        // Update game state
        const newGame = new Chess(matchData.fen);
        setGame(newGame);
        setMoveHistory([]); // Reset history for online match
        
        if (matchData.status === 'waiting') {
          toast.success('Waiting for opponent...');
        } else {
          toast.success('Match started! 🎮');
        }
      }
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      if (!snapshot.empty && !currentMatch) {
        const matchDoc = snapshot.docs[0];
        const matchData = matchDoc.data() as ChessMatch;
        setCurrentMatch({ ...matchData, id: matchDoc.id });
        
        // Update game state
        const newGame = new Chess(matchData.fen);
        setGame(newGame);
        setMoveHistory([]); // Reset history for online match
        
        toast.success('Match started! 🎮');
      }
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user, currentMatch]);

  // Subscribe to current match (skip for bot games)
  useEffect(() => {
    if (!currentMatch || playingWithBot) return;

    const matchRef = doc(db, 'chessMatches', currentMatch.id);
    const unsubscribe = onSnapshot(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ChessMatch;
        setCurrentMatch({ ...data, id: snapshot.id });
        
        // Update chess board
        const newGame = new Chess(data.fen);
        setGame(newGame);
      }
    });

    return () => unsubscribe();
  }, [currentMatch?.id, playingWithBot]);

  // Subscribe to chat (skip for bot games)
  useEffect(() => {
    if (!currentMatch || playingWithBot) return;

    const chatRef = collection(db, 'chessChat');
    const q = query(chatRef, where('matchId', '==', currentMatch.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.docs.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setChatMessages(messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ));
    });

    return () => unsubscribe();
  }, [currentMatch?.id, playingWithBot]);

  const createMatch = async () => {
    if (!user) return;

    try {
      if (matchType === 'friend' && !selectedFriend) {
        toast.error('Please select a friend');
        return;
      }

      const matchData: Partial<ChessMatch> = {
        whitePlayer: {
          id: user.id,
          name: user.name,
          photoURL: user.photoURL,
        },
        blackPlayer: matchType === 'friend' 
          ? friends.find(f => f.id === selectedFriend)
          : { id: '', name: 'Waiting...', photoURL: '' },
        currentTurn: 'white',
        fen: new Chess().fen(),
        moves: [],
        status: matchType === 'friend' ? 'waiting' : 'waiting',
        whiteTime: 600, // 10 minutes
        blackTime: 600,
        lastMoveTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'chessMatches'), matchData);

      if (matchType === 'friend') {
        // Send notification to specific friend
        await addDoc(collection(db, 'notifications'), {
          userId: selectedFriend,
          type: 'chess_challenge',
          title: 'Chess Challenge!',
          message: `${user.name} challenged you to a chess match`,
          matchId: docRef.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
        toast.success('Challenge sent!');
      } else if (matchType === 'random') {
        // Send notification to ALL online users
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        const notificationPromises: Promise<any>[] = [];
        usersSnapshot.docs.forEach((userDoc) => {
          const userData = userDoc.data();
          // Skip current user and check if user is online (last active within 5 minutes)
          if (userDoc.id !== user.id && userData.lastActive) {
            const lastActive = new Date(userData.lastActive);
            const now = new Date();
            const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
            
            if (diffMinutes <= 5) { // User is online if active within last 5 minutes
              notificationPromises.push(
                addDoc(collection(db, 'notifications'), {
                  userId: userDoc.id,
                  type: 'chess_random_match',
                  title: '⚡ Quick Chess Match!',
                  message: `${user.name} is looking for a random opponent. Join now!`,
                  matchId: docRef.id,
                  read: false,
                  createdAt: new Date().toISOString(),
                })
              );
            }
          }
        });

        await Promise.all(notificationPromises);
        toast.success(`Looking for opponent... (${notificationPromises.length} players notified)`);
      }

      setShowCreateMatch(false);
      
      // Don't auto-join, let Firebase listener handle it
      // This prevents the match from appearing in available matches list
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match');
    }
  };

  const startBotGame = () => {
    if (!user) return;

    const botMatch: ChessMatch = {
      id: 'bot-game',
      whitePlayer: {
        id: user.id,
        name: user.name,
        photoURL: user.photoURL,
      },
      blackPlayer: {
        id: 'bot',
        name: `Bot (${botDifficulty})`,
        photoURL: '',
      },
      currentTurn: 'white',
      fen: new Chess().fen(),
      moves: [],
      status: 'active',
      whiteTime: 600,
      blackTime: 600,
      lastMoveTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setCurrentMatch(botMatch);
    setPlayingWithBot(true);
    setShowCreateMatch(false);
    setMoveHistory([]); // Reset history
    setGame(new Chess()); // Reset game
    toast.success(`Playing against ${botDifficulty} bot!`);
  };

  const makeBotMove = useCallback(() => {
    if (!playingWithBot || !currentMatch) return;

    setTimeout(() => {
      const possibleMoves = game.moves({ verbose: true });
      if (possibleMoves.length === 0) return;

      let selectedMove;

      if (botDifficulty === 'easy') {
        // Random move
        selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      } else if (botDifficulty === 'medium') {
        // Prefer captures and checks
        const captures = possibleMoves.filter(m => m.captured);
        const checks = possibleMoves.filter(m => {
          const testGame = new Chess(game.fen());
          testGame.move(m);
          return testGame.inCheck();
        });
        
        if (captures.length > 0 && Math.random() > 0.3) {
          selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else if (checks.length > 0 && Math.random() > 0.5) {
          selectedMove = checks[Math.floor(Math.random() * checks.length)];
        } else {
          selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
      } else {
        // Hard: Minimax-like (prefer center control, captures, checks)
        const centerSquares = ['e4', 'e5', 'd4', 'd5'];
        const centerMoves = possibleMoves.filter(m => centerSquares.includes(m.to));
        const captures = possibleMoves.filter(m => m.captured);
        const checks = possibleMoves.filter(m => {
          const testGame = new Chess(game.fen());
          testGame.move(m);
          return testGame.inCheck();
        });

        if (checks.length > 0) {
          selectedMove = checks[Math.floor(Math.random() * checks.length)];
        } else if (captures.length > 0 && Math.random() > 0.2) {
          selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else if (centerMoves.length > 0 && Math.random() > 0.4) {
          selectedMove = centerMoves[Math.floor(Math.random() * centerMoves.length)];
        } else {
          selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
      }

      const gameCopy = new Chess(game.fen());
      gameCopy.move(selectedMove);

      const newMatch: ChessMatch = {
        ...currentMatch,
        fen: gameCopy.fen(),
        currentTurn: 'white',
        moves: [...currentMatch.moves, selectedMove.san],
      };

      if (gameCopy.isCheckmate()) {
        newMatch.status = 'finished';
        newMatch.winner = 'black';
        toast.error('Bot wins! Try again!');
      } else if (gameCopy.isDraw()) {
        newMatch.status = 'finished';
        newMatch.winner = 'draw';
        toast('Game ended in a draw');
      }

      setCurrentMatch(newMatch);
      setGame(gameCopy);
    }, 500 + Math.random() * 1000); // Random delay 0.5-1.5s
  }, [playingWithBot, currentMatch, game, botDifficulty]);

  const joinMatch = async (match: ChessMatch) => {
    if (!user) return;

    try {
      // Update match with new player
      await updateDoc(doc(db, 'chessMatches', match.id), {
        'blackPlayer.id': user.id,
        'blackPlayer.name': user.name,
        'blackPlayer.photoURL': user.photoURL || '',
        status: 'active',
      });

      // Notify the match creator
      await addDoc(collection(db, 'notifications'), {
        userId: match.whitePlayer.id,
        type: 'chess_match_started',
        title: '🎮 Match Started!',
        message: `${user.name} joined your chess match. Game on!`,
        matchId: match.id,
        read: false,
        createdAt: new Date().toISOString(),
      });

      toast.success('Match joined! Good luck! 🎯');
      
      // Don't manually set currentMatch, let Firebase listener handle it
    } catch (error: any) {
      console.error('Error joining match:', error);
      toast.error(error.message || 'Failed to join match');
    }
  };

  // Trigger bot move when it's bot's turn
  useEffect(() => {
    if (playingWithBot && currentMatch && currentMatch.currentTurn === 'black' && currentMatch.status === 'active') {
      makeBotMove();
    }
  }, [playingWithBot, currentMatch?.currentTurn, currentMatch?.status, makeBotMove]);

  const makeMove = useCallback(async (sourceSquare: Square, targetSquare: Square) => {
    if (!currentMatch || !user) return;

    const playerColor = currentMatch.whitePlayer.id === user.id ? 'white' : 'black';
    if (currentMatch.currentTurn !== playerColor) {
      toast.error('Not your turn!');
      return;
    }

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) {
        toast.error('Invalid move');
        return;
      }

      const newFen = gameCopy.fen();
      const newTurn: 'white' | 'black' = gameCopy.turn() === 'w' ? 'white' : 'black';
      
      let status: 'active' | 'finished' = 'active';
      let winner: 'white' | 'black' | 'draw' | undefined;

      if (gameCopy.isCheckmate()) {
        status = 'finished';
        winner = playerColor;
        toast.success('Checkmate! You won! 🎉');
      } else if (gameCopy.isDraw()) {
        status = 'finished';
        winner = 'draw';
        toast('Game ended in a draw');
      }

      // Add to move history
      setMoveHistory(prev => [...prev, { 
        move: move.san, 
        fen: newFen,
        timestamp: new Date() 
      }]);

      if (playingWithBot) {
        // Update local state for bot game
        const newMatch = {
          ...currentMatch,
          fen: newFen,
          currentTurn: newTurn,
          moves: [...currentMatch.moves, move.san],
          status,
          winner,
        };
        setCurrentMatch(newMatch);
        setGame(gameCopy);
      } else {
        // Update Firebase for online game
        await updateDoc(doc(db, 'chessMatches', currentMatch.id), {
          fen: newFen,
          currentTurn: newTurn,
          moves: [...currentMatch.moves, move.san],
          status,
          winner,
          lastMoveTime: new Date().toISOString(),
        });
        setGame(gameCopy);
      }

    } catch (error) {
      console.error('Error making move:', error);
    }
  }, [currentMatch, game, user, playingWithBot]);

  const undoMove = () => {
    if (!playingWithBot || moveHistory.length < 2) {
      toast.error('Cannot undo in online games');
      return;
    }

    // Remove last 2 moves (player + bot)
    const newHistory = moveHistory.slice(0, -2);
    setMoveHistory(newHistory);

    // Restore game state
    if (newHistory.length > 0) {
      const lastState = newHistory[newHistory.length - 1];
      const restoredGame = new Chess(lastState.fen);
      setGame(restoredGame);
      
      if (currentMatch) {
        setCurrentMatch({
          ...currentMatch,
          fen: lastState.fen,
          currentTurn: 'white',
          moves: newHistory.map(h => h.move),
          status: 'active',
          winner: undefined,
        });
      }
    } else {
      // Reset to initial position
      const newGame = new Chess();
      setGame(newGame);
      if (currentMatch) {
        setCurrentMatch({
          ...currentMatch,
          fen: newGame.fen(),
          currentTurn: 'white',
          moves: [],
          status: 'active',
          winner: undefined,
        });
      }
    }

    toast.success('Move undone');
  };

  const sendChatMessage = async () => {
    if (!currentMatch || !user || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'chessChat'), {
        matchId: currentMatch.id,
        senderId: user.id,
        senderName: user.name,
        message: newMessage,
        timestamp: new Date().toISOString(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const resignGame = async () => {
    if (!currentMatch || !user) return;

    if (!confirm('Are you sure you want to resign?')) return;

    try {
      if (playingWithBot) {
        // For bot games, just reset local state
        toast('You resigned');
        setCurrentMatch(null);
        setPlayingWithBot(false);
      } else {
        // For online games, update Firebase
        const playerColor = currentMatch.whitePlayer.id === user.id ? 'white' : 'black';
        const winner = playerColor === 'white' ? 'black' : 'white';

        await updateDoc(doc(db, 'chessMatches', currentMatch.id), {
          status: 'finished',
          winner,
        });

        toast('You resigned');
        setCurrentMatch(null);
      }
    } catch (error) {
      console.error('Error resigning:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-[40px] font-bold notion-heading leading-tight">♟️ Chess Online</h1>
        <p className="notion-text-secondary text-sm">Play chess with friends or random players</p>
      </div>

      <div className="border-b border-[#E9E9E7] dark:border-[#373737]"></div>

      {!currentMatch ? (
        <>
          {/* Create Match Button */}
          <button
            onClick={() => setShowCreateMatch(true)}
            className="notion-button-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            New Chess Match
          </button>

          {/* Available Matches */}
          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold notion-heading">Available Matches</h3>
              <span className="text-xs notion-text-secondary bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                {availableMatches.length} waiting
              </span>
            </div>
            
            <div className="space-y-3">
              {availableMatches.map((match) => {
                const isRandomMatch = match.blackPlayer.id === '';
                const timeAgo = Math.floor((new Date().getTime() - new Date(match.createdAt).getTime()) / 1000);
                const timeText = timeAgo < 60 ? 'Just now' : `${Math.floor(timeAgo / 60)}m ago`;
                
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {match.whitePlayer.photoURL ? (
                        <img src={match.whitePlayer.photoURL} alt={match.whitePlayer.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {match.whitePlayer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="notion-text font-medium">{match.whitePlayer.name}</p>
                          {isRandomMatch && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                              ⚡ Quick Match
                            </span>
                          )}
                        </div>
                        <p className="notion-text-secondary text-xs">{timeText} • Waiting for opponent...</p>
                      </div>
                    </div>
                    <button
                      onClick={() => joinMatch(match)}
                      className="notion-button-primary px-4 py-2 flex items-center gap-1"
                    >
                      <UserPlus size={14} />
                      Join
                    </button>
                  </div>
                );
              })}

              {availableMatches.length === 0 && (
                <div className="text-center py-8">
                  <p className="notion-text-secondary text-sm mb-2">No available matches</p>
                  <p className="notion-text-secondary text-xs">Create a match to start playing!</p>
                </div>
              )}
            </div>
          </div>

          {/* Create Match Modal */}
          {showCreateMatch && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="notion-card p-6 max-w-md w-full notion-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold notion-heading">New Chess Match</h3>
                  <button
                    onClick={() => setShowCreateMatch(false)}
                    className="notion-text-secondary hover:notion-text"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium notion-text mb-2">Match Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setMatchType('friend')}
                        className={`py-2 rounded text-sm font-medium transition-all ${
                          matchType === 'friend'
                            ? 'bg-blue-500 text-white'
                            : 'notion-button'
                        }`}
                      >
                        Friend
                      </button>
                      <button
                        onClick={() => setMatchType('random')}
                        className={`py-2 rounded text-sm font-medium transition-all ${
                          matchType === 'random'
                            ? 'bg-blue-500 text-white'
                            : 'notion-button'
                        }`}
                      >
                        Random
                      </button>
                      <button
                        onClick={() => setMatchType('bot')}
                        className={`py-2 rounded text-sm font-medium transition-all ${
                          matchType === 'bot'
                            ? 'bg-blue-500 text-white'
                            : 'notion-button'
                        }`}
                      >
                        🤖 Bot
                      </button>
                    </div>
                  </div>

                  {matchType === 'friend' && (
                    <div>
                      <label className="block text-sm font-medium notion-text mb-2">Select Friend</label>
                      <select
                        value={selectedFriend}
                        onChange={(e) => setSelectedFriend(e.target.value)}
                        className="notion-input w-full"
                      >
                        <option value="">Choose a friend...</option>
                        {friends.map((friend) => (
                          <option key={friend.id} value={friend.id}>
                            {friend.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {matchType === 'bot' && (
                    <div>
                      <label className="block text-sm font-medium notion-text mb-2">Bot Difficulty</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setBotDifficulty('easy')}
                          className={`py-2 rounded text-sm font-medium transition-all ${
                            botDifficulty === 'easy'
                              ? 'bg-green-500 text-white'
                              : 'notion-button'
                          }`}
                        >
                          😊 Easy
                        </button>
                        <button
                          onClick={() => setBotDifficulty('medium')}
                          className={`py-2 rounded text-sm font-medium transition-all ${
                            botDifficulty === 'medium'
                              ? 'bg-yellow-500 text-white'
                              : 'notion-button'
                          }`}
                        >
                          😐 Medium
                        </button>
                        <button
                          onClick={() => setBotDifficulty('hard')}
                          className={`py-2 rounded text-sm font-medium transition-all ${
                            botDifficulty === 'hard'
                              ? 'bg-red-500 text-white'
                              : 'notion-button'
                          }`}
                        >
                          😈 Hard
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCreateMatch(false)}
                      className="notion-button flex-1 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => matchType === 'bot' ? startBotGame() : createMatch()}
                      className="notion-button-primary flex-1 py-2"
                    >
                      {matchType === 'bot' ? 'Start Game' : 'Create Match'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="notion-card p-6">
              {/* Players Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {currentMatch.blackPlayer.photoURL ? (
                    <img src={currentMatch.blackPlayer.photoURL} alt={currentMatch.blackPlayer.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {currentMatch.blackPlayer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="notion-text text-sm font-medium">{currentMatch.blackPlayer.name}</span>
                  {currentMatch.currentTurn === 'black' && (
                    <Clock size={14} className="text-blue-500" />
                  )}
                </div>
                <span className="notion-text-secondary text-sm">
                  {Math.floor(currentMatch.blackTime / 60)}:{(currentMatch.blackTime % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <SimpleChessBoard
                key={game.fen()} 
                game={game}
                onMove={(from, to) => makeMove(from, to)}
                orientation={currentMatch.whitePlayer.id === user.id ? 'white' : 'black'}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {currentMatch.whitePlayer.photoURL ? (
                    <img src={currentMatch.whitePlayer.photoURL} alt={currentMatch.whitePlayer.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-800 text-xs font-semibold">
                      {currentMatch.whitePlayer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="notion-text text-sm font-medium">{currentMatch.whitePlayer.name}</span>
                  {currentMatch.currentTurn === 'white' && (
                    <Clock size={14} className="text-blue-500" />
                  )}
                </div>
                <span className="notion-text-secondary text-sm">
                  {Math.floor(currentMatch.whiteTime / 60)}:{(currentMatch.whiteTime % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Game Controls */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={resignGame}
                  className="notion-button px-4 py-2 flex items-center gap-2 text-red-600"
                >
                  <Flag size={16} />
                  Resign
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="notion-button px-4 py-2 flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Chat
                </button>
              </div>

              {currentMatch.status === 'finished' && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                  <div className="notion-card p-8 max-w-md w-full mx-4 text-center transform animate-scaleIn">
                    <div className="mb-4">
                      {currentMatch.winner === 'draw' ? (
                        <div className="text-6xl mb-2">🤝</div>
                      ) : (
                        <Trophy className="text-yellow-500 mx-auto mb-2 animate-bounce" size={64} />
                      )}
                    </div>
                    <h2 className="text-3xl font-bold notion-heading mb-2">
                      {currentMatch.winner === 'draw' 
                        ? 'Draw!' 
                        : 'Checkmate!'}
                    </h2>
                    <p className="notion-text text-xl mb-6">
                      {currentMatch.winner === 'draw' 
                        ? 'Game ended in a draw' 
                        : `${currentMatch.winner === 'white' ? currentMatch.whitePlayer.name : currentMatch.blackPlayer.name} wins! 🎉`}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setCurrentMatch(null);
                          setPlayingWithBot(false);
                          setGame(new Chess());
                          setMoveHistory([]);
                        }}
                        className="notion-button-primary flex-1 py-3 text-base"
                      >
                        Back to Lobby
                      </button>
                      {playingWithBot && (
                        <button
                          onClick={() => {
                            startBotGame();
                          }}
                          className="notion-button flex-1 py-3 text-base"
                        >
                          Play Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Moves History */}
            <div className="notion-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold notion-heading">Move History</h4>
                {playingWithBot && moveHistory.length > 0 && currentMatch.status === 'active' && (
                  <button
                    onClick={undoMove}
                    className="notion-button px-2 py-1 text-xs flex items-center gap-1"
                    title="Undo last move (Bot game only)"
                  >
                    <RotateCcw size={12} />
                    Undo
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {moveHistory.length === 0 ? (
                  <p className="notion-text-secondary text-xs text-center py-4">No moves yet</p>
                ) : (
                  moveHistory.map((item, index) => {
                    const moveNumber = Math.floor(index / 2) + 1;
                    const isWhiteMove = index % 2 === 0;
                    const time = item.timestamp.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    });
                    
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5">
                        <span className="notion-text-secondary w-6 text-xs">{isWhiteMove ? `${moveNumber}.` : ''}</span>
                        <span className="notion-text font-medium flex-1">{item.move}</span>
                        <span className="notion-text-secondary text-xs">{time}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat */}
            {showChat && (
              <div className="notion-card p-4">
                <h4 className="text-sm font-semibold notion-heading mb-3">Chat</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 mb-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`text-sm ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-3 py-1 rounded ${
                        msg.senderId === user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 notion-text'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="notion-input flex-1 text-sm"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={sendChatMessage}
                    className="notion-button-primary p-2"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
