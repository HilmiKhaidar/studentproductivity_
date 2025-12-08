import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane } from '@react-three/drei';
import { Users, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { collection, query, where, onSnapshot, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import * as THREE from 'three';

interface OnlineUser {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  status: string;
  lastActive: string;
}

// Simple Avatar Component
function Avatar({ position, color, name, isCurrentUser }: { 
  position: [number, number, number]; 
  color: string; 
  name: string;
  isCurrentUser: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current && !isCurrentUser) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Body */}
      <Sphere ref={meshRef} args={[0.3, 16, 16]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      
      {/* Head */}
      <Sphere args={[0.2, 16, 16]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      
      {/* Name tag */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>
      
      {/* Highlight ring for current user */}
      {isCurrentUser && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Study Room Environment
function StudyRoom() {
  return (
    <group>
      {/* Floor */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#8b7355" />
      </Plane>
      
      {/* Walls */}
      <Plane args={[20, 5]} position={[0, 2.5, -10]} receiveShadow>
        <meshStandardMaterial color="#e8d5c4" />
      </Plane>
      
      {/* Study Tables */}
      {[-4, 0, 4].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Table */}
          <Box args={[2, 0.1, 1]} position={[0, 0.8, 0]} castShadow>
            <meshStandardMaterial color="#654321" />
          </Box>
          {/* Table legs */}
          {[[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]].map((pos, j) => (
            <Box key={j} args={[0.1, 0.8, 0.1]} position={[pos[0], 0.4, pos[1]]} castShadow>
              <meshStandardMaterial color="#654321" />
            </Box>
          ))}
          {/* Laptop */}
          <Box args={[0.6, 0.02, 0.4]} position={[0, 0.86, 0]} castShadow>
            <meshStandardMaterial color="#2c3e50" />
          </Box>
        </group>
      ))}
      
      {/* Bookshelves */}
      {[-8, 8].map((x, i) => (
        <Box key={i} args={[1, 3, 0.5]} position={[x, 1.5, -9]} castShadow>
          <meshStandardMaterial color="#8b4513" />
        </Box>
      ))}
      
      {/* Ceiling light */}
      <pointLight position={[0, 4, 0]} intensity={0.5} castShadow />
      <Sphere args={[0.2, 16, 16]} position={[0, 4, 0]}>
        <meshBasicMaterial color="#fff8dc" />
      </Sphere>
    </group>
  );
}

export const VirtualStudyRoom: React.FC = () => {
  const { user } = useStore();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [myPosition, setMyPosition] = useState<[number, number, number]>([0, 0, 2]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [myColor] = useState(() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  // Update user position in Firebase
  useEffect(() => {
    if (!user) return;

    const updatePosition = async () => {
      try {
        await setDoc(doc(db, 'virtualStudyRoom', user.id), {
          id: user.id,
          name: user.name,
          position: myPosition,
          color: myColor,
          status: 'studying',
          lastActive: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating position:', error);
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 5000);

    return () => {
      clearInterval(interval);
      // Remove user from room on unmount
      deleteDoc(doc(db, 'virtualStudyRoom', user.id)).catch(console.error);
    };
  }, [user, myPosition, myColor]);

  // Listen to other users
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'virtualStudyRoom'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: OnlineUser[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as OnlineUser;
        if (data.id !== user.id) {
          // Check if user is still active (within last 10 seconds)
          const lastActive = new Date(data.lastActive);
          const now = new Date();
          if (now.getTime() - lastActive.getTime() < 10000) {
            users.push(data);
          }
        }
      });
      setOnlineUsers(users);
    });

    return () => unsubscribe();
  }, [user]);

  // Move avatar with keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const speed = 0.5;
      setMyPosition((prev) => {
        let [x, y, z] = prev;
        
        switch(e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            z -= speed;
            break;
          case 's':
          case 'arrowdown':
            z += speed;
            break;
          case 'a':
          case 'arrowleft':
            x -= speed;
            break;
          case 'd':
          case 'arrowright':
            x += speed;
            break;
        }
        
        // Boundaries
        x = Math.max(-9, Math.min(9, x));
        z = Math.max(-8, Math.min(8, z));
        
        return [x, y, z];
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-4 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold notion-heading">🏛️ Virtual Study Room</h1>
          <p className="notion-text-secondary text-xs sm:text-sm">Study together in 3D space</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="notion-card px-3 py-2 flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <span className="notion-text text-sm font-medium">{onlineUsers.length + 1}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#E9E9E7] dark:border-[#373737]"></div>

      {/* 3D Canvas */}
      <div className={`notion-card overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}>
        <div className={`${isFullscreen ? 'h-screen' : 'h-[600px]'} w-full bg-gradient-to-b from-sky-200 to-sky-100`}>
          <Canvas
            shadows
            camera={{ position: [0, 8, 12], fov: 50 }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={0.8}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            {/* Environment */}
            <StudyRoom />
            
            {/* Current user avatar */}
            <Avatar
              position={myPosition}
              color={myColor}
              name={user.name}
              isCurrentUser={true}
            />
            
            {/* Other users */}
            {onlineUsers.map((otherUser) => (
              <Avatar
                key={otherUser.id}
                position={otherUser.position}
                color={otherUser.color}
                name={otherUser.name}
                isCurrentUser={false}
              />
            ))}
            
            {/* Camera controls */}
            <OrbitControls
              enablePan={false}
              minDistance={5}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          {/* Instructions */}
          <div className="notion-card p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <p className="notion-text text-xs font-medium mb-1">Controls:</p>
            <p className="notion-text-secondary text-xs">WASD / Arrow Keys - Move</p>
            <p className="notion-text-secondary text-xs">Mouse Drag - Rotate Camera</p>
            <p className="notion-text-secondary text-xs">Scroll - Zoom</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="notion-button p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="notion-button p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        {/* Online users list */}
        <div className="absolute top-4 right-4 notion-card p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm max-w-xs">
          <h3 className="notion-heading text-sm font-semibold mb-2 flex items-center gap-2">
            <Users size={16} />
            Online ({onlineUsers.length + 1})
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <div className="flex items-center gap-2 py-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: myColor }}></div>
              <span className="notion-text text-xs font-medium">{user.name} (You)</span>
            </div>
            {onlineUsers.map((otherUser) => (
              <div key={otherUser.id} className="flex items-center gap-2 py-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: otherUser.color }}></div>
                <span className="notion-text-secondary text-xs">{otherUser.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="notion-card p-4">
          <h3 className="notion-heading text-sm font-semibold mb-2">🎯 Focus Together</h3>
          <p className="notion-text-secondary text-xs">
            Study with others in a virtual environment. See who's online and stay motivated!
          </p>
        </div>
        
        <div className="notion-card p-4">
          <h3 className="notion-heading text-sm font-semibold mb-2">🎮 Interactive</h3>
          <p className="notion-text-secondary text-xs">
            Move around the room, explore different study spots, and interact with the environment.
          </p>
        </div>
        
        <div className="notion-card p-4">
          <h3 className="notion-heading text-sm font-semibold mb-2">👥 Social</h3>
          <p className="notion-text-secondary text-xs">
            Feel the presence of other students. You're not alone in your study journey!
          </p>
        </div>
      </div>
    </div>
  );
};
