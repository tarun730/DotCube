import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { GameState, Line, Player } from '../types/game';

interface UseGameReturn {
  gameState: GameState | null;
  roomId: string | null;
  currentPlayerId: string | null;
  isConnected: boolean;
  error: string | null;
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomId: string, playerName: string) => Promise<void>;
  startGame: (rows: number, cols: number) => Promise<void>;
  makeMove: (line: Line) => Promise<void>;
  getCurrentPlayer: () => Player | null;
  isMyTurn: () => boolean;
  clearError: () => void;
}

export const useGame = (): UseGameReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        
        socketService.onGameStateUpdate((newGameState) => {
          setGameState(newGameState);
        });

        socketService.onError((errorMessage) => {
          setError(errorMessage);
        });
      } catch (err) {
        setError('Failed to connect to server');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  const createRoom = useCallback(async (playerName: string) => {
    try {
      setError(null);
      const { roomId: newRoomId, gameState: newGameState } = await socketService.createRoom(playerName);
      setRoomId(newRoomId);
      setGameState(newGameState);
      setCurrentPlayerId(newGameState.players[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  }, []);

  const joinRoom = useCallback(async (roomId: string, playerName: string) => {
    try {
      setError(null);
      const newGameState = await socketService.joinRoom(roomId, playerName);
      setRoomId(roomId);
      setGameState(newGameState);
      
      // Find the current player
      const currentPlayer = newGameState.players.find(p => p.name === playerName);
      if (currentPlayer) {
        setCurrentPlayerId(currentPlayer.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }, []);

  const startGame = useCallback(async (rows: number, cols: number) => {
    try {
      setError(null);
      const newGameState = await socketService.startGame(rows, cols);
      setGameState(newGameState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  }, []);

  const makeMove = useCallback(async (line: Line) => {
    try {
      setError(null);
      await socketService.makeMove(line);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make move');
    }
  }, []);

  const getCurrentPlayer = useCallback((): Player | null => {
    if (!gameState || gameState.players.length === 0) return null;
    return gameState.players[gameState.currentPlayer] || null;
  }, [gameState]);

  const isMyTurn = useCallback((): boolean => {
    const currentPlayer = getCurrentPlayer();
    return currentPlayer?.id === currentPlayerId;
  }, [getCurrentPlayer, currentPlayerId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    gameState,
    roomId,
    currentPlayerId,
    isConnected,
    error,
    createRoom,
    joinRoom,
    startGame,
    makeMove,
    getCurrentPlayer,
    isMyTurn,
    clearError
  };
};