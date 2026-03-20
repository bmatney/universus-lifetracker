import { useState, useEffect, useCallback, memo } from "react";
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';
import logo from './assets/logo.png'; 
import "./App.css";

// CONSTANTS
const START_LIFE = 25;
const DEFAULT_STAT = 4;

const ZONES = {
  HIGH: "high",
  MID: "mid",
  LOW: "low"
};

const zoneColors = {
  [ZONES.HIGH]: "#ED1C24",
  [ZONES.MID]: "#F7941D",
  [ZONES.LOW]: "#FFDE00",
  default: "#2c3e50"
};

// MEMO COMPONENTS
const PlayerSection = memo(({ num, life, onUpdate, onOpen, rotated, isFirst }) => (
  <div
    className={`player ${rotated ? "player-rotate" : ""} ${isFirst ? "first-player-highlight" : ""}`}
    onClick={onOpen}
  >
    <div className={`player-name ${isFirst ? "first-name-active" : ""}`}>
      Player {num} {isFirst && <span className="first-tag">1ST</span>}
    </div>
    <div className="life-total">{life}</div>
    <div className="controls">
      <button onClick={(e) => { e.stopPropagation(); onUpdate(num, -1); }}>-</button>
      <button onClick={(e) => { e.stopPropagation(); onUpdate(num, 1); }}>+</button>
    </div>
  </div>
));

const MiniLife = memo(({ label, life, onUpdate, inverted }) => (
  <div className={`mini-life ${inverted ? "mini-life-inverted" : ""}`}>
    <span className="mini-label">{label} LIFE</span>
    <div className="mini-life-val">{life}</div>
    <div className="mini-controls">
      <button onClick={() => onUpdate(-1)}>-</button>
      <button onClick={() => onUpdate(1)}>+</button>
    </div>
  </div>
));

const StatControl = memo(({ label, val, set }) => (
  <div className="stat">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{val}</div>
    <div className="stat-controls">
      <button onClick={() => set(v => Math.max(0, v - 1))}>-</button>
      <button onClick={() => set(v => v + 1)}>+</button>
    </div>
  </div>
));

function App() {
  const [player1Life, setPlayer1Life] = useState(START_LIFE);
  const [player2Life, setPlayer2Life] = useState(START_LIFE);
  const [targetPlayer, setTargetPlayer] = useState(null);

  const [attackSpeed, setAttackSpeed] = useState(DEFAULT_STAT);
  const [attackDamage, setAttackDamage] = useState(DEFAULT_STAT);
  const [attackZone, setAttackZone] = useState(ZONES.HIGH);

  const [gameOver, setGameOver] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [firstPlayer, setFirstPlayer] = useState(null);
  const [diceRolls, setDiceRolls] = useState(null); // 
  const [history, setHistory] = useState([]);

  // Stable haptics
  const triggerHaptic = useCallback(async (style = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch {}
  }, []);

  // Init + cleanup
  useEffect(() => {
    const initApp = async () => {
      try {
        await KeepAwake.keepAwake();
        await SplashScreen.hide();
      } catch {
        console.log("Capacitor plugins skipped (browser)");
      }
    };
    initApp();

    return () => {
      KeepAwake.allowSleep?.();
    };
  }, []);

  // Update life
  const updatePlayerLife = useCallback((playerNum, delta) => {
    if (delta === 0) return;

    triggerHaptic(ImpactStyle.Light);

    setHistory(prev => [
      ...prev,
      { p1: player1Life, p2: player2Life }
    ]);

    if (playerNum === 1) {
      setPlayer1Life(prev => {
        const newVal = Math.max(0, prev + delta);
        if (newVal === 0) setGameOver(2);
        return newVal;
      });
    } else {
      setPlayer2Life(prev => {
        const newVal = Math.max(0, prev + delta);
        if (newVal === 0) setGameOver(1);
        return newVal;
      });
    }
  }, [player1Life, player2Life, triggerHaptic]);

  const resetGame = () => {
    setPlayer1Life(START_LIFE);
    setPlayer2Life(START_LIFE);
    setHistory([]);
    setFirstPlayer(null);
    setGameOver(null);
    setShowResetConfirm(false);
    triggerHaptic(ImpactStyle.Heavy);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const prevState = history[history.length - 1];

    setPlayer1Life(prevState.p1);
    setPlayer2Life(prevState.p2);
    setGameOver(null);

    setHistory(prev => prev.slice(0, -1));
    triggerHaptic(ImpactStyle.Medium);
  };

const rollDice = () => {
    triggerHaptic(ImpactStyle.Heavy);

    let p1Roll, p2Roll;
    do {
      p1Roll = Math.floor(Math.random() * 20) + 1;
      p2Roll = Math.floor(Math.random() * 20) + 1;
    } while (p1Roll === p2Roll);

    // FIXED: Save the rolls instead of immediately closing the modal
    setDiceRolls({ 
      p1: p1Roll, 
      p2: p2Roll, 
      winner: p1Roll > p2Roll ? 1 : 2 
    });
  };

  const openAttackPanel = (playerNum) => {
    triggerHaptic(ImpactStyle.Medium);
    setTargetPlayer(playerNum);
    setAttackSpeed(DEFAULT_STAT);
    setAttackDamage(DEFAULT_STAT);
    setAttackZone(ZONES.HIGH);
  };

  const closeAttackPanel = () => setTargetPlayer(null);

  const applyDamage = (amount) => {
    updatePlayerLife(targetPlayer, -amount);
    closeAttackPanel();
  };

  const handleZoneClick = (zone) => {
    triggerHaptic(ImpactStyle.Light);
    setAttackZone(zone);
  };

  return (
    <div className="container main-screen">
      <img src={logo} alt="Momentum Logo" className="background-watermark" />

      <div className="game-area">
        <PlayerSection
          num={2}
          life={player2Life}
          onUpdate={updatePlayerLife}
          onOpen={() => openAttackPanel(2)}
          rotated
          isFirst={firstPlayer === 2}
        />

        <div className="center-divider">
          <div style={{ display: 'flex', gap: '10px', zIndex: 20 }}>
            {/* FIXED: Added back the classes for Reset and Undo */}
            <button className="divider-reset-btn" onClick={() => setShowResetConfirm(true)}>↻</button>
            <button className="divider-undo-btn" onClick={handleUndo} disabled={!history.length}>↶</button>
          </div>
        </div>

        <PlayerSection
          num={1}
          life={player1Life}
          onUpdate={updatePlayerLife}
          onOpen={() => openAttackPanel(1)}
          isFirst={firstPlayer === 1}
        />
      </div>

      {/* First Player */}
      {!firstPlayer && !gameOver && (
        <div className="modal-backdrop">
          <div className="attack-panel game-over-panel">
            <h2 style={{ margin: "0 0 20px 0" }}>Who Goes First?</h2>
            
            {/* If we have dice rolls, show the results! */}
            {diceRolls ? (
              <>
                <div className="dice-results">
                  {/* Player 1 is now on the left for the Player 1 facing screen */}
                  <div className="dice-score">
                    <span>P1 Roll</span>
                    <strong>{diceRolls.p1}</strong>
                  </div>
                  <div className="dice-score">
                    <span>P2 Roll</span>
                    <strong>{diceRolls.p2}</strong>
                  </div>
                </div>
                <h3 className="roll-winner" style={{ marginBottom: "20px" }}>
                  Player {diceRolls.winner} goes first!
                </h3>
                <button 
                  className="reset-button" 
                  onClick={() => {
                    setFirstPlayer(diceRolls.winner);
                    setDiceRolls(null); // Clear the rolls for next time
                  }}
                >
                  Start Game
                </button>
              </>
            ) : (
              /* Otherwise, show the buttons to roll or pick manually */
              <>
                <div className="block-buttons" style={{ marginBottom: "16px" }}>
                  <button onClick={() => setFirstPlayer(1)}>Player 1</button>
                  <button onClick={() => setFirstPlayer(2)}>Player 2</button>
                </div>
                <button className="roll-button" onClick={rollDice}>🎲 ROLL D20s</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Attack */}
    {targetPlayer && !gameOver && (
        <div className="modal-backdrop" onClick={closeAttackPanel}>
          <div
            /* FIXED 1: targetPlayer === 1 makes the panel face Player 2 */
            className={`attack-panel ${targetPlayer === 1 ? "attack-face-down" : "attack-face-up"}`}
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: zoneColors[attackZone] }}
          >
          <div className="panel-life-display">
            {/* Logic: If targetPlayer is 1, the panel is flipped to face P2. 
                In that case, P2 should be on the left. 
                Otherwise, P1 is on the left. */}
            {targetPlayer === 1 ? (
              <>
                <MiniLife label="P2" life={player2Life} onUpdate={(d) => updatePlayerLife(2, d)} inverted={false} />
                <MiniLife label="P1" life={player1Life} onUpdate={(d) => updatePlayerLife(1, d)} inverted={true} />
              </>
            ) : (
              <>
                <MiniLife label="P1" life={player1Life} onUpdate={(d) => updatePlayerLife(1, d)} inverted={false} />
                <MiniLife label="P2" life={player2Life} onUpdate={(d) => updatePlayerLife(2, d)} inverted={true} />
              </>
            )}
          </div>

            <div className="stat-group">
              <StatControl label="Speed" val={attackSpeed} set={setAttackSpeed} />
              <StatControl label="Damage" val={attackDamage} set={setAttackDamage} />
            </div>

      <div className="zone-buttons">
              {Object.values(ZONES).map(z => (
                <button 
                  key={z} 
                  data-zone={z} /* <--- ADD THIS LINE BACK IN */
                  className={attackZone === z ? "selected-zone" : ""}
                  onClick={() => handleZoneClick(z)}
                >
                  {z.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="block-buttons">
              <button onClick={() => applyDamage(attackDamage)}>No Block</button>
              <button onClick={() => applyDamage(Math.ceil(attackDamage / 2))}>Half Block</button>
              <button onClick={() => applyDamage(0)}>Full Block</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          {/* FIXED: Added game-over-panel class to center the text */}
          <div className="attack-panel game-over-panel" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 10px 0" }}>Reset Game?</h2>
            <p style={{ marginBottom: "25px", opacity: 0.8 }}>Are you sure you want to restart?</p>
            {/* FIXED: Formatted the buttons nicely with the block-buttons class */}
            <div className="block-buttons">
              <button style={{ backgroundColor: "#34495e" }} onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button style={{ backgroundColor: "#ED1C24" }} onClick={resetGame}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="modal-backdrop">
          <div className="attack-panel game-over-panel">
            <h2>PLAYER {gameOver} WINS!</h2>
            {/* FIXED: Restored the reset-button class */}
            <button className="reset-button" onClick={resetGame}>New Game</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;