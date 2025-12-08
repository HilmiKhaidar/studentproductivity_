declare module 'react-chessboard' {
  import { FC } from 'react';

  export interface ChessboardProps {
    position?: string;
    onPieceDrop?: (sourceSquare: string, targetSquare: string) => boolean | Promise<boolean>;
    boardOrientation?: 'white' | 'black';
    customBoardStyle?: React.CSSProperties;
    [key: string]: any;
  }

  export const Chessboard: FC<ChessboardProps>;
}
