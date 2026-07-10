import { useState, useCallback } from 'react';
import type { GameState, GoodsType, PlayerId, BonusType, PlayerState } from '../types/game';

// Official Jaipur goods token configurations (descending order of values)
const INITIAL_GOODS: Record<GoodsType, number[]> = {
  diamonds: [7, 7, 5, 5, 5],
  gold: [6, 6, 5, 5, 5],
  silver: [5, 5, 5, 5, 5],
  cloth: [5, 3, 3, 2, 2, 1, 1],
  spice: [5, 3, 3, 2, 2, 1, 1],
  leather: [4, 3, 2, 1, 1, 1, 1, 1, 1],
};

// Official Jaipur bonus token pools
const BONUS_POOLS: Record<BonusType, number[]> = {
  bonus3: [3, 3, 2, 2, 2, 1, 1], // 7 tokens: values 1-3
  bonus4: [6, 6, 5, 5, 4, 4],    // 6 tokens: values 4-6
  bonus5: [10, 10, 9, 8, 8],     // 5 tokens: values 8-10
};

// Utility to shuffle an array
const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const createInitialPlayer = (id: PlayerId, name: string): PlayerState => ({
  id,
  name,
  goodsTokens: {
    diamonds: [],
    gold: [],
    silver: [],
    cloth: [],
    spice: [],
    leather: [],
  },
  bonusTokens: {
    bonus3: [],
    bonus4: [],
    bonus5: [],
  },
  camelCount: 0,
  sealsOfExcellence: 0,
  score: 0,
});

const calculatePlayerScore = (player: PlayerState, hasCamelBonus: boolean): number => {
  let goodsSum = 0;
  Object.values(player.goodsTokens).forEach((tokens) => {
    goodsSum += tokens.reduce((sum, val) => sum + val, 0);
  });

  let bonusSum = 0;
  Object.values(player.bonusTokens).forEach((tokens) => {
    bonusSum += tokens.reduce((sum, val) => sum + val, 0);
  });

  const camelBonus = hasCamelBonus ? 5 : 0;

  return goodsSum + bonusSum + camelBonus;
};

// Count total tokens for tiebreaker checks
const countTokens = (player: PlayerState) => {
  const totalGoods = Object.values(player.goodsTokens).reduce((sum, arr) => sum + arr.length, 0);
  const totalBonuses = Object.values(player.bonusTokens).reduce((sum, arr) => sum + arr.length, 0);
  return { totalGoods, totalBonuses };
};

export const useJaipur = () => {
  const getInitialState = (): GameState => ({
    goodsStocks: {
      diamonds: [...INITIAL_GOODS.diamonds],
      gold: [...INITIAL_GOODS.gold],
      silver: [...INITIAL_GOODS.silver],
      cloth: [...INITIAL_GOODS.cloth],
      spice: [...INITIAL_GOODS.spice],
      leather: [...INITIAL_GOODS.leather],
    },
    bonusStocks: {
      bonus3: shuffle(BONUS_POOLS.bonus3),
      bonus4: shuffle(BONUS_POOLS.bonus4),
      bonus5: shuffle(BONUS_POOLS.bonus5),
    },
    currentTurn: 'player1',
    camelOwner: null,
    player1: createInitialPlayer('player1', 'プレイヤー 1'),
    player2: createInitialPlayer('player2', 'プレイヤー 2'),
    roundOver: false,
    manualRoundEnded: false,
    roundWinner: null,
    gameWinner: null,
    history: ['ゲームが開始されました。'],
  });

  const [state, setState] = useState<GameState>(getInitialState);

  // Recalculates scores based on current state (used internally during state updates)
  const computeScoresAndWinner = useCallback((currentState: GameState, isEndRound = false): GameState => {
    const updatedState = { ...currentState };
    
    // Determine camel bonus owner
    let camelOwner: PlayerId | 'tie' | null = null;
    if (updatedState.player1.camelCount > updatedState.player2.camelCount) {
      camelOwner = 'player1';
    } else if (updatedState.player2.camelCount > updatedState.player1.camelCount) {
      camelOwner = 'player2';
    } else if (updatedState.player1.camelCount > 0) {
      camelOwner = 'tie'; // Same amount of camels, no bonus awarded per official rules
    }

    updatedState.camelOwner = camelOwner;

    // Calculate score
    updatedState.player1.score = calculatePlayerScore(updatedState.player1, camelOwner === 'player1');
    updatedState.player2.score = calculatePlayerScore(updatedState.player2, camelOwner === 'player2');

    if (isEndRound) {
      updatedState.roundOver = true;
      
      const p1 = updatedState.player1;
      const p2 = updatedState.player2;
      
      const p1Stats = countTokens(p1);
      const p2Stats = countTokens(p2);

      let roundWinner: PlayerId | 'tie' | null = null;

      if (p1.score > p2.score) {
        roundWinner = 'player1';
      } else if (p2.score > p1.score) {
        roundWinner = 'player2';
      } else {
        // TIEBREAKER 1: Most bonus tokens
        if (p1Stats.totalBonuses > p2Stats.totalBonuses) {
          roundWinner = 'player1';
        } else if (p2Stats.totalBonuses > p1Stats.totalBonuses) {
          roundWinner = 'player2';
        } else {
          // TIEBREAKER 2: Most goods tokens
          if (p1Stats.totalGoods > p2Stats.totalGoods) {
            roundWinner = 'player1';
          } else if (p2Stats.totalGoods > p1Stats.totalGoods) {
            roundWinner = 'player2';
          } else {
            roundWinner = 'tie';
          }
        }
      }

      updatedState.roundWinner = roundWinner;

      // Award Seal of Excellence if there is a distinct winner
      if (roundWinner === 'player1') {
        updatedState.player1.sealsOfExcellence += 1;
        updatedState.history.unshift(`ラウンド終了：プレイヤー 1 が勝利しました！（得点: ${p1.score} vs ${p2.score}）`);
      } else if (roundWinner === 'player2') {
        updatedState.player2.sealsOfExcellence += 1;
        updatedState.history.unshift(`ラウンド終了：プレイヤー 2 が勝利しました！（得点: ${p2.score} vs ${p1.score}）`);
      } else {
        updatedState.history.unshift(`ラウンド終了：引き分けとなりました。（得点: ${p1.score} vs ${p2.score}）`);
      }

      // Check Game Winner (first to 2 Seals of Excellence)
      if (updatedState.player1.sealsOfExcellence >= 2) {
        updatedState.gameWinner = 'player1';
        updatedState.history.unshift(`ゲーム終了！プレイヤー 1 の総合勝利です！`);
      } else if (updatedState.player2.sealsOfExcellence >= 2) {
        updatedState.gameWinner = 'player2';
        updatedState.history.unshift(`ゲーム終了！プレイヤー 2 の総合勝利です！`);
      }
    }

    return updatedState;
  }, []);

  // Turn switcher
  const switchTurn = useCallback(() => {
    setState((prev) => {
      const nextTurn: PlayerId = prev.currentTurn === 'player1' ? 'player2' : 'player1';
      return {
        ...prev,
        currentTurn: nextTurn,
        history: [`手番が ${nextTurn === 'player1' ? 'プレイヤー 1' : 'プレイヤー 2'} に移りました。`, ...prev.history],
      };
    });
  }, []);

  // Sell Action
  const sellGoods = useCallback((playerId: PlayerId, goodsType: GoodsType, count: number) => {
    setState((prev) => {
      if (prev.roundOver) return prev;
      
      // Prevent action if it's not this player's turn
      if (prev.currentTurn !== playerId) {
        alert('手番のプレイヤーのみアクションを実行できます。');
        return prev;
      }

      const activePlayer = playerId === 'player1' ? prev.player1 : prev.player2;
      const stock = prev.goodsStocks[goodsType];

      // 1. Rule Validation
      // Luxury goods (diamonds, gold, silver) need at least 2 cards for sale
      const isLuxury = ['diamonds', 'gold', 'silver'].includes(goodsType);
      if (isLuxury && count < 2) {
        alert('高級品（ダイヤ・金・銀）は、一度に2枚以上しか売却できません。');
        return prev;
      }

      if (stock.length === 0) {
        alert('商品在庫がありません。');
        return prev;
      }

      // 2. Claim goods tokens (up to the remaining stock)
      const acquiredCount = Math.min(count, stock.length);
      const claimedGoods = stock.slice(0, acquiredCount);
      const remainingGoods = stock.slice(acquiredCount);

      // 3. Claim bonus token (based on cards sold count, not tokens acquired count)
      let bonusType: BonusType | null = null;
      if (count >= 5) bonusType = 'bonus5';
      else if (count === 4) bonusType = 'bonus4';
      else if (count === 3) bonusType = 'bonus3';

      const updatedBonusStocks = { ...prev.bonusStocks };
      let drawnBonusValue: number | null = null;

      if (bonusType) {
        const bonusStack = prev.bonusStocks[bonusType];
        if (bonusStack.length > 0) {
          drawnBonusValue = bonusStack[0];
          updatedBonusStocks[bonusType] = bonusStack.slice(1);
        }
      }

      // 4. Update player's tokens
      const updatedPlayer = {
        ...activePlayer,
        goodsTokens: {
          ...activePlayer.goodsTokens,
          [goodsType]: [...activePlayer.goodsTokens[goodsType], ...claimedGoods],
        },
      };

      if (bonusType && drawnBonusValue !== null) {
        updatedPlayer.bonusTokens = {
          ...updatedPlayer.bonusTokens,
          [bonusType]: [...updatedPlayer.bonusTokens[bonusType], drawnBonusValue],
        };
      }

      // 5. Update Game State & Switch Turn
      const updatedGoodsStocks = {
        ...prev.goodsStocks,
        [goodsType]: remainingGoods,
      };

      const nextTurn: PlayerId = prev.currentTurn === 'player1' ? 'player2' : 'player1';
      const updatedHistory = [
        `${activePlayer.name} が ${goodsType === 'diamonds' ? 'ダイヤ' : goodsType === 'gold' ? '金' : goodsType === 'silver' ? '銀' : goodsType === 'cloth' ? '布' : goodsType === 'spice' ? 'スパイス' : '革'} を ${count} 枚売却しました。` +
        (drawnBonusValue ? `（ボーナス +${drawnBonusValue}点 獲得）` : '') + ` (手番が ${nextTurn === 'player1' ? 'プレイヤー 1' : 'プレイヤー 2'} に移りました。)`,
        ...prev.history,
      ];

      let tempState: GameState = {
        ...prev,
        goodsStocks: updatedGoodsStocks,
        bonusStocks: updatedBonusStocks,
        currentTurn: nextTurn,
        player1: playerId === 'player1' ? updatedPlayer : prev.player1,
        player2: playerId === 'player2' ? updatedPlayer : prev.player2,
        history: updatedHistory,
      };

      // 6. Check End-of-Round condition
      // Round ends if 3 goods stacks are empty
      const emptyCount = Object.values(updatedGoodsStocks).filter((s) => s.length === 0).length;
      const isAutoRoundEnd = emptyCount >= 3;

      tempState = computeScoresAndWinner(tempState, isAutoRoundEnd);

      return tempState;
    });
  }, [computeScoresAndWinner]);

  // Update camel count
  const updateCamelCount = useCallback((playerId: PlayerId, count: number) => {
    setState((prev) => {
      const activePlayer = playerId === 'player1' ? prev.player1 : prev.player2;
      const updatedPlayer = {
        ...activePlayer,
        camelCount: Math.max(0, count),
      };

      const tempState = {
        ...prev,
        player1: playerId === 'player1' ? updatedPlayer : prev.player1,
        player2: playerId === 'player2' ? updatedPlayer : prev.player2,
      };

      return computeScoresAndWinner(tempState, false);
    });
  }, [computeScoresAndWinner]);

  // Manual round end
  const endRoundManual = useCallback(() => {
    setState((prev) => {
      if (prev.roundOver) return prev;
      const tempState = {
        ...prev,
        manualRoundEnded: true,
      };
      return computeScoresAndWinner(tempState, true);
    });
  }, [computeScoresAndWinner]);

  // Start next round
  const startNextRound = useCallback(() => {
    setState((prev) => {
      const freshGoods = {
        diamonds: [...INITIAL_GOODS.diamonds],
        gold: [...INITIAL_GOODS.gold],
        silver: [...INITIAL_GOODS.silver],
        cloth: [...INITIAL_GOODS.cloth],
        spice: [...INITIAL_GOODS.spice],
        leather: [...INITIAL_GOODS.leather],
      };

      const freshBonus = {
        bonus3: shuffle(BONUS_POOLS.bonus3),
        bonus4: shuffle(BONUS_POOLS.bonus4),
        bonus5: shuffle(BONUS_POOLS.bonus5),
      };

      const resetPlayer = (player: PlayerState): PlayerState => ({
        ...player,
        goodsTokens: {
          diamonds: [],
          gold: [],
          silver: [],
          cloth: [],
          spice: [],
          leather: [],
        },
        bonusTokens: {
          bonus3: [],
          bonus4: [],
          bonus5: [],
        },
        camelCount: 0,
        score: 0,
      });

      return {
        goodsStocks: freshGoods,
        bonusStocks: freshBonus,
        currentTurn: 'player1',
        camelOwner: null,
        player1: resetPlayer(prev.player1),
        player2: resetPlayer(prev.player2),
        roundOver: false,
        manualRoundEnded: false,
        roundWinner: null,
        gameWinner: prev.gameWinner, // Keep game winner
        history: ['新しいラウンドが開始されました。', ...prev.history],
      };
    });
  }, []);

  // Full reset game
  const resetGame = useCallback(() => {
    setState(getInitialState());
  }, []);

  return {
    state,
    sellGoods,
    switchTurn,
    updateCamelCount,
    endRoundManual,
    startNextRound,
    resetGame,
  };
};
