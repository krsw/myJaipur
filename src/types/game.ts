export type GoodsType = 'diamonds' | 'gold' | 'silver' | 'cloth' | 'spice' | 'leather';

export type BonusType = 'bonus3' | 'bonus4' | 'bonus5';

export type PlayerId = 'player1' | 'player2';

export interface PlayerState {
  id: PlayerId;
  name: string;
  goodsTokens: Record<GoodsType, number[]>; // Array of token values acquired
  bonusTokens: Record<BonusType, number[]>; // Array of bonus token values acquired
  camelCount: number;
  sealsOfExcellence: number;
  score: number;
}

export interface GameState {
  goodsStocks: Record<GoodsType, number[]>; // Remaining stacks (top values first)
  bonusStocks: Record<BonusType, number[]>; // Hidden piles (shuffled)
  currentTurn: PlayerId;
  camelOwner: PlayerId | 'tie' | null;
  player1: PlayerState;
  player2: PlayerState;
  roundOver: boolean;
  manualRoundEnded: boolean;
  roundWinner: PlayerId | 'tie' | null;
  gameWinner: PlayerId | null;
  history: string[];
}
