import { useState } from "react";
import "./App.css";

const ZONES = {
  High: "red",
  Mid: "orange",
  Low: "yellow",
};

export default function App() {
  const [life, setLife] = useState([25, 25]);
  const [defender, setDefender] = useState(null);
  const [zone, setZone] = useState("High");
  const [speed, setSpeed] = useState(4);
  const [damage, setDamage] = useState(4);
  const [gameOver, setGameOver] = useState(false);

  const attacker = defender !== null ? (defender === 0 ? 1 : 0) : null;

  function adjustLife(player, amount) {
    setLife((prev) => {
      const updated = [...prev];
      updated[player] += amount;
      if (updated[player] <= 0) setGameOver(true);
      return updated;
    });
  }

  function openAttack(defendingPlayer) {
    if (gameOver) return;
    setDefender(defendingPlayer);
    setZone("High");
    setSpeed(4);
    setDamage(4);
  }

  function cancelAttack() {
    setDefender(null);
  }

  function resolveBlock(type) {
    let finalDamage = Math.max(0, damage);
    if (type === "full") finalDamage = 0;
    if (type === "half") finalDamage = Math.ceil(finalDamage / 2);

    adjustLife(defender, -finalDamage);
    setDefender(null);
  }

  function newGame() {
    setLife([25, 25]);
    setDefender(null);
    setGameOver(false);
  }

  return (
    <div className="container">
      {[0, 1].map((p) => {
        const isDefender = p === defender;
        const rotation =
          isDefender && defender !== null
            ? `rotate(${attacker === 0 ? 180 : 0}deg)` // main life rotates to face attacker
            : p === 0
            ? "rotate(180deg)"
            : "rotate(0deg)";

        return (
          <div
            key={p}
            className={`player ${p === 0 ? "player-top" : "player-bottom"}`}
            style={{ transform: rotation }}
          >
            <div className="player-name">Player {p + 1}</div>
            <div className="life-total" onClick={() => openAttack(p)}>
              {life[p]}
            </div>
            <div className="controls">
              <button onClick={() => adjustLife(p, -1)}>-</button>
              <button onClick={() => adjustLife(p, 1)}>+</button>
            </div>
          </div>
        );
      })}

      {defender !== null && (
        <div className="modal-backdrop" onClick={cancelAttack}>
          <div
            className={`attack-panel ${
              defender === 0 ? "attack-face-down" : "attack-face-up"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Life totals inside panel stay upright */}
            <div className="attack-life-bar">
              {[0, 1].map((p) => (
                <div key={p} className="attack-life">
                  <div className="life-total">{life[p]}</div>
                  <div className="controls">
                    <button onClick={() => adjustLife(p, -1)}>-</button>
                    <button onClick={() => adjustLife(p, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="zone" style={{ background: ZONES[zone] }}>
              {zone} Attack
            </div>

            <div className="zone-buttons">
              {Object.keys(ZONES).map((z) => (
                <button key={z} onClick={() => setZone(z)}>
                  {z}
                </button>
              ))}
            </div>

            <div className="stat">
              Speed: {speed}
              <div>
                <button onClick={() => setSpeed(speed - 1)}>-</button>
                <button onClick={() => setSpeed(speed + 1)}>+</button>
              </div>
            </div>

            <div className="stat">
              Damage: {damage}
              <div>
                <button onClick={() => setDamage(damage - 1)}>-</button>
                <button onClick={() => setDamage(damage + 1)}>+</button>
              </div>
            </div>

            <div className="block-buttons">
              <button onClick={() => resolveBlock("full")}>Full Block</button>
              <button onClick={() => resolveBlock("half")}>Half Block</button>
              <button onClick={() => resolveBlock("none")}>Unblocked</button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <div>Game Over</div>
          <button onClick={newGame}>New Game</button>
        </div>
      )}
    </div>
  );
}
