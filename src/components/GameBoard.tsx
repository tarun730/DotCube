import React, { useState, useCallback } from 'react';
import { GameState, Line } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  isMyTurn: boolean;
  onMakeMove: (line: Line) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  isMyTurn,
  onMakeMove
}) => {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  
  const { grid, lines, cubes, players } = gameState;
  const dotSize = 8;
  const cellSize = 60;
  const lineWidth = 3;

  const getLineKey = (x1: number, y1: number, x2: number, y2: number): string => {
    return `${Math.min(x1, x2)},${Math.min(y1, y2)}-${Math.max(x1, x2)},${Math.max(y1, y2)}`;
  };

  const isLineDrawn = (x1: number, y1: number, x2: number, y2: number): boolean => {
    const key = getLineKey(x1, y1, x2, y2);
    return lines.includes(key);
  };

  const handleLineClick = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    if (!isMyTurn || isLineDrawn(x1, y1, x2, y2)) return;
    
    const line: Line = { x1, y1, x2, y2 };
    onMakeMove(line);
  }, [isMyTurn, onMakeMove, lines]);

  const renderDot = (x: number, y: number) => (
    <circle
      key={`dot-${x}-${y}`}
      cx={x * cellSize}
      cy={y * cellSize}
      r={dotSize / 2}
      fill="rgba(255, 255, 255, 0.8)"
      className="drop-shadow-sm"
    />
  );

  const renderLine = (x1: number, y1: number, x2: number, y2: number, type: 'horizontal' | 'vertical') => {
    const key = getLineKey(x1, y1, x2, y2);
    const isDrawn = isLineDrawn(x1, y1, x2, y2);
    const isHovered = hoveredLine === key;
    const canDraw = isMyTurn && !isDrawn;

    return (
      <line
        key={key}
        x1={x1 * cellSize}
        y1={y1 * cellSize}
        x2={x2 * cellSize}
        y2={y2 * cellSize}
        stroke={isDrawn ? 'rgba(255, 255, 255, 0.9)' : isHovered && canDraw ? 'rgba(255, 255, 255, 0.6)' : 'transparent'}
        strokeWidth={lineWidth}
        strokeLinecap="round"
        className={`transition-all duration-200 ${canDraw ? 'cursor-pointer' : ''}`}
        onClick={() => handleLineClick(x1, y1, x2, y2)}
        onMouseEnter={() => canDraw && setHoveredLine(key)}
        onMouseLeave={() => setHoveredLine(null)}
      />
    );
  };

  const renderHitArea = (x1: number, y1: number, x2: number, y2: number) => {
    const key = getLineKey(x1, y1, x2, y2);
    const isDrawn = isLineDrawn(x1, y1, x2, y2);
    const canDraw = isMyTurn && !isDrawn;

    if (!canDraw) return null;

    return (
      <line
        key={`hit-${key}`}
        x1={x1 * cellSize}
        y1={y1 * cellSize}
        x2={x2 * cellSize}
        y2={y2 * cellSize}
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
        onClick={() => handleLineClick(x1, y1, x2, y2)}
        onMouseEnter={() => setHoveredLine(key)}
        onMouseLeave={() => setHoveredLine(null)}
      />
    );
  };

  const renderCube = (x: number, y: number) => {
    const cubeKey = `${x},${y}`;
    const ownerId = cubes[cubeKey];
    if (!ownerId) return null;

    const owner = players.find((p:any) => p.id === ownerId);
    console.log(owner);
    
    if (!owner) return null;

    const centerX = (x + 0.5) * cellSize;
    const centerY = (y + 0.5) * cellSize;
    const size = cellSize * 0.6;

    return (
      <>
        <rect
          key={`cube-${x}-${y}`}
          x={centerX - size / 2}
          y={centerY - size / 2}
          width={size}
          height={size}
          fill={owner.color}
          fillOpacity={0.3}
          stroke={owner.color}
          strokeWidth={2}
          rx={4}
          className="animate-pulse"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={owner.color}
          fontSize={12}
          fontWeight="bold"
          pointerEvents="none"
        >
          {owner.name}
        </text>
      </>
    );
    
  };

  const svgWidth = (grid.cols - 1) * cellSize + dotSize;
  const svgHeight = (grid.rows - 1) * cellSize + dotSize;

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="overflow-visible"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          {/* Render cubes first (background) */}
          {Array.from({ length: grid.rows - 1 }, (_, y) =>
            Array.from({ length: grid.cols - 1 }, (_, x) => renderCube(x, y))
          )}

          {/* Render horizontal lines */}
          {Array.from({ length: grid.rows }, (_, y) =>
            Array.from({ length: grid.cols - 1 }, (_, x) =>
              renderLine(x, y, x + 1, y, 'horizontal')
            )
          )}

          {/* Render vertical lines */}
          {Array.from({ length: grid.rows - 1 }, (_, y) =>
            Array.from({ length: grid.cols }, (_, x) =>
              renderLine(x, y, x, y + 1, 'vertical')
            )
          )}

          {/* Render hit areas for better interaction */}
          {Array.from({ length: grid.rows }, (_, y) =>
            Array.from({ length: grid.cols - 1 }, (_, x) =>
              renderHitArea(x, y, x + 1, y)
            )
          )}
          {Array.from({ length: grid.rows - 1 }, (_, y) =>
            Array.from({ length: grid.cols }, (_, x) =>
              renderHitArea(x, y, x, y + 1)
            )
          )}

          {/* Render dots last (foreground) */}
          {Array.from({ length: grid.rows }, (_, y) =>
            Array.from({ length: grid.cols }, (_, x) => renderDot(x, y))
          )}
        </svg>
      </div>
    </div>
  );
};