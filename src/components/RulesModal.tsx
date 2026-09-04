import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">Reglas Oficiales de UNO (1v1)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
            <h4 className="font-bold text-white mb-1 flex items-center gap-2">
              🎯 Objetivo del Juego
            </h4>
            <p>
              Sé el primer jugador en deshacerte de todas tus cartas en la mano.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white">🃏 Flujo de Turno</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Solo puedes jugar una carta si coincide en <strong className="text-amber-400">Color</strong> o en <strong className="text-amber-400">Número/Símbolo</strong> con la carta en la cima del descarte.
              </li>
              <li>
                Los <strong className="text-purple-400">Comodines</strong> se pueden jugar en cualquier momento, independientemente del color o número.
              </li>
              <li>
                Si no tienes ninguna carta válida para jugar, debes <strong className="text-blue-400">Robar 1 carta</strong> del mazo. Si la carta robada es jugable, puedes jugarla de inmediato o pasar el turno.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white">⚡ Cartas Especiales y Efectos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="font-bold text-red-400">⊘ Salto:</span> Hace que el oponente pierda su turno de inmediato.
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="font-bold text-blue-400">⇄ Reversa:</span> En modalidad 1 contra 1, actúa igual que un Salto.
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="font-bold text-emerald-400">+2 Toma 2:</span> El oponente roba 2 cartas y pierde su turno.
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="font-bold text-yellow-400">★ Comodín Cambio Color:</span> Te permite escoger el nuevo color activo.
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50 col-span-1 sm:col-span-2">
                <span className="font-bold text-purple-400">+4 Comodín +4:</span> Escoges el nuevo color, el oponente roba 4 cartas y pierde su turno.
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30">
            <h4 className="font-bold text-amber-400 mb-1">
              📢 Regla de "¡CANTAR UNO!"
            </h4>
            <p className="text-xs">
              Cuando te queden 2 cartas y vayas a jugar una, debes presionar el botón <strong className="text-white">"¡CANTAR UNO!"</strong> antes o durante tu jugada. Si juegas tu penúltima carta sin haber cantado UNO, recibirás una <strong className="text-red-400">penalización de 2 cartas</strong> de robo.
            </p>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
