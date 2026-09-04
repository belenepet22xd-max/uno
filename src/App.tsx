import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CardColor, UnoCard, PlayerTurn, GameStats } from './types';
import {
  createDeck,
  shuffleDeck,
  isCardPlayable,
  getCardLabel,
  COLOR_HEX,
  COLOR_NAMES,
  COLORS,
} from './utils/gameLogic';
import { sounds } from './utils/soundEffects';
import { CardView } from './components/CardView';
import { ColorPickerModal } from './components/ColorPickerModal';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { ExportHtmlModal } from './components/ExportHtmlModal';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  FileCode,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function App() {
  // Estado Principal
  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [aiHand, setAiHand] = useState<UnoCard[]>([]);
  const [currentTurn, setCurrentTurn] = useState<PlayerTurn>('player');
  const [activeColor, setActiveColor] = useState<CardColor>('red');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  // Regla del Botón UNO
  const [unoDeclaredByPlayer, setUnoDeclaredByPlayer] = useState(false);
  const [aiDeclaredUno, setAiDeclaredUno] = useState(false);

  // Mensajes de Evento y Notificaciones
  const [eventMessage, setEventMessage] = useState<string>('¡Bienvenido al juego UNO!');

  // Estadísticas
  const [stats, setStats] = useState<GameStats>({
    playerWins: 0,
    aiWins: 0,
    gamesPlayed: 0,
  });

  // Modales
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Referencias para evitar condiciones de carrera en temporizadores de IA
  const pendingWildCardRef = useRef<UnoCard | null>(null);
  const isAiThinkingRef = useRef(false);

  const topDiscardCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const prevDiscardCard = discardPile.length > 1 ? discardPile[discardPile.length - 2] : null;

  // Alternar Sonido
  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundEnabled(sounds.enabled);
  };

  // Mostrar mensaje de evento
  const notify = (msg: string) => {
    setEventMessage(msg);
  };

  // Inicializar Nueva Partida
  const startNewGame = useCallback(() => {
    sounds.play('click');
    const newDeck = createDeck();
    const pHand: UnoCard[] = [];
    const aHand: UnoCard[] = [];

    // Repartir 7 cartas a cada jugador
    for (let i = 0; i < 7; i++) {
      pHand.push(newDeck.pop()!);
      aHand.push(newDeck.pop()!);
    }

    // Carta inicial de descarte (evitar comodín +4 al inicio)
    let initial = newDeck.pop()!;
    while (initial.value === 'wild4') {
      newDeck.unshift(initial);
      initial = newDeck.pop()!;
    }

    const initialColor: CardColor =
      initial.color === 'wild'
        ? COLORS[Math.floor(Math.random() * COLORS.length)]
        : initial.color;

    setDeck(newDeck);
    setDiscardPile([initial]);
    setPlayerHand(pHand);
    setAiHand(aHand);
    setActiveColor(initialColor);
    setCurrentTurn('player');
    setIsGameOver(false);
    setWinner(null);
    setUnoDeclaredByPlayer(false);
    setAiDeclaredUno(false);
    pendingWildCardRef.current = null;
    isAiThinkingRef.current = false;
    notify('¡Partida iniciada! Es tu turno.');
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Robar cartas seguras del mazo (rebaraja descarte si mazo está vacío)
  const drawCardsFromDeck = (
    count: number,
    currentDeck: UnoCard[],
    currentDiscard: UnoCard[]
  ): { drawnCards: UnoCard[]; remainingDeck: UnoCard[]; remainingDiscard: UnoCard[] } => {
    let d = [...currentDeck];
    let disc = [...currentDiscard];
    const drawn: UnoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (d.length === 0) {
        if (disc.length <= 1) break;
        const top = disc.pop()!;
        d = shuffleDeck(disc);
        disc = [top];
      }
      if (d.length > 0) {
        drawn.push(d.pop()!);
      }
    }

    return { drawnCards: drawn, remainingDeck: d, remainingDiscard: disc };
  };

  // Botón "¡CANTAR UNO!"
  const handleDeclareUno = () => {
    if (isGameOver || currentTurn !== 'player') return;

    if (playerHand.length <= 2) {
      setUnoDeclaredByPlayer(true);
      sounds.play('uno');
      notify('🗣️ ¡Has cantado "¡UNO!" a tiempo!');
    } else {
      notify('⚠️ Solo puedes cantar UNO cuando tengas 2 cartas o menos.');
    }
  };

  // Jugador Humano roba carta
  const handlePlayerDraw = () => {
    if (currentTurn !== 'player' || isGameOver) return;

    sounds.play('draw');
    const { drawnCards, remainingDeck, remainingDiscard } = drawCardsFromDeck(1, deck, discardPile);

    if (drawnCards.length === 0) {
      notify('¡No quedan cartas para robar en el mazo!');
      return;
    }

    const newCard = drawnCards[0];
    const newPlayerHand = [...playerHand, newCard];

    setDeck(remainingDeck);
    setDiscardPile(remainingDiscard);
    setPlayerHand(newPlayerHand);

    // Verificar si la carta robada es jugable
    if (isCardPlayable(newCard, topDiscardCard, activeColor)) {
      notify(`Robaste ${getCardLabel(newCard)}. ¡Puedes jugarla o pasar el turno!`);
    } else {
      notify(`Robaste ${getCardLabel(newCard)}. No es jugable, pasa el turno.`);
      // Pasar turno a la IA tras breve pausa
      setTimeout(() => {
        setCurrentTurn('ai');
      }, 700);
    }
  };

  // Jugador Humano juega una carta
  const handlePlayerPlayCard = (card: UnoCard) => {
    if (currentTurn !== 'player' || isGameOver) return;

    if (!isCardPlayable(card, topDiscardCard, activeColor)) {
      sounds.play('penalty');
      notify('❌ Esa carta no coincide con el color ni número activo.');
      return;
    }

    // Regla de penalización de UNO:
    // Si tenía 2 cartas y juega 1, le queda 1 carta. Si no cantó UNO, penalización de 2 cartas.
    let currentCards = [...playerHand];
    let penaltyApplied = false;

    if (currentCards.length === 2 && !unoDeclaredByPlayer) {
      sounds.play('penalty');
      notify('⚠️ ¡No cantaste UNO a tiempo! Penalización: Robas 2 cartas.');
      const { drawnCards, remainingDeck, remainingDiscard } = drawCardsFromDeck(2, deck, discardPile);
      currentCards = [...currentCards, ...drawnCards];
      setDeck(remainingDeck);
      setDiscardPile(remainingDiscard);
      penaltyApplied = true;
    }

    // Remover la carta jugada
    const cardIndex = currentCards.findIndex((c) => c.id === card.id);
    if (cardIndex === -1) return;
    currentCards.splice(cardIndex, 1);
    setPlayerHand(currentCards);

    // Colocar en pozo de descarte
    const newDiscard = [...discardPile, card];
    setDiscardPile(newDiscard);
    setUnoDeclaredByPlayer(false); // Resetear estado

    // Verificar si ganó de inmediato
    if (currentCards.length === 0) {
      handleGameOver('player');
      return;
    }

    // Si es comodín, abrir modal de selección de color
    if (card.color === 'wild') {
      sounds.play('special');
      pendingWildCardRef.current = card;
      setIsColorModalOpen(true);
      return;
    }

    // Carta normal o de acción
    setActiveColor(card.color);
    applyCardEffects(card, 'player', currentCards, aiHand, newDiscard, deck);
  };

  // Selección de color para Comodín por el Jugador
  const handleColorSelect = (selectedColor: CardColor) => {
    setIsColorModalOpen(false);
    setActiveColor(selectedColor);
    sounds.play('click');
    notify(`Elegiste color: ${COLOR_NAMES[selectedColor]}`);

    const card = pendingWildCardRef.current || topDiscardCard;
    if (card) {
      applyCardEffects(card, 'player', playerHand, aiHand, discardPile, deck, selectedColor);
    }
    pendingWildCardRef.current = null;
  };

  // Aplicar efectos de cartas especiales (Salto, Reversa, +2, Comodín +4)
  const applyCardEffects = (
    card: UnoCard,
    whoPlayed: PlayerTurn,
    currentPlayerHand: UnoCard[],
    currentAiHand: UnoCard[],
    currentDiscard: UnoCard[],
    currentDeck: UnoCard[],
    _chosenColor?: CardColor
  ) => {
    const isPlayer = whoPlayed === 'player';
    let nextTurn: PlayerTurn = isPlayer ? 'ai' : 'player';
    let updatedPlayerHand = [...currentPlayerHand];
    let updatedAiHand = [...currentAiHand];
    let updatedDeck = [...currentDeck];
    let updatedDiscard = [...currentDiscard];

    if (card.value === 'skip') {
      sounds.play('special');
      notify(isPlayer ? '🚫 ¡Saltaste el turno de la IA!' : '🚫 ¡La IA te saltó el turno!');
      nextTurn = whoPlayed; // El oponente pierde su turno
    } else if (card.value === 'reverse') {
      sounds.play('special');
      notify(isPlayer ? '⇄ ¡Reversa en 1v1! Vuelves a tener el turno.' : '⇄ ¡Reversa de la IA! Vuelve a tirar la IA.');
      nextTurn = whoPlayed; // En 1v1, reversa actúa igual a un salto
    } else if (card.value === 'draw2') {
      sounds.play('special');
      notify(isPlayer ? '🔥 ¡La IA roba 2 cartas y pierde su turno!' : '💥 ¡Robas 2 cartas y pierdes tu turno!');
      const { drawnCards, remainingDeck, remainingDiscard } = drawCardsFromDeck(2, updatedDeck, updatedDiscard);
      updatedDeck = remainingDeck;
      updatedDiscard = remainingDiscard;

      if (isPlayer) {
        updatedAiHand = [...updatedAiHand, ...drawnCards];
      } else {
        updatedPlayerHand = [...updatedPlayerHand, ...drawnCards];
      }
      nextTurn = whoPlayed; // El castigado pierde su turno
    } else if (card.value === 'wild4') {
      sounds.play('special');
      notify(isPlayer ? '⚡ ¡Comodín +4! La IA roba 4 cartas y pierde turno.' : '⚡ ¡Comodín +4 de la IA! Robas 4 cartas y pierdes turno.');
      const { drawnCards, remainingDeck, remainingDiscard } = drawCardsFromDeck(4, updatedDeck, updatedDiscard);
      updatedDeck = remainingDeck;
      updatedDiscard = remainingDiscard;

      if (isPlayer) {
        updatedAiHand = [...updatedAiHand, ...drawnCards];
      } else {
        updatedPlayerHand = [...updatedPlayerHand, ...drawnCards];
      }
      nextTurn = whoPlayed;
    } else {
      sounds.play(card.type === 'action' ? 'special' : 'card');
    }

    setDeck(updatedDeck);
    setDiscardPile(updatedDiscard);
    setPlayerHand(updatedPlayerHand);
    setAiHand(updatedAiHand);
    setCurrentTurn(nextTurn);
  };

  // Turno de la Inteligencia Artificial
  useEffect(() => {
    if (currentTurn !== 'ai' || isGameOver || isAiThinkingRef.current) return;

    isAiThinkingRef.current = true;
    notify('🤖 La Computadora está pensando su jugada...');

    const timer = setTimeout(() => {
      executeAiTurn();
      isAiThinkingRef.current = false;
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentTurn, isGameOver]);

  const executeAiTurn = () => {
    // Si la IA tiene 2 cartas, canta UNO automáticamente antes de jugar
    if (aiHand.length === 2) {
      setAiDeclaredUno(true);
      sounds.play('uno');
      notify('🤖 ¡La IA cantó: "¡UNO!"!');
    }

    // Filtrar cartas jugables para la IA
    const playableCards = aiHand.filter((c) => isCardPlayable(c, topDiscardCard, activeColor));

    if (playableCards.length > 0) {
      // Estrategia de IA:
      // 1. Usa +2 o Salto si tiene
      // 2. Si no, juega números
      // 3. Guarda comodines a menos que sea la única opción
      let chosenCard = playableCards.find((c) => c.value === 'draw2' || c.value === 'skip' || c.value === 'reverse');
      if (!chosenCard) {
        chosenCard = playableCards.find((c) => c.type === 'number');
      }
      if (!chosenCard) {
        chosenCard = playableCards[0];
      }

      // Remover de mano de IA
      const newAiHand = aiHand.filter((c) => c.id !== chosenCard!.id);
      const newDiscard = [...discardPile, chosenCard];
      setAiHand(newAiHand);
      setDiscardPile(newDiscard);

      // Comprobar si la IA ganó
      if (newAiHand.length === 0) {
        handleGameOver('ai');
        return;
      }

      // Determinar color si jugó comodín
      if (chosenCard.color === 'wild') {
        // Escoger el color que más tenga en mano
        const counts: Record<CardColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, wild: 0 };
        newAiHand.forEach((c) => {
          if (c.color !== 'wild') counts[c.color]++;
        });
        let bestColor: CardColor = 'red';
        let max = -1;
        COLORS.forEach((col) => {
          if (counts[col] > max) {
            max = counts[col];
            bestColor = col;
          }
        });

        setActiveColor(bestColor);
        notify(`🤖 La IA jugó un Comodín y eligió: ${COLOR_NAMES[bestColor]}`);
        sounds.play('special');
        applyCardEffects(chosenCard, 'ai', playerHand, newAiHand, newDiscard, deck, bestColor);
      } else {
        setActiveColor(chosenCard.color);
        notify(`🤖 La IA jugó: ${getCardLabel(chosenCard)}`);
        applyCardEffects(chosenCard, 'ai', playerHand, newAiHand, newDiscard, deck);
      }
    } else {
      // La IA debe robar una carta
      notify('🤖 La IA no tiene cartas jugables y roba una carta...');
      const { drawnCards, remainingDeck, remainingDiscard } = drawCardsFromDeck(1, deck, discardPile);
      sounds.play('draw');

      if (drawnCards.length > 0) {
        const drawnCard = drawnCards[0];
        const newAiHand = [...aiHand, drawnCard];

        setDeck(remainingDeck);
        setDiscardPile(remainingDiscard);
        setAiHand(newAiHand);

        // Si la carta robada se puede jugar, la IA la juega de inmediato
        if (isCardPlayable(drawnCard, topDiscardCard, activeColor)) {
          setTimeout(() => {
            const playedHand = newAiHand.filter((c) => c.id !== drawnCard.id);
            const disc = [...remainingDiscard, drawnCard];
            setAiHand(playedHand);
            setDiscardPile(disc);

            if (drawnCard.color === 'wild') {
              const randColor = COLORS[Math.floor(Math.random() * COLORS.length)];
              setActiveColor(randColor);
              notify(`🤖 La IA jugó la carta robada y eligió: ${COLOR_NAMES[randColor]}`);
            } else {
              setActiveColor(drawnCard.color);
              notify(`🤖 La IA jugó la carta recién robada: ${getCardLabel(drawnCard)}`);
            }
            sounds.play('card');
            applyCardEffects(drawnCard, 'ai', playerHand, playedHand, disc, remainingDeck);
          }, 800);
          return;
        }
      }

      // Si no pudo jugar, pasa el turno al jugador
      setTimeout(() => {
        setCurrentTurn('player');
        notify('Tu turno. Elige una carta para jugar o roba del mazo.');
      }, 700);
    }
  };

  // Fin de Partida
  const handleGameOver = (winnerPlayer: 'player' | 'ai') => {
    setIsGameOver(true);
    setWinner(winnerPlayer);
    setStats((prev) => ({
      ...prev,
      playerWins: winnerPlayer === 'player' ? prev.playerWins + 1 : prev.playerWins,
      aiWins: winnerPlayer === 'ai' ? prev.aiWins + 1 : prev.aiWins,
      gamesPlayed: prev.gamesPlayed + 1,
    }));

    if (winnerPlayer === 'player') {
      sounds.play('win');
      notify('🎉 ¡Felicidades! ¡Has ganado la partida de UNO!');
    } else {
      sounds.play('penalty');
      notify('🤖 La Computadora se quedó sin cartas primero.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between overflow-x-hidden select-none relative">
      {/* Barra de Navegación Superior */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo Clásico UNO */}
          <div className="bg-gradient-to-br from-[#ef4444] via-[#eab308] to-[#ef4444] px-3.5 py-1 rounded-full border-2 border-white shadow-lg -rotate-3 text-white font-black italic tracking-tighter text-xl sm:text-2xl drop-shadow">
            UNO
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-300">
            <span>Tú: <strong className="text-[#22c55e]">{stats.playerWins}</strong></span>
            <span className="text-slate-600">•</span>
            <span>IA: <strong className="text-[#eab308]">{stats.aiWins}</strong></span>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar Sonido' : 'Activar Sonido'}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#22c55e]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setIsRulesModalOpen(true)}
            title="Ver Reglas del Juego"
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#eab308]" />
            <span className="hidden sm:inline">Reglas</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            title="Ver / Copiar código index.html autónomo"
            className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archivo Único</span> HTML
          </button>

          <button
            onClick={startNewGame}
            title="Reiniciar partida"
            className="px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva Partida</span>
          </button>
        </div>
      </header>

      {/* Tablero de Juego Principal */}
      <main className="flex-1 flex flex-col justify-between items-center p-3 sm:p-6 max-w-5xl w-full mx-auto relative gap-4">

        {/* ZONA 1: INTELIGENCIA ARTIFICIAL (IA) */}
        <section className="w-full flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-800/60 px-6 py-2 rounded-full border border-slate-700 shadow-sm">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center border-2 border-slate-500 shadow-inner">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Inteligencia Artificial</p>
              <p className="text-xs text-slate-400">{aiHand.length} cartas restantes</p>
            </div>
            {aiHand.length === 1 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#ef4444] border-2 border-white text-white font-black text-xs italic animate-bounce shadow-md">
                ¡UNO!
              </span>
            )}
          </div>

          {/* Cartas de la IA boca abajo */}
          <div className="flex justify-center items-center overflow-x-auto max-w-full px-4 py-1 min-h-[95px] sm:min-h-[125px]">
            <div className="flex items-center -space-x-10 sm:-space-x-12">
              {aiHand.map((_, index) => (
                <div key={index} className="transform hover:-translate-y-2 transition-transform">
                  <CardView isBack size="sm" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interaction Toast (Notificación de Evento Dinámico al estilo Vibrant Palette) */}
        {eventMessage && (
          <div className="bg-white text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-200 transition-all max-w-md w-full sm:w-auto">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-bold text-xs sm:text-sm leading-none text-slate-900">
                {currentTurn === 'player' ? 'Turno del Jugador' : 'Turno de la IA'}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-700 mt-0.5 leading-snug">{eventMessage}</p>
            </div>
          </div>
        )}

        {/* ZONA 2: MESA CENTRAL (MAZO, POZO, ESTADO Y ACCIONES) */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 w-full relative my-1 sm:my-2 px-4">
          {/* Status Info Left */}
          <div className="flex flex-row md:flex-col items-center md:items-start gap-4 shrink-0">
            <div
              id="turn-indicator"
              className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all ${
                currentTurn === 'player'
                  ? 'bg-[#22c55e] text-black animate-pulse'
                  : 'bg-slate-800 text-amber-400 border border-slate-700'
              }`}
            >
              {currentTurn === 'player' ? 'TU TURNO' : 'TURNO IA...'}
            </div>

            <div className="flex items-center gap-2.5 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700">
              <div
                className="w-4 h-4 rounded-full transition-all shadow-[0_0_10px_currentColor]"
                style={{
                  backgroundColor: COLOR_HEX[activeColor],
                  color: COLOR_HEX[activeColor],
                }}
              />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none">
                  Color Activo
                </span>
                <span className="text-xs font-bold text-white capitalize leading-tight">
                  {COLOR_NAMES[activeColor]}
                </span>
              </div>
            </div>
          </div>

          {/* Piles Center (Mazo y Descartes) */}
          <div className="flex items-center justify-center gap-12 sm:gap-16">
            {/* Draw Pile (Mazo) */}
            <div
              onClick={handlePlayerDraw}
              className="relative w-20 sm:w-24 h-30 sm:h-36 cursor-pointer group flex flex-col items-center"
              title="Haz clic para robar una carta"
            >
              <div className="absolute top-0 left-0 shadow-lg translate-y-1 translate-x-1 pointer-events-none">
                <CardView isBack size="md" />
              </div>
              <div className="absolute top-0 left-0 shadow-lg translate-y-0.5 translate-x-0.5 pointer-events-none">
                <CardView isBack size="md" />
              </div>
              <div className="absolute top-0 left-0 shadow-lg group-active:translate-y-1 transition-transform">
                <CardView isBack size="md" />
              </div>
              <p className="absolute -bottom-7 left-0 right-0 text-center text-xs font-bold text-slate-400 tracking-wider uppercase">
                MAZO ({deck.length})
              </p>
            </div>

            {/* Discard Pile (Descartes) */}
            <div className="relative w-20 sm:w-24 h-30 sm:h-36 flex flex-col items-center">
              {prevDiscardCard && (
                <div className="transform rotate-6 absolute top-0 left-0 opacity-40 pointer-events-none">
                  <CardView card={prevDiscardCard} size="md" />
                </div>
              )}
              {topDiscardCard ? (
                <div id="current-card" className="transform -rotate-3 absolute top-0 left-0 shadow-2xl">
                  <CardView card={topDiscardCard} size="md" />
                </div>
              ) : (
                <div className="w-20 sm:w-24 h-30 sm:h-36 rounded-[10px] border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold">
                  Vacío
                </div>
              )}
              <p className="absolute -bottom-7 left-0 right-0 text-center text-xs font-bold text-slate-400 tracking-wider uppercase">
                DESCARTES
              </p>
            </div>
          </div>

          {/* Actions Right (Botón UNO circular prominente + Robar) */}
          <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <button
                id="uno-button"
                onClick={handleDeclareUno}
                title="Presiona con 1 carta para no recibir penalización"
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center font-black text-xl sm:text-2xl hover:scale-105 active:scale-95 transition-all text-white outline-none cursor-pointer ${
                  unoDeclaredByPlayer
                    ? 'bg-[#22c55e] border-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.7)]'
                    : playerHand.length === 2
                    ? 'bg-[#ef4444] border-red-300 shadow-[0_0_25px_rgba(239,68,68,0.9)] animate-pulse'
                    : 'bg-[#ef4444] border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                }`}
              >
                UNO
              </button>
              <p className="text-[10px] text-center text-slate-400 w-20 uppercase font-bold tracking-tighter">
                {unoDeclaredByPlayer ? '¡CANTADO!' : 'Presiona con 1 carta'}
              </p>
            </div>

            <button
              onClick={handlePlayerDraw}
              disabled={currentTurn !== 'player' || isGameOver}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
            >
              Robar (+1)
            </button>
          </div>
        </section>

        {/* ZONA 3: MANO DEL JUGADOR HUMANO */}
        <section className="w-full flex flex-col items-center gap-4">
          {/* Advertencia si no cantó UNO con 2 cartas */}
          {playerHand.length === 2 && !unoDeclaredByPlayer && (
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-4 py-1.5 rounded-full animate-bounce shadow-md">
              <AlertTriangle className="w-4 h-4 text-[#eab308]" />
              <span>¡Atención! Presiona el botón "UNO" antes de tirar tu penúltima carta.</span>
            </div>
          )}

          {/* Fila de Cartas en Mano del Jugador */}
          <div id="player-hand" className="w-full flex justify-center items-center overflow-x-auto max-w-full px-4 py-2 min-h-[140px] sm:min-h-[170px]">
            <div className="flex items-center -space-x-8 sm:-space-x-12 py-3">
              {playerHand.map((card) => {
                const playable = currentTurn === 'player' && isCardPlayable(card, topDiscardCard, activeColor);
                return (
                  <div
                    key={card.id}
                    className="hover:-translate-y-6 transition-transform z-0 hover:z-50"
                  >
                    <CardView
                      card={card}
                      isPlayable={playable}
                      onClick={() => handlePlayerPlayCard(card)}
                      size="md"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barra Inferior TU MANO al estilo Vibrant Palette */}
          <div className="flex items-center gap-4 bg-blue-600/20 px-8 py-3 rounded-t-3xl border-t border-x border-blue-500/30">
            <div className="w-3 h-3 bg-[#3b82f6] rounded-full animate-pulse" />
            <span className="font-bold tracking-widest text-xs sm:text-sm text-blue-100 uppercase">TU MANO</span>
            <span className="bg-[#3b82f6] text-white text-xs px-2.5 py-0.5 rounded font-bold">
              {playerHand.length} {playerHand.length === 1 ? 'CARTA' : 'CARTAS'}
            </span>
          </div>
        </section>

      </main>

      {/* Pie Informativo */}
      <footer className="py-2.5 px-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-900/90 shrink-0">
        Juego de Cartas UNO • Tema Vibrant Palette • 108 cartas estándar, Inteligencia Artificial y reglas completas.
      </footer>

      {/* Modales */}
      <ColorPickerModal
        isOpen={isColorModalOpen}
        onSelectColor={handleColorSelect}
      />

      <GameOverModal
        isOpen={isGameOver}
        winner={winner}
        stats={stats}
        onRestart={startNewGame}
      />

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <ExportHtmlModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
