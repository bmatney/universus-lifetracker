import { useState, useCallback } from "react";
import "./App.css";

function App() {
  const [player1Life, setPlayer1Life] = useState(25);
  const [player2Life, setPlayer2Life] = useState(25);
  const [attackingPlayer, setAttackingPlayer] = useState(null); // 1 or 2
  const [attackZone, setAttackZone] = useState("high");
  const [attackSpeed, setAttackSpeed] = useState(4);
  const [attackDamage, setAttackDamage] = useState(4);

  const closePanel = useCallback(() => setAttackingPlayer(null), []);

  const applyAttack = useCallback(
    (type) => {
      const damageToApply = Math.max(
        0,
        type === "full"
          ? attackDamage
          : type === "half"
          ? Math.ceil(attackDamage / 2)
          : 0
      );

      if (attackingPlayer === 1) {
        setPlayer1Life((l) => l - damageToApply);
      } else {
        setPlayer2Life((l) => l - damageToApply);
      }

      closePanel();
    },
    [attackingPlayer, attackDamage, closePanel]
  );

  const renderPlayer = useCallback(
    (playerNum) => {
      const life = playerNum === 1 ? player1Life : player2Life;
      const setLife = playerNum === 1 ? setPlayer1Life : setPlayer2Life;

      // Main screen orientation:
      // Player 1 faces themselves, Player 2 is mirrored
      let rotateClass = "";
      if (!attackingPlayer) {
        rotateClass = playerNum === 2 ? "player-rotate" : "";
      } else {
        rotateClass = attackingPlayer !== playerNum ? "player-rotate" : "";
      }

      return (
        <div
          className={`player ${rotateClass}`}
          onClick={() => setAttackingPlayer(playerNum)}
        >
          <div className="player-name">Player {playerNum}</div>
          <div className="life-total">{life}</div>
          <div className="controls">
            <button onClick={() => setLife(life + 1)}>+</button>
            <button onClick={() => setLife(life - 1)}>-</button>
          </div>
        </div>
      );
    },
    [player1Life, player2Life, attackingPlayer]
  );

  return (
    <div className="container">
      {renderPlayer(2)}
      {renderPlayer(1)}

      {attackingPlayer && (
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
                  <button onClick={() => setPlayer1Life((l) => l + 1)}>+</button>
                  <button onClick={() => setPlayer1Life((l) => l - 1)}>-</button>
                </div>
              </div>
              <div className="attack-life">
                <div className="attack-player-name">Player 2</div>
                <div className="attack-player-life">{player2Life}</div>
                <div className="controls">
                  <button onClick={() => setPlayer2Life((l) => l + 1)}>+</button>
                  <button onClick={() => setPlayer2Life((l) => l - 1)}>-</button>
                </div>
              </div>
            </div>

            <div className="stat">
              <div className="stat-label">Speed</div>
              <div className="stat-value">{attackSpeed}</div>
              <div className="stat-controls">
                <button onClick={() => setAttackSpeed((v) => v + 1)}>+</button>
                <button onClick={() => setAttackSpeed((v) => v - 1)}>-</button>
              </div>
            </div>

            <div className="stat">
              <div className="stat-label">Damage</div>
              <div className="stat-value">{attackDamage}</div>
              <div className="stat-controls">
                <button onClick={() => setAttackDamage((v) => v + 1)}>+</button>
                <button onClick={() => setAttackDamage((v) => v - 1)}>-</button>
              </div>
            </div>

            <div className="zone-buttons">
              <button
                style={{ background: "#ff4c4c" }}
                onClick={() => setAttackZone("high")}
              >
                High
              </button>
              <button
                style={{ background: "#ffa500" }}
                onClick={() => setAttackZone("mid")}
              >
                Mid
              </button>
              <button
                style={{ background: "#ffec4c" }}
                onClick={() => setAttackZone("low")}
              >
                Low
              </button>
            </div>

            <div className="block-buttons">
              <button onClick={() => applyAttack("full")}>Full</button>
              <button onClick={() => applyAttack("half")}>Half</button>
              <button onClick={() => applyAttack("unblocked")}>Unblocked</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;