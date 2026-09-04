import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode } from 'lucide-react';

interface ExportHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHtmlModal: React.FC<ExportHtmlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      setLoading(true);
      const res = await fetch('/standalone-uno.html');
      const htmlText = await res.text();
      await navigator.clipboard.writeText(htmlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Por favor descarga el archivo directamente con el botón Descargar index.html.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const res = await fetch('/standalone-uno.html');
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open('/standalone-uno.html', '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-black text-white">
              Archivo index.html Autónomo (100% Sin Dependencias)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
            <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-2">
              ✅ Código Completo en 1 Solo Archivo
            </h4>
            <p className="text-xs text-slate-300">
              Contiene toda la estructura HTML, estilos CSS embebidos en <code>&lt;style&gt;</code> y el motor completo del juego con IA y efectos en <code>&lt;script&gt;</code>. Listo para guardar como <code>index.html</code> y hacer doble clic para jugar en cualquier computadora o navegador, ¡incluso sin conexión a internet!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopyCode}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-slate-600/60 shadow transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código HTML</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar index.html</span>
            </button>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 overflow-x-auto space-y-1">
            <div className="text-slate-500">// Estructura del archivo autónomo generado:</div>
            <div>&lt;!DOCTYPE html&gt;</div>
            <div>&lt;html lang="es"&gt;</div>
            <div>&nbsp;&nbsp;&lt;head&gt;</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;style&gt; /* Reglas visuales, cartas UNO y animaciones */ &lt;/style&gt;</div>
            <div>&nbsp;&nbsp;&lt;/head&gt;</div>
            <div>&nbsp;&nbsp;&lt;body&gt;</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;!-- Tablero, manos, pozo de descarte y mazo --&gt;</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;script&gt; /* Motor de 108 cartas, IA, cartas especiales y botón UNO */ &lt;/script&gt;</div>
            <div>&nbsp;&nbsp;&lt;/body&gt;</div>
            <div>&lt;/html&gt;</div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
