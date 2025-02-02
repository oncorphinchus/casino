export type BetType = {
  type: 'straight' | 'split' | 'street' | 'corner' | 'line' | 'dozen' | 'column' | 'red' | 'black' | 'even' | 'odd' | '1-18' | '19-36';
  numbers: number[];
  payout: number;
  position: string;
}

export type PlacedBet = {
  betType: BetType;
  amount: number;
} 