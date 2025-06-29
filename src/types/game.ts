export interface Player {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  score: number;
  connected: boolean;
}

export interface GameState {
  status: 'waiting' | 'playing' | 'finished';
  currentPlayer: number;
  grid: {
    rows: number;
    cols: number;
  };
  lines: string[];
  cubes: Record<string, string>;
  scores: Record<string, number>;
  players: Player[];
  moveHistory: GameMove[];
}

export interface GameMove {
  playerId: string;
  line: Line;
  timestamp: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Cube {
  x: number;
  y: number;
}

export interface GameRoom {
  id: string;
  gameState: GameState;
}