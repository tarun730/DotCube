import React, { useState } from 'react';
import { Users, Wifi, Play } from 'lucide-react';

interface StartScreenProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  isConnected: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  isConnected
}) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    if (mode === 'create') {
      onCreateRoom(playerName.trim());
    } else if (mode === 'join' && roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), playerName.trim());
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
          <Wifi className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Connecting to Server...</h2>
          <p className="text-white/70">Please wait while we establish connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-4">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DotCube Conquest</h1>
          <p className="text-white/70">Multiplayer Grid Strategy Game</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {!mode ? (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
              >
                <Users className="w-5 h-5" />
                Create Room
              </button>
              
              <button
                onClick={() => setMode('join')}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 border border-white/30"
              >
                <Play className="w-5 h-5" />
                Join Room
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                  maxLength={20}
                  required
                />
              </div>

              {mode === 'join' && (
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-wider font-mono"
                    placeholder="ABCD12"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!playerName.trim() || (mode === 'join' && !roomId.trim())}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  {mode === 'create' ? 'Create' : 'Join'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-white/60 text-sm">
          <p>Local Wi-Fi Multiplayer • 2+ Players</p>
        </div>
      </div>
    </div>
  );
};