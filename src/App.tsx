import { useJaipur } from './hooks/useJaipur';
import { PlayerSection } from './components/PlayerSection';
import { MarketBoard } from './components/MarketBoard';
import { GameOverModal } from './components/GameOverModal';
import './App.css';

function App() {
  const {
    state,
    sellGoods,
    updateCamelCount,
    endRoundManual,
    startNextRound,
    resetGame,
  } = useJaipur();

  return (
    <div className="w-screen h-screen flex flex-col justify-between bg-slate-950 p-3 text-slate-100 overflow-hidden select-none">
      
      {/* Player 1 Section (Rotated 180 degrees by default for head-to-head iPad play) */}
      <div className="flex-1 min-h-0 h-[36vh]">
        <PlayerSection
          player={state.player1}
          opponentCamelCount={state.player2.camelCount}
          goodsStocks={state.goodsStocks}
          onSell={sellGoods}
          onUpdateCamel={updateCamelCount}
          isRotatedDefault={true}
        />
      </div>

      {/* Central Shared Market Board */}
      <div className="my-3 shrink-0">
        <MarketBoard
          goodsStocks={state.goodsStocks}
          bonusStocks={state.bonusStocks}
          history={state.history}
          onEndRoundManual={endRoundManual}
          onResetGame={resetGame}
          roundOver={state.roundOver}
        />
      </div>

      {/* Player 2 Section (Normal orientation) */}
      <div className="flex-1 min-h-0 h-[36vh]">
        <PlayerSection
          player={state.player2}
          opponentCamelCount={state.player1.camelCount}
          goodsStocks={state.goodsStocks}
          onSell={sellGoods}
          onUpdateCamel={updateCamelCount}
          isRotatedDefault={false}
        />
      </div>

      {/* Game Over / Round Over Modal */}
      <GameOverModal
        state={state}
        onNextRound={startNextRound}
        onResetGame={resetGame}
      />
    </div>
  );
}

export default App;
