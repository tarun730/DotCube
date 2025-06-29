import React, { useState } from 'react';
import { Users, Settings, Play, Copy, Check } from 'lucide-react';
import { GameState } from '../types/game';

interface GameLobbyProps {
  gameState: GameState;
  roomId: string;
  currentPlayerId: string;
  onStartGame: (rows: number, cols: number) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  gameState,
  roomId,
  currentPlayerId,
  onStartGame
}) => {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [copied, setCopied] = useState(false);

  const isHost = gameState.players.find(p => p.id === currentPlayerId)?.isHost || false;
  const canStart = gameState.players.length >= 2 && isHost;

  const copyRoomId = async () => {
         console.log(roomId);
    
    try {
      await navigator.clipboard.writeText(roomId); 

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID');
    }
  };

  const handleStartGame = () => {
    onStartGame(rows, cols);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-white/70">Room Code:</span>
            <button
              onClick={copyRoomId}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg px-4 py-2 text-white font-mono text-lg tracking-wider border border-white/30 transition-all duration-200 flex items-center gap-2"
            >
              {roomId}
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Players Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Players ({gameState.players.length})</h2>
            </div>
            
            <div className="space-y-3">
              {gameState.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-white font-medium flex-1">
                    {player.name}
                    {player.isHost && (
                      <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                        Host
                      </span>
                    )}
                    {player.id === currentPlayerId && (
                      <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${player.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              ))}
            </div>

            {gameState.players.length < 2 && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  Waiting for more players... (Need at least 2 players)
                </p>
              </div>
            )}
          </div>

          {/* Game Settings Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Game Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Grid Rows: {rows}
                </label>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  disabled={!isHost}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>3</span>
                  <span>8</span>
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Grid Columns: {cols}
                </label>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value))}
                  disabled={!isHost}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>3</span>
                  <span>8</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2">Game Preview</h3>
                <p className="text-white/70 text-sm mb-3">
                  {rows} × {cols} grid = {(rows - 1) * (cols - 1)} possible cubes
                </p>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {Array.from({ length: rows }, (_, y) =>
                    Array.from({ length: cols }, (_, x) => (
                      <div
                        key={`${x}-${y}`}
                        className="w-3 h-3 bg-white/30 rounded-full"
                      />
                    ))
                  )}
                </div>
              </div>

              {!isHost && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Only the host can change game settings
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};