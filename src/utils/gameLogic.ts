import { CardColor, UnoCard } from '../types';

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

export const COLOR_NAMES: Record<CardColor, string> = {
  red: 'Rojo',
  blue: 'Azul',
  green: 'Verde',
  yellow: 'Amarillo',
  wild: 'Comodín',
};

export const COLOR_HEX: Record<CardColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  wild: '#8b5cf6',
};

export function createDeck(): UnoCard[] {
  const cards: UnoCard[] = [];
  let cardId = 0;

  // 4 Colores
  COLORS.forEach((color) => {
    // 1 carta '0' por color
    cards.push({ id: ++cardId, color, value: '0', type: 'number' });

    // 2 cartas del '1' al '9' por color
    for (let i = 1; i <= 9; i++) {
      cards.push({ id: ++cardId, color, value: i.toString() as any, type: 'number' });
      cards.push({ id: ++cardId, color, value: i.toString() as any, type: 'number' });
    }

    // 2 Salto, 2 Reversa, 2 Toma +2 por color
    for (let i = 0; i < 2; i++) {
      cards.push({ id: ++cardId, color, value: 'skip', type: 'action' });
      cards.push({ id: ++cardId, color, value: 'reverse', type: 'action' });
      cards.push({ id: ++cardId, color, value: 'draw2', type: 'action' });
    }
  });

  // 4 Comodines Cambio de Color y 4 Comodines +4
  for (let i = 0; i < 4; i++) {
    cards.push({ id: ++cardId, color: 'wild', value: 'wild', type: 'wild' });
    cards.push({ id: ++cardId, color: 'wild', value: 'wild4', type: 'wild' });
  }

  return shuffleDeck(cards);
}

export function shuffleDeck(deck: UnoCard[]): UnoCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isCardPlayable(card: UnoCard, topCard: UnoCard | null, activeColor: CardColor): boolean {
  if (!topCard) return true;
  // Comodín siempre se puede jugar
  if (card.color === 'wild') return true;
  // Coincide el color activo
  if (card.color === activeColor) return true;
  // Coincide el valor/número/símbolo
  if (card.value === topCard.value) return true;
  return false;
}

export function getCardSymbol(value: string): string {
  switch (value) {
    case 'skip': return '⊘';
    case 'reverse': return '⇄';
    case 'draw2': return '+2';
    case 'wild': return '★';
    case 'wild4': return '+4';
    default: return value;
  }
}

export function getCardLabel(card: UnoCard): string {
  const colorName = COLOR_NAMES[card.color];
  const sym = getCardSymbol(card.value);
  if (card.value === 'wild') return 'Comodín Cambio Color';
  if (card.value === 'wild4') return 'Comodín +4';
  if (card.value === 'skip') return `${colorName} Salto`;
  if (card.value === 'reverse') return `${colorName} Reversa`;
  if (card.value === 'draw2') return `${colorName} +2`;
  return `${colorName} ${card.value}`;
}
