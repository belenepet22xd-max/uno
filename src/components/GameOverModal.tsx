import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameStats } from '../types';

interface GameOverModalProps {
  isOpen: boolean;
  winner: 'player' | 'ai' | null;
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  stats,
  onRestart,
}) => {
  useEffect(() => {
    if (isOpen && winner === 'player') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen, winner]);

  if (!isOpen || !winner) return null;

  const isPlayerWinner = winner === 'player';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
        <div className="text-6xl mb-2 animate-bounce">
          {isPlayerWinner ? '🏆' : '🤖'}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {isPlayerWinner ? '¡Victoria Rotunda!' : '¡La IA ha Ganado!'}
        </h2>

        <p className="text-sm text-slate-300 mb-6">
          {isPlayerWinner
            ? '¡Excelente partida! Te has quedado sin cartas primero y dominaste la mesa de UNO.'
            : 'La computadora logró descartar todas sus cartas primero. ¡Toma tu revancha ahora!'}
        </p>

        {/* Marcador */}
        <div className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-3.5 mb-6 flex justify-around items-center">
          <div>
            <div className="text-xs font-semibold text-slate-400">Tus Victorias</div>
            <div className="text-xl font-black text-emerald-400">{stats.playerWins}</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-xs font-semibold text-slate-400">Victorias IA</div>
            <div className="text-xl font-black text-amber-400">{stats.aiWins}</div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-blue-500 hover:opacity-90 active:scale-95 text-white font-black text-base shadow-lg transition-all"
        >
          🎮 Jugar Otra Partida
        </button>
      </div>
    </div>
  );
};
