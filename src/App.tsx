import React from 'react';
import { useGame } from './hooks/useGame';
import { StartScreen } from './components/StartScreen';
import { GameLobby } from './components/GameLobby';
import { GameBoard } from './components/GameBoard';
import { GameHUD } from './components/GameHUD';
import { ErrorNotification } from './components/ErrorNotification';

function App() {
  const {
    gameState,
    roomId,
    currentPlayerId,
    isConnected,
    error,
    createRoom,
    joinRoom,
    startGame,
    makeMove,
    isMyTurn,
    clearError
  } = useGame();

  // Show start screen if not in a room or not connected
  if (!roomId || !gameState || !currentPlayerId) {
    return (
      <>
        <StartScreen
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          isConnected={isConnected}
        />
        <ErrorNotification error={error} onClose={clearError} />
      </>
    );
  }

  // Show lobby if game hasn't started
  if (gameState.status === 'waiting') {
    return (
      <>
        <GameLobby
          gameState={gameState}
          roomId={roomId}
          currentPlayerId={currentPlayerId}
          onStartGame={startGame}
        />
        <ErrorNotification error={error} onClose={clearError} />
      </>
    );
  }

  // Show game board if game is in progress or finished
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <GameHUD gameState={gameState} currentPlayerId={currentPlayerId} />
      <GameBoard
        gameState={gameState}
        currentPlayerId={currentPlayerId}
        isMyTurn={isMyTurn()}
        onMakeMove={makeMove}
      />
      <ErrorNotification error={error} onClose={clearError} />
    </div>
  );
}

export default App;