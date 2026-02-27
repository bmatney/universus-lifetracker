import { useState, useCallback } from "react";
import "./App.css";

function App() {
  const START_LIFE = 25;
  const DEFAULT_STAT = 4;

  const [player1Life, setPlayer1Life] = useState(START_LIFE);
  const [player2Life, setPlayer2Life] = useState(START_LIFE);
  const [attackingPlayer, setAttackingPlayer] = useState(null);
  const [attackZone, setAttackZone] = useState("high");
  const [attackSpeed, setAttackSpeed] = useState(DEFAULT_STAT);
  const [attackDamage, setAttackDamage] = useState(DEFAULT_STAT);
  const [gameOver, setGameOver] = useState(null);

  const closePanel = useCallback(() => setAttackingPlayer(null), []);

  const updatePlayer1Life = useCallback(
    (newLife) => {
      if (newLife <= 0) {
        setPlayer1Life(0);
        setGameOver(2);
        closePanel();
      } else {
        setPlayer1Life(newLife);
      }
    },
    [closePanel]
  );

  const updatePlayer2Life = useCallback(
    (newLife) => {
      if (newLife <= 0) {
        setPlayer2Life(0);
        setGameOver(1);
        closePanel();
      } else {
        setPlayer2Life(newLife);
      }
    },
    [closePanel]
  );

  const applyAttack = useCallback(
    (type) => {
      const damageToApply =
        type === "full"
          ? 0
          : type === "half"
          ? Math.ceil(attackDamage / 2)
          : attackDamage;

      if (attackingPlayer === 1) {
        updatePlayer1Life(player1Life - damageToApply);
      } else {
        updatePlayer2Life(player2Life - damageToApply);
      }

      setAttackSpeed(DEFAULT_STAT);
      setAttackDamage(DEFAULT_STAT);

      closePanel();
    },
    [
      attackingPlayer,
      attackDamage,
      player1Life,
      player2Life,
      updatePlayer1Life,
      updatePlayer2Life,
      closePanel,
    ]
  );

  const renderPlayer = useCallback(
    (playerNum) => {
      const life = playerNum === 1 ? player1Life : player2Life;

      let playerClass = "";
      if (!attackingPlayer && playerNum === 2) {
        playerClass = "player-2-main"; // rotate entire div
      } else if (attackingPlayer && attackingPlayer !== playerNum) {
        playerClass = "player-rotate"; // attack panel rotation
      }

      const changeLife = (delta) => {
        if (playerNum === 1) updatePlayer1Life(player1Life + delta);
        else updatePlayer2Life(player2Life + delta);
      };

      return (
        <div className={`player ${playerClass}`}>
          <div className="player-name">Player {playerNum}</div>
          <div
            className="life-total"
            onClick={() => setAttackingPlayer(playerNum)}
          >
            {life}
          </div>
          <div className="controls" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => changeLife(-1)}>-</button>
            <button onClick={() => changeLife(1)}>+</button>
          </div>
        </div>
      );
    },
    [player1Life, player2Life, attackingPlayer, updatePlayer1Life, updatePlayer2Life]
  );

  const resetGame = () => {
    setPlayer1Life(START_LIFE);
    setPlayer2Life(START_LIFE);
    setAttackSpeed(DEFAULT_STAT);
    setAttackDamage(DEFAULT_STAT);
    setAttackingPlayer(null);
    setGameOver(null);
  };

  return (
    <div className={`container ${!attackingPlayer ? "main-screen" : ""}`}>
      {renderPlayer(2)}
      {renderPlayer(1)}

      {attackingPlayer && !gameOver && (
        <div className="modal-backdrop" onClick={closePanel}>
          <div
            className={`attack-panel ${
              attackingPlayer === 1 ? "attack-face-up" : "attack-face-down"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="attack-life-bar">
              <div className="attack-life">
                <div className="attack-player-name">Player 1</div>
                <div className="attack-player-life">{player1Life}</div>
                <div className="controls">
                  <button onClick={() => updatePlayer1Life(player1Life - 1)}>-</button>
                  <button onClick={() => updatePlayer1Life(player1Life + 1)}>+</button>
                </div>
              </div>

              <div className="attack-life">
                <div className="attack-player-name">Player 2</div>
                <div className="attack-player-life">{player2Life}</div>
                <div className="controls">
                  <button onClick={() => updatePlayer2Life(player2Life - 1)}>-</button>
                  <button onClick={() => updatePlayer2Life(player2Life + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="stat">
              <div className="stat-label">Speed</div>
              <div className="stat-value">{attackSpeed}</div>
              <div className="stat-controls">
                <button onClick={() => setAttackSpeed(v => v - 1)}>-</button>
                <button onClick={() => setAttackSpeed(v => v + 1)}>+</button>
              </div>
            </div>

            <div className="stat">
              <div className="stat-label">Damage</div>
              <div className="stat-value">{attackDamage}</div>
              <div className="stat-controls">
                <button onClick={() => setAttackDamage(v => v - 1)}>-</button>
                <button onClick={() => setAttackDamage(v => v + 1)}>+</button>
              </div>
            </div>

            <div className="zone-buttons">
              <button style={{ background: "#ff4c4c" }} onClick={() => setAttackZone("high")}>High</button>
              <button style={{ background: "#ffa500" }} onClick={() => setAttackZone("mid")}>Mid</button>
              <button style={{ background: "#ffec4c" }} onClick={() => setAttackZone("low")}>Low</button>
            </div>

            <div className="block-buttons">
              <button onClick={() => applyAttack("full")}>Full Block</button>
              <button onClick={() => applyAttack("half")}>Half Block</button>
              <button onClick={() => applyAttack("unblocked")}>Unblocked</button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="modal-backdrop">
          <div className="attack-panel">
            <h1>Game Over</h1>
            <h2>Player {gameOver} Wins!</h2>
            <button className="reset-button" onClick={resetGame}>New Game</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;