import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);


// Enable CORS for your frontend domain
app.use(cors({
  origin: 'https://dotcube.netlify.app',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Root route for test
app.get('/', (req, res) => {
  res.send("✅ API is running");
});



const io = new Server(server, {
  cors: {
    origin: 'https://dotcube.netlify.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});


io.on('connection', (socket) => {
  console.log('✅ Client connected');
  
  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected');
  });
});



// Game state management
const gameRooms = new Map();

class GameRoom {
  constructor(roomId, hostId, hostName) {
    this.id = roomId;
    this.hostId = hostId;
    this.players = new Map();
    this.gameState = {
      status: 'waiting', // waiting, playing, finished
      currentPlayer: 0,
      grid: { rows: 4, cols: 4 },
      lines: new Set(),
      cubes: new Map(),
      scores: new Map(),
      moveHistory: []
    };
    this.addPlayer(hostId, hostName, true);
  }

  addPlayer(playerId, playerName, isHost = false) {
    const playerColor = this.getNextPlayerColor();
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      color: playerColor,
      isHost,
      score: 0,
      connected: true
    });
    this.gameState.scores.set(playerId, 0);
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.gameState.scores.delete(playerId);
  }

  getNextPlayerColor() {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F97316', '#8B5CF6', '#06B6D4'];
    return colors[this.players.size % colors.length];
  }

  startGame(rows, cols) {
    this.gameState.status = 'playing';
    this.gameState.grid = { rows, cols };
    this.gameState.currentPlayer = 0;
    this.gameState.lines.clear();
    this.gameState.cubes.clear();
    this.gameState.moveHistory = [];
    
    // Reset scores
    for (const playerId of this.players.keys()) {
      this.gameState.scores.set(playerId, 0);
    }
  }

  makeMove(playerId, line) {
    const playerIndex = Array.from(this.players.keys()).indexOf(playerId);
    if (playerIndex !== this.gameState.currentPlayer) {
      return { success: false, error: 'Not your turn' };
    }

    const lineKey = `${line.x1},${line.y1}-${line.x2},${line.y2}`;
    if (this.gameState.lines.has(lineKey)) {
      return { success: false, error: 'Line already drawn' };
    }

    this.gameState.lines.add(lineKey);
    this.gameState.moveHistory.push({ playerId, line, timestamp: Date.now() });

    // Check for completed cubes
    const newCubes = this.checkForNewCubes(line);
    let bonusTurn = false;

    if (newCubes.length > 0) {
      bonusTurn = true;
      for (const cube of newCubes) {
        const cubeKey = `${cube.x},${cube.y}`;
        this.gameState.cubes.set(cubeKey, playerId);
        const currentScore = this.gameState.scores.get(playerId) || 0;
        this.gameState.scores.set(playerId, currentScore + 1);
      }
    }

    // Move to next player if no bonus turn
    if (!bonusTurn) {
      this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.players.size;
    }

    // Check if game is finished
    if (this.isGameFinished()) {
      this.gameState.status = 'finished';
    }

    return { success: true, newCubes, bonusTurn };
  }

  checkForNewCubes(newLine) {
    const { rows, cols } = this.gameState.grid;
    const newCubes = [];

    // Check all possible cube positions that could be affected by this line
    for (let x = 0; x < cols - 1; x++) {
      for (let y = 0; y < rows - 1; y++) {
        if (this.isCubeComplete(x, y) && !this.gameState.cubes.has(`${x},${y}`)) {
          newCubes.push({ x, y });
        }
      }
    }

    return newCubes;
  }

  isCubeComplete(x, y) {
    const lines = [
      `${x},${y}-${x+1},${y}`,     // top
      `${x+1},${y}-${x+1},${y+1}`, // right
      `${x},${y+1}-${x+1},${y+1}`, // bottom
      `${x},${y}-${x},${y+1}`      // left
    ];

    return lines.every(line => 
      this.gameState.lines.has(line) || 
      this.gameState.lines.has(this.reverseLineKey(line))
    );
  }

  reverseLineKey(lineKey) {
    const [start, end] = lineKey.split('-');
    return `${end}-${start}`;
  }

  isGameFinished() {
    const { rows, cols } = this.gameState.grid;
    const totalPossibleCubes = (rows - 1) * (cols - 1);
    return this.gameState.cubes.size >= totalPossibleCubes;
  }

  getGameState() {
    return {
      ...this.gameState,
      players: Array.from(this.players.values()),
      lines: Array.from(this.gameState.lines),
      cubes: Object.fromEntries(this.gameState.cubes),
      scores: Object.fromEntries(this.gameState.scores)
    };
  }
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('create-room', ({ playerName }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = new GameRoom(roomId, socket.id, playerName);
    gameRooms.set(roomId, room);
    
    socket.join(roomId);
    socket.emit('room-created', { roomId, gameState: room.getGameState() });
  });

  socket.on('join-room', ({ roomId, playerName }) => {
    const room = gameRooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.gameState.status === 'playing') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    room.addPlayer(socket.id, playerName);
    socket.join(roomId);
    
    io.to(roomId).emit('player-joined', { gameState: room.getGameState() });
  });

  socket.on('start-game', ({ roomId, rows, cols }) => {
    const room = gameRooms.get(roomId);
    if (!room || room.players.get(socket.id)?.isHost !== true) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }

    if (room.players.size < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }

    room.startGame(rows, cols);
    io.to(roomId).emit('game-started', { gameState: room.getGameState() });
  });

  socket.on('make-move', ({ roomId, line }) => {
    const room = gameRooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const result = room.makeMove(socket.id, line);
    if (result.success) {
      io.to(roomId).emit('move-made', { 
        gameState: room.getGameState(),
        lastMove: { playerId: socket.id, line, newCubes: result.newCubes }
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    // Find and update room
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        room.removePlayer(socket.id);
        
        if (room.players.size === 0) {
          gameRooms.delete(roomId);
        } else {
          io.to(roomId).emit('player-left', { gameState: room.getGameState() });
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});