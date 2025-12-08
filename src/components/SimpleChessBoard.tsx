import React from 'react';
import { Chess, Square } from 'chess.js';

interface SimpleChessBoardProps {
  game: Chess;
  onMove: (from: Square, to: Square) => void | Promise<void>;
  orientation?: 'white' | 'black';
}

// SVG Chess Pieces (better quality)
const chessPieces: { [key: string]: string } = {
  'wP': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  'wN': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'wB': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'wR': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'wQ': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'wK': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  'bP': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'bN': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'bB': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'bR': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'bQ': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'bK': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

export const SimpleChessBoard: React.FC<SimpleChessBoardProps> = ({ game, onMove, orientation = 'white' }) => {
  const [selectedSquare, setSelectedSquare] = React.useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = React.useState<Square[]>([]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  if (orientation === 'black') {
    files.reverse();
    ranks.reverse();
  }

  const handleSquareClick = (square: Square) => {
    if (selectedSquare) {
      // Try to make a move
      const moves = game.moves({ square: selectedSquare, verbose: true });
      const validMove = moves.find(m => m.to === square);
      
      if (validMove) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        // Select new piece
        const newMoves = game.moves({ square, verbose: true });
        if (newMoves.length > 0) {
          setSelectedSquare(square);
          setPossibleMoves(newMoves.map(m => m.to as Square));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Select piece
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setPossibleMoves(moves.map(m => m.to as Square));
      }
    }
  };

  const getPieceImage = (file: string, rank: string): string | null => {
    const square = (file + rank) as Square;
    const piece = game.get(square);
    if (!piece) return null;
    const color = piece.color === 'w' ? 'w' : 'b';
    const type = piece.type.toUpperCase();
    return chessPieces[color + type];
  };

  const isKingInCheck = (file: string, rank: string): boolean => {
    const square = (file + rank) as Square;
    const piece = game.get(square);
    if (!piece || piece.type !== 'k') return false;
    // Only highlight the king that is currently in check (whose turn it is)
    const currentTurn = game.turn();
    return game.inCheck() && piece.color === currentTurn;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      width: '100%',
      maxWidth: '600px',
      aspectRatio: '1',
      margin: '0 auto',
      border: '3px solid #333',
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      {ranks.map((rank, rankIndex) => 
        files.map((file, fileIndex) => {
          const square = (file + rank) as Square;
          const isLight = (rankIndex + fileIndex) % 2 === 0;
          const isSelected = selectedSquare === square;
          const isPossibleMove = possibleMoves.includes(square);
          const pieceImage = getPieceImage(file, rank);
          const kingInCheck = isKingInCheck(file, rank);

          return (
            <div
              key={square}
              onClick={() => handleSquareClick(square)}
              style={{
                backgroundColor: kingInCheck
                  ? '#ff6b6b'
                  : isSelected 
                    ? '#baca44' 
                    : isPossibleMove 
                      ? '#646f40'
                      : isLight 
                        ? '#f0d9b5' 
                        : '#b58863',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                userSelect: 'none',
                transition: 'background-color 0.15s ease',
                aspectRatio: '1'
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isPossibleMove && !kingInCheck) {
                  e.currentTarget.style.backgroundColor = isLight ? '#e8d1a8' : '#a87d5c';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isPossibleMove && !kingInCheck) {
                  e.currentTarget.style.backgroundColor = isLight ? '#f0d9b5' : '#b58863';
                }
              }}
            >
              {pieceImage && (
                <img 
                  src={pieceImage} 
                  alt="chess piece"
                  style={{
                    width: '85%',
                    height: '85%',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
                  }}
                />
              )}
              {isPossibleMove && !pieceImage && (
                <div style={{
                  width: '30%',
                  height: '30%',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  position: 'absolute'
                }} />
              )}
              {isPossibleMove && pieceImage && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '3px solid rgba(100,111,64,0.6)',
                  borderRadius: '50%',
                  margin: '5px'
                }} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
