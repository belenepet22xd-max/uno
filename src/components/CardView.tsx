import React from 'react';
import { UnoCard } from '../types';
import { getCardSymbol } from '../utils/gameLogic';

interface CardViewProps {
  card?: UnoCard;
  isBack?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isBack = false,
  isPlayable = false,
  onClick,
  className = '',
  size = 'md',
}) => {
  // Dimensiones según tamaño
  const sizeClasses = {
    sm: 'w-16 h-24 sm:w-20 sm:h-28 text-xs',
    md: 'w-20 h-30 sm:w-24 sm:h-36 text-sm',
    lg: 'w-24 h-36 sm:w-28 sm:h-42 text-base',
  }[size];

  if (isBack || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative rounded-[10px] border-[3px] sm:border-4 border-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] flex items-center justify-center bg-gradient-to-br from-[#ef4444] to-[#3b82f6] select-none transition-all duration-200 shrink-0 cursor-pointer overflow-hidden ${sizeClasses} ${className}`}
      >
        {/* Sheen translúcido característico */}
        <div className="absolute w-[85%] h-[60%] rounded-[50%] bg-white/20 -rotate-[30deg] pointer-events-none" />

        {/* Logo central ovalado amarillo */}
        <div className="w-12 h-7 sm:w-14 sm:h-8 rounded-[50%] bg-[#eab308] border-2 border-white flex items-center justify-center -rotate-[15deg] shadow-md z-10">
          <span className="font-black italic text-black text-xs sm:text-sm tracking-tight">
            UNO
          </span>
        </div>
      </div>
    );
  }

  const symbol = getCardSymbol(card.value);

  // Colores directos del tema Vibrant Palette
  const bgStyles: Record<string, string> = {
    red: 'bg-[#ef4444]',
    blue: 'bg-[#3b82f6]',
    green: 'bg-[#22c55e]',
    yellow: 'bg-[#eab308]',
    wild: 'bg-[#1a1a1a]',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-[10px] border-[3px] sm:border-4 border-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] flex flex-col justify-between p-1.5 sm:p-2 select-none shrink-0 transition-all duration-200 cursor-pointer overflow-hidden ${sizeClasses} ${bgStyles[card.color]} ${
        isPlayable
          ? 'ring-4 ring-yellow-300 -translate-y-2 hover:-translate-y-5 hover:scale-105 hover:z-40 shadow-[0_0_20px_rgba(234,179,8,0.7)]'
          : 'opacity-90 hover:-translate-y-1'
      } ${className}`}
    >
      {/* Sheen translúcido ovalado inclinado del tema Vibrant Palette */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[85%] h-[60%] rounded-[50%] bg-white/25 -rotate-[30deg]" />
      </div>

      {/* Esquina Superior Izquierda */}
      <div className="font-black italic text-white text-xs sm:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] leading-none z-10">
        {symbol}
      </div>

      {/* Centro */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {card.color === 'wild' ? (
          <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-white overflow-hidden flex flex-wrap shadow-lg">
            <div className="w-1/2 h-1/2 bg-[#ef4444]" />
            <div className="w-1/2 h-1/2 bg-[#3b82f6]" />
            <div className="w-1/2 h-1/2 bg-[#eab308]" />
            <div className="w-1/2 h-1/2 bg-[#22c55e]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-black italic text-white text-xs sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {symbol}
              </span>
            </div>
          </div>
        ) : (
          <span className="font-black italic text-white text-3xl sm:text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {symbol}
          </span>
        )}
      </div>

      {/* Esquina Inferior Derecha (Invertida) */}
      <div className="font-black italic text-white text-xs sm:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] leading-none self-end rotate-180 z-10">
        {symbol}
      </div>
    </div>
  );
};
