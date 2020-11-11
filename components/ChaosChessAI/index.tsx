import React, { FC, useEffect, useCallback } from 'react';
import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Board from '../Board';
import GameDetails from '../GameDetails';
import {
  init,
  moveTo,
  resign,
  draw,
  boardSelector,
  movePiece,
  promote,
  GameTypes,
} from '../../redux/board';
import { currentTurn } from '../../redux/util';
import { userSelector } from '../../redux/user';
import { chaosSelector, changeDifficulty } from '../../redux/chaos';
import DifficultySlider from './subcomponents/DifficultySlider';
import debounce from 'lodash/debounce';

export interface AIProps {
  className?: string;
}

export const AI: FC<AIProps> = ({
  className,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const {
    fen,
    premoves,
    validMoves,
    whitePlayer,
    blackPlayer,
    history,
    future,
    lastMove,
    isMovingOver,
    isMovingFrom,
    isPromoting,
  } = useSelector(boardSelector);
  const { difficulty } = useSelector(chaosSelector);

  const debouncedInit = useCallback(debounce((difficulty: number) => {
    dispatch(init({ type: GameTypes.Chaos, difficulty }));
  }, 500), []);

  useEffect(() => {
    debouncedInit(difficulty);
  }, [difficulty]);

  const handleMove = (pos?: number) => {
    dispatch(moveTo(pos));
  };

  const handleResign = () => {
    dispatch(resign(true));
  };
  
  const handleDraw = () => {
    dispatch(draw(true));
  };

  const handlePromote = (piece: string) => {
    dispatch(promote(piece));
  };

  const handleChangeDifficulty = (difficulty: number) => {
    dispatch(changeDifficulty(difficulty));
  };

  useEffect(() => {
    if (fen) {
      const color = currentTurn(fen);
      const isCurrentTurn = (
        (color === 'white' && whitePlayer === user) ||
        (color === 'black' && blackPlayer === user)
      );
      if (isCurrentTurn) {
        for (let { from, to } of premoves) {
          if (validMoves[from] && validMoves[from].includes(to)) {
            dispatch(movePiece({ from, to }));
            return;
          }
        }
      }
    }
  }, [
    fen,
    premoves,
    validMoves,
    whitePlayer,
    blackPlayer,
    user,
  ]);
  
  return (
    <div className={cn(styles.root, className)}>
      <Board
        className={styles.board}
        moveTo={handleMove}
        validMoves={validMoves}
        isMovingOver={isMovingOver}
        isMovingFrom={isMovingFrom}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        future={future}
        premoves={premoves}
        board={fen}
        lastMove={lastMove}
        user={user}
      />
      <DifficultySlider
        className={styles.difficultySlider}
        difficulty={difficulty}
        onChangeDifficulty={handleChangeDifficulty}
      />
      <GameDetails
        className={styles.details}
        onResign={handleResign}
        onDraw={handleDraw}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        history={history}
        future={future}
        lastMove={lastMove}
        board={fen}
        user={user}
        isPromoting={isPromoting}
        onPromote={handlePromote}
      />
    </div>
  );
};

export default AI;
