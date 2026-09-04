export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';

export type CardValue =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw2'
  | 'wild' | 'wild4';

export type CardType = 'number' | 'action' | 'wild';

export interface UnoCard {
  id: number;
  color: CardColor;
  value: CardValue;
  type: CardType;
}

export type PlayerTurn = 'player' | 'ai';

export interface GameStats {
  playerWins: number;
  aiWins: number;
  gamesPlayed: number;
}
