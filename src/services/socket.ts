import { io, Socket } from 'socket.io-client';
import { GameState, Line } from '../types/game';

class SocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(`http://${window.location.hostname}:3001`);

      
      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  createRoom(playerName: string): Promise<{ roomId: string; gameState: GameState }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('create-room', { playerName });

      this.socket.once('room-created', (data) => {
        this.roomId = data.roomId;
        resolve(data);
      });

      this.socket.once('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  joinRoom(roomId: string, playerName: string): Promise<GameState> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('join-room', { roomId, playerName });
      this.roomId = roomId;

      this.socket.once('player-joined', (data) => {
        resolve(data.gameState);
      });

      this.socket.once('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  startGame(rows: number, cols: number): Promise<GameState> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.roomId) {
        reject(new Error('Not connected or no room'));
        return;
      }

      this.socket.emit('start-game', { roomId: this.roomId, rows, cols });

      this.socket.once('game-started', (data) => {
        resolve(data.gameState);
      });

      this.socket.once('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  makeMove(line: Line): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.roomId) {
        reject(new Error('Not connected or no room'));
        return;
      }

      this.socket.emit('make-move', { roomId: this.roomId, line });

      this.socket.once('move-made', () => {
        resolve();
      });

      this.socket.once('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  onGameStateUpdate(callback: (gameState: GameState) => void) {
    if (!this.socket) return;

    this.socket.on('player-joined', (data) => callback(data.gameState));
    this.socket.on('player-left', (data) => callback(data.gameState));
    this.socket.on('game-started', (data) => callback(data.gameState));
    this.socket.on('move-made', (data) => callback(data.gameState));
  }

  onError(callback: (error: string) => void) {
    if (!this.socket) return;
    this.socket.on('error', (error) => callback(error.message));
  }

  getRoomId(): string | null {
    return this.roomId;
  }
}

export const socketService = new SocketService();