import React from 'react';
import { CardColor } from '../types';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: CardColor) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onSelectColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border-2 border-slate-600 flex flex-col items-center gap-6 max-w-sm w-full shadow-2xl text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">
            Elige un Color
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Has jugado un comodín. Selecciona el color para continuar:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSelectColor('red')}
            className="w-24 h-24 sm:w-28 sm:h-28 bg-[#ef4444] rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform border-4 border-transparent hover:border-white shadow-lg flex flex-col items-center justify-center text-white font-black tracking-wider uppercase"
          >
            <span>Rojo</span>
          </button>
          <button
            onClick={() => onSelectColor('blue')}
            className="w-24 h-24 sm:w-28 sm:h-28 bg-[#3b82f6] rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform border-4 border-transparent hover:border-white shadow-lg flex flex-col items-center justify-center text-white font-black tracking-wider uppercase"
          >
            <span>Azul</span>
          </button>
          <button
            onClick={() => onSelectColor('green')}
            className="w-24 h-24 sm:w-28 sm:h-28 bg-[#22c55e] rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform border-4 border-transparent hover:border-white shadow-lg flex flex-col items-center justify-center text-white font-black tracking-wider uppercase"
          >
            <span>Verde</span>
          </button>
          <button
            onClick={() => onSelectColor('yellow')}
            className="w-24 h-24 sm:w-28 sm:h-28 bg-[#eab308] rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform border-4 border-transparent hover:border-white shadow-lg flex flex-col items-center justify-center text-white font-black tracking-wider uppercase"
          >
            <span>Amarillo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
