import React from 'react';
import { Crown, Trophy, Clock, Users } from 'lucide-react';
import { GameState, Player } from '../types/game';

interface GameHUDProps {
  gameState: GameState;
  currentPlayerId: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, currentPlayerId }) => {
  const { players, currentPlayer, status, scores } = gameState;
  const currentPlayerData = players[currentPlayer];
  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  const totalCubes = Object.keys(gameState.cubes).length;
  const maxPossibleCubes = (gameState.grid.rows - 1) * (gameState.grid.cols - 1);

  const getPlayerRank = (player: Player): number => {
    return sortedPlayers.findIndex(p => p.id === player.id) + 1;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Game Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              {status === 'playing' ? 'Game in Progress' : status === 'finished' ? 'Game Finished' : 'Waiting'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-white/70">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{players.length} players</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>{totalCubes}/{maxPossibleCubes} cubes</span>
            </div>
          </div>
        </div>

        {status === 'playing' && currentPlayerData && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: currentPlayerData.color }}
              />
              <span className="text-white font-medium">
                {currentPlayerData.id === currentPlayerId ? "Your turn!" : `${currentPlayerData.name}'s turn`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Player Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPlayers.map((player) => {
          const score = scores[player.id] || 0;
          const rank = getPlayerRank(player);
          const isCurrentPlayer = player.id === currentPlayerId;
          const isActive = status === 'playing' && players[currentPlayer]?.id === player.id;

          return (
            <div
              key={player.id}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border transition-all duration-200 ${
                isActive
                  ? 'border-white/40 ring-2 ring-white/20 '
                  : isCurrentPlayer
                  ? 'border-blue-400/40'
                  : 'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${isActive ? 'animate-ping' : ''}`}
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-white font-medium truncate">
                    {player.name}
                    {isCurrentPlayer && <span className="text-blue-300 ml-1">(You)</span>}
                  </span>
                  
                </div>
                
                <span className="text-white font-medium">
                {currentPlayerData.id === currentPlayerId ? "Your turn!" : `${currentPlayerData.name}'s turn`}
              </span>


                {rank === 1 && status === 'finished' && (
                  <Crown className="w-5 h-5 text-yellow-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{score}</div>
                  <div className="text-white/60 text-sm">
                    {score === 1 ? 'cube' : 'cubes'}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white/80 font-medium">#{rank}</div>
                  <div className="text-white/60 text-sm">rank</div>
                </div>
              </div>

              {player.isHost && (
                <div className="mt-2 inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                  <Crown className="w-3 h-3" />
                  Host
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Winner Announcement */}
      {status === 'finished' && (
        <div className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30 text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Game Finished!</h2>
          <p className="text-white/80 mb-4">
            {sortedPlayers[0].name} wins with {scores[sortedPlayers[0].id]} cubes!
          </p>
          {sortedPlayers[0].id === currentPlayerId && (
            <div className="text-yellow-300 font-medium">Congratulations! 🎉</div>
          )}
        </div>
      )}
    </div>
  );
};