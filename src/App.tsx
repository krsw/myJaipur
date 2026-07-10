import { useJaipur } from './hooks/useJaipur';
import { PlayerSection } from './components/PlayerSection';
import { MarketBoard } from './components/MarketBoard';
import { GameOverModal } from './components/GameOverModal';
import './App.css';

function App() {
  const {
    state,
    sellGoods,
    switchTurn,
    updateCamelCount,
    endRoundManual,
    startNextRound,
    resetGame,
  } = useJaipur();

  return (
    <div className="w-screen h-[100dvh] flex flex-col justify-between bg-slate-950 p-2 sm:p-3 text-slate-100 overflow-hidden select-none">
      
      {/* Player 1 Section (Rotated 180 degrees by default for head-to-head iPad play) */}
      <div className="flex-1 min-h-0 h-[31dvh] portrait:h-[35dvh]">
        <PlayerSection
          player={state.player1}
          currentTurn={state.currentTurn}
          goodsStocks={state.goodsStocks}
          onSell={sellGoods}
          isRotatedDefault={true}
        />
      </div>

      {/* Central Shared Market Board */}
      <div className="my-1.5 sm:my-2 shrink-0">
        <MarketBoard
          goodsStocks={state.goodsStocks}
          bonusStocks={state.bonusStocks}
          currentTurn={state.currentTurn}
          onSwitchTurn={switchTurn}
          history={state.history}
          onEndRoundManual={endRoundManual}
          onResetGame={resetGame}
          roundOver={state.roundOver}
        />
      </div>

      {/* Player 2 Section (Normal orientation) */}
      <div className="flex-1 min-h-0 h-[31dvh] portrait:h-[35dvh]">
        <PlayerSection
          player={state.player2}
          currentTurn={state.currentTurn}
          goodsStocks={state.goodsStocks}
          onSell={sellGoods}
          isRotatedDefault={false}
        />
      </div>

      {/* Game Over / Round Over Modal */}
      <GameOverModal
        state={state}
        onUpdateCamel={updateCamelCount}
        onNextRound={startNextRound}
        onResetGame={resetGame}
      />
    </div>
  );
}

export default App;
