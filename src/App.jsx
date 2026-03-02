import { useState, useCallback, useEffect } from "react";
import "./App.css";

function App() {
  const START_LIFE = 25;
  const DEFAULT_STAT = 4;

  const [player1Life, setPlayer1Life] = useState(START_LIFE);
  const [player2Life, setPlayer2Life] = useState(START_LIFE);

  const [attackingPlayer, setAttackingPlayer] = useState(null);
  const [attackSpeed, setAttackSpeed] = useState(DEFAULT_STAT);
  const [attackDamage, setAttackDamage] = useState(DEFAULT_STAT);
  const [attackZone, setAttackZone] = useState("high");

  const [gameOver, setGameOver] = useState(null);
  const [screenStack, setScreenStack] = useState(["main"]);

  const pushScreen = (screen) => setScreenStack((prev) => [...prev, screen]);
  const popScreen = () => setScreenStack((prev) => prev.slice(0, -1));

  const closePanel = useCallback(() => {
    setAttackingPlayer(null);
    popScreen();
    window.history.back();
  }, []);

  // iOS swipe-to-go-back support
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX < 50 && touchEndX - touchStartX > 50) {
        // Right swipe from left edge
        if (attackingPlayer) closePanel();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [attackingPlayer, closePanel]);

  const updatePlayer1Life = useCallback((delta) => {
    setPlayer1Life((prev) => {
      const newLife = prev + delta;
      if (newLife <= 0) {
        setGameOver(2);
        pushScreen("gameover");
        return 0;
      }
      return newLife;
    });
  }, []);

  const updatePlayer2Life = useCallback((delta) => {
    setPlayer2Life((prev) => {
      const newLife = prev + delta;
      if (newLife <= 0) {
        setGameOver(1);
        pushScreen("gameover");
        return 0;
      }
      return newLife;
    });
  }, []);

  const applyAttack = useCallback(
    (type) => {
      let damage = attackDamage;

      if (type === "half") damage = Math.ceil(attackDamage / 2);
      if (type === "full") damage = 0;

      if (attackZone === "high") damage += 1;
      if (attackZone === "low") damage = Math.max(0, damage - 1);

      if (attackingPlayer === 1) updatePlayer1Life(-damage);
      else updatePlayer2Life(-damage);

      setAttackSpeed(DEFAULT_STAT);
      setAttackDamage(DEFAULT_STAT);
      closePanel();
    },
    [attackingPlayer, attackDamage, attackZone, closePanel]
  );

  const renderPlayer = useCallback(
    (playerNum) => {
      const life = playerNum === 1 ? player1Life : player2Life;

      const playerClass =
        !attackingPlayer && playerNum === 2 ? "player-2-main" : attackingPlayer && attackingPlayer !== playerNum ? "player-rotate" : "";

      const changeLife = (delta) => {
        if (playerNum === 1) updatePlayer1Life(delta);
        else updatePlayer2Life(delta);
      };

      return (
        <div className={`player ${playerClass}`}>
          <div className="player-name">Player {playerNum}</div>
          <div className="life-total" onClick={() => { setAttackingPlayer(playerNum); pushScreen("attack"); }}>
            {life}
          </div>
          <div className="controls" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => changeLife(-1)}>-</button>
            <button onClick={() => changeLife(1)}>+</button>
          </div>
        </div>
      );
    },
    [player1Life, player2Life, attackingPlayer]
  );

  const resetGame = () => {
    setPlayer1Life(START_LIFE);
    setPlayer2Life(START_LIFE);
    setAttackSpeed(DEFAULT_STAT);
    setAttackDamage(DEFAULT_STAT);
    setAttackZone("high");
    setGameOver(null);
    setScreenStack(["main"]);
  };

  return (
    <div className={`container ${!attackingPlayer ? "main-screen" : ""}`}>
      {renderPlayer(2)}
      {renderPlayer(1)}

      {/* Attack Panel */}
      {attackingPlayer && !gameOver && (
        <div className="modal-backdrop" onClick={closePanel}>
          <div
            className={`attack-panel ${attackingPlayer === 1 ? "attack-face-up" : "attack-face-down"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="attack-life-bar">
              <div className="attack-life">
                <div className="attack-player-name">Player 1</div>
                <div className="attack-player-life">{player1Life}</div>
                <div className="controls">
                  <button onClick={() => updatePlayer1Life(-1)}>-</button>
                  <button onClick={() => updatePlayer1Life(1)}>+</button>
                </div>
              </div>
              <div className="attack-life">
                <div className="attack-player-name">Player 2</div>
                <div className="attack-player-life">{player2Life}</div>
                <div className="controls">
                  <button onClick={() => updatePlayer2Life(-1)}>-</button>
                  <button onClick={() => updatePlayer2Life(1)}>+</button>
                </div>
              </div>
            </div>

            <div className="stat">
              <div className="stat-label">Speed</div>
              <div className="stat-value">{attackSpeed}</div>
              <div className="stat-controls">
                <button onClick={() => setAttackSpeed((v) => Math.max(0, v - 1))}>-</button>
                <button onClick={() => setAttackSpeed((v) => v + 1)}>+</button>
              </div>
            </div>

            <div className="stat">
              <div className="stat-label">Damage</div>
              <div className="stat-value">{attackDamage}</div>
              <div className="stat-controls">
                <button onClick={() => setAttackDamage((v) => Math.max(0, v - 1))}>-</button>
                <button onClick={() => setAttackDamage((v) => v + 1)}>+</button>
              </div>
            </div>

            {/* Zone Buttons */}
            <div className="zone-buttons">
              <button
                data-zone="high"
                className={attackZone === "high" ? "selected-zone" : ""}
                onClick={() => setAttackZone("high")}
              >
                High
              </button>
              <button
                data-zone="mid"
                className={attackZone === "mid" ? "selected-zone" : ""}
                onClick={() => setAttackZone("mid")}
              >
                Mid
              </button>
              <button
                data-zone="low"
                className={attackZone === "low" ? "selected-zone" : ""}
                onClick={() => setAttackZone("low")}
              >
                Low
              </button>
            </div>

            <div className="block-buttons">
              <button onClick={() => applyAttack("full")}>Full Block</button>
              <button onClick={() => applyAttack("half")}>Half Block</button>
              <button onClick={() => applyAttack("unblocked")}>Unblocked</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
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