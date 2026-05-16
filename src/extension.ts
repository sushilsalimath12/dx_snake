import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
  const openGame = () => {
    const panel = vscode.window.createWebviewPanel(
      "dxSnakesGame",
      "DX Snakes",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.html = getWebviewHtml();
  };

  const command = vscode.commands.registerCommand("dxSnakes.startGame", openGame);
  const aliasCommand = vscode.commands.registerCommand("dxSnakes.openGame", openGame);
  const legacyCaseAlias = vscode.commands.registerCommand("dXSnakes.startGame", openGame);
  const legacyCaseAlias2 = vscode.commands.registerCommand("dXSnakes.openGame", openGame);
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = "$(game) Play DX Snakes";
  statusBarItem.command = "dxSnakes.startGame";
  statusBarItem.tooltip = "Open DX Snakes";
  statusBarItem.show();

  // Auto-open once per app session so users can start quickly with 'S'.
  const autoOpenKey = "dxSnakesAutoOpened";
  if (!context.globalState.get<boolean>(autoOpenKey)) {
    context.globalState.update(autoOpenKey, true).then(() => {
      setTimeout(() => openGame(), 600);
    });
  }

  context.subscriptions.push(command, aliasCommand, legacyCaseAlias, legacyCaseAlias2, statusBarItem);
}

export function deactivate(): void {}

function getWebviewHtml(): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DX Snakes</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --panel: #101010;
      --text: #ece9e2;
      --muted: #b7b2a8;
      --field: #000000;
      --field2: #050505;
      --grid: rgba(255, 255, 255, 0.03);
      --snakeHead: #f6f4f0;
      --snakeBody: #ebe8e1;
      --food: #23a776;
      --frog: #3ecf8e;
      --border: #2c2c2c;
      --error: #ff6b6b;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Consolas, "Courier New", monospace;
      height: 100%;
      overflow: hidden;
    }
    .container {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 8px;
      height: 100vh;
      padding: 10px;
    }
    .gameWrap {
      min-height: 0;
      min-width: 0;
    }
    .topbar, .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid var(--border);
      background: var(--panel);
      border-radius: 8px;
      font-size: 12px;
    }
    .hint { color: var(--muted); }
    .stats { display: flex; gap: 12px; font-size: 14px; }
    .pill {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: #171717;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 0;
      border: 10px solid #161616;
      border-radius: 8px;
      background: var(--field);
      image-rendering: pixelated;
      outline: none;
    }
    .kbd {
      display: inline-block;
      border: 1px solid #3a3a3a;
      border-bottom-width: 2px;
      border-radius: 4px;
      padding: 1px 6px;
      margin: 0 2px;
      background: #171717;
      color: var(--text);
    }
    .btn {
      background: #252525;
      color: var(--text);
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      cursor: pointer;
      font-family: inherit;
    }
    .btn:hover { background: #343434; }
    .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .miniActions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .miniBtn {
      background: #202020;
      border: 1px solid #3a3a3a;
      color: var(--text);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    .miniBtn:hover { background: #2b2b2b; }
    .miniBtn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .error {
      color: var(--error);
      font-weight: 600;
      min-height: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="topbar">
      <div>
        <strong>DX Snakes</strong>
        <div class="hint">classic snake with dev twists</div>
      </div>
      <div class="stats">
        <div class="pill">Score: <span id="score">0</span></div>
        <div class="pill">High: <span id="high">0</span></div>
        <div class="pill">Speed: <span id="speed">1</span></div>
        <div class="pill">Frog: <span id="frogTimer">--</span></div>
        <div class="pill">Slow: <span id="slowState">Ready</span></div>
        <div class="miniActions">
          <button id="slowBtn" class="miniBtn" type="button">Slow -10</button>
          <button id="restartTopBtn" class="miniBtn" type="button">Restart</button>
        </div>
      </div>
    </div>
    <div class="gameWrap">
      <canvas id="game" width="840" height="510" tabindex="0" aria-label="DX Snakes game area"></canvas>
    </div>
    <div class="footer">
      <div>
        Simple 2-key mode:
        <span class="kbd">↑</span> Turn Left,
        <span class="kbd">↓</span> Turn Right,
        <span class="kbd">S</span> Start,
        <span class="kbd">R</span> Restart,
        <span class="kbd">S</span> Slow once (-10 score, after start).
      </div>
      <button class="btn" id="startBtn" type="button">Start Game</button>
      <button class="btn" id="restartBtn" type="button">Restart</button>
      <div id="error" class="error" aria-live="polite"></div>
    </div>
  </div>
  <script>
    (() => {
      const errorEl = document.getElementById("error");
      const showError = (message) => {
        if (errorEl) {
          errorEl.textContent = message;
        }
      };

      try {
        const canvas = document.getElementById("game");
        const scoreEl = document.getElementById("score");
        const highEl = document.getElementById("high");
        const speedEl = document.getElementById("speed");
        const frogTimerEl = document.getElementById("frogTimer");
        const slowStateEl = document.getElementById("slowState");
        const slowBtn = document.getElementById("slowBtn");
        const restartTopBtn = document.getElementById("restartTopBtn");
        const startBtn = document.getElementById("startBtn");
        const restartBtn = document.getElementById("restartBtn");

        if (
          !canvas || !scoreEl || !highEl || !speedEl || !frogTimerEl || !slowStateEl ||
          !slowBtn || !restartTopBtn || !startBtn || !restartBtn
        ) {
          showError("UI initialization failed. Please reopen DX Snakes.");
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          showError("Canvas 2D context unavailable.");
          return;
        }

        const safeStorage = {
          get(key) {
            try {
              return window.localStorage.getItem(key);
            } catch {
              return null;
            }
          },
          set(key, value) {
            try {
              window.localStorage.setItem(key, value);
            } catch {
              // Ignore storage failures.
            }
          }
        };

        const COLORS = {
          field: "#000000",
          field2: "#050505",
          grid: "rgba(255,255,255,0.05)",
          snakeHead: "#e7e4de",
          snakeBody: "#ccc7be",
          food: "#23a776",
          frog: "#3ecf8e",
          border: "#2c2c2c",
          overlay: "rgba(0,0,0,0.68)",
          text: "#ece9e2"
        };

        let COLS = 28;
        let ROWS = 17;
        const SEGMENT_SCALE = 0.9;
        let VIEW_W = 840;
        let VIEW_H = 510;
        let CELL = 18;
        let FIELD_W = COLS * CELL;
        let FIELD_H = ROWS * CELL;
        let OFFSET_X = Math.floor((VIEW_W - FIELD_W) / 2);
        let OFFSET_Y = Math.floor((VIEW_H - FIELD_H) / 2);
        let SEGMENT_SIZE = Math.max(6, Math.floor(CELL * SEGMENT_SCALE));
        let SEGMENT_PAD = Math.floor((CELL - SEGMENT_SIZE) / 2);

        let snake = [];
        const DIRECTIONS = [
          { x: 1, y: 0 },  // right
          { x: 0, y: 1 },  // down
          { x: -1, y: 0 }, // left
          { x: 0, y: -1 }  // up
        ];
        let dirIndex = 0;
        let dir = { x: 1, y: 0 };
        let food = { x: 10, y: 10 };
        let score = 0;
        let high = Number(safeStorage.get("dxSnakesHighScore") || "0");
        let speedLevel = 1;
        let stepMs = 170;
        let started = false;
        let gameOver = false;
        let timerId = null;
        let justAteFrames = 0;
        let frog = null;
        let frogTicksLeft = 0;
        let slowUsed = false;
        
        const applyResponsiveCanvas = () => {
          const rect = canvas.getBoundingClientRect();
          const cssWidth = Math.max(320, Math.floor(rect.width || 840));
          const cssHeight = Math.max(240, Math.floor(rect.height || 510));
          const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

          canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
          canvas.height = Math.max(1, Math.floor(cssHeight * dpr));

          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
          ctx.imageSmoothingEnabled = false;

          VIEW_W = cssWidth;
          VIEW_H = cssHeight;

          const baseCell = Math.max(14, Math.floor(Math.min(VIEW_W / 28, VIEW_H / 17)));
          CELL = baseCell;
          COLS = Math.max(20, Math.floor(VIEW_W / CELL));
          ROWS = Math.max(12, Math.floor(VIEW_H / CELL));
          FIELD_W = COLS * CELL;
          FIELD_H = ROWS * CELL;
          OFFSET_X = Math.floor((VIEW_W - FIELD_W) / 2);
          OFFSET_Y = Math.floor((VIEW_H - FIELD_H) / 2);
          SEGMENT_SIZE = Math.max(3, Math.floor(CELL * SEGMENT_SCALE));
          SEGMENT_PAD = Math.floor((CELL - SEGMENT_SIZE) / 2);
        };


        const updateHud = () => {
          scoreEl.textContent = String(score);
          highEl.textContent = String(high);
          speedEl.textContent = String(speedLevel);
          frogTimerEl.textContent = frog ? String(Math.ceil(frogTicksLeft / 2)) + "s" : "--";
          slowStateEl.textContent = slowUsed ? "Used" : "Ready";
          slowBtn.disabled = slowUsed || gameOver || !started;
          startBtn.disabled = started && !gameOver;
        };

        const isCellOnSnake = (x, y) => snake.some((part) => part.x === x && part.y === y);

        const spawnFood = () => {
          if (snake.length >= COLS * ROWS) {
            gameOver = true;
            return;
          }
          let x;
          let y;
          do {
            x = Math.floor(Math.random() * COLS);
            y = Math.floor(Math.random() * ROWS);
          } while (isCellOnSnake(x, y));
          food = { x, y };
        };

        const spawnFrog = () => {
          // Spawn occasionally on empty cell.
          if (frog || Math.random() > 0.22) return;
          let x;
          let y;
          do {
            x = Math.floor(Math.random() * COLS);
            y = Math.floor(Math.random() * ROWS);
          } while (isCellOnSnake(x, y) || (x === food.x && y === food.y));
          frog = { x, y, dirX: Math.random() > 0.5 ? 1 : -1, dirY: 0 };
          frogTicksLeft = 24; // ~12 seconds at base speed.
        };

        const moveFrog = () => {
          if (!frog) return;
          frogTicksLeft -= 1;
          if (frogTicksLeft <= 0) {
            frog = null;
            return;
          }
          // Hop every other tick for retro feel.
          if (frogTicksLeft % 2 !== 0) return;

          const axisFlip = Math.random() < 0.25;
          if (axisFlip) {
            if (frog.dirX !== 0) {
              frog.dirY = Math.random() > 0.5 ? 1 : -1;
              frog.dirX = 0;
            } else {
              frog.dirX = Math.random() > 0.5 ? 1 : -1;
              frog.dirY = 0;
            }
          }

          const nx = frog.x + frog.dirX;
          const ny = frog.y + frog.dirY;
          if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || isCellOnSnake(nx, ny) || (nx === food.x && ny === food.y)) {
            frog.dirX *= -1;
            frog.dirY *= -1;
            return;
          }
          frog.x = nx;
          frog.y = ny;
        };

        const resetGame = (autoStart = true) => {
          const centerX = Math.max(3, Math.floor(COLS / 2));
          const centerY = Math.max(2, Math.floor(ROWS / 2));
          snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
          ];
          dirIndex = 0;
          dir = DIRECTIONS[dirIndex];
          score = 0;
          speedLevel = 1;
          stepMs = 170;
          started = autoStart;
          gameOver = false;
          justAteFrames = 0;
          frog = null;
          frogTicksLeft = 0;
          slowUsed = false;
          spawnFood();
          updateHud();
          draw();
          if (autoStart) {
            startLoop();
          }
        };

        const startGame = () => {
          if (gameOver || started) return;
          started = true;
          updateHud();
          startLoop();
          draw();
        };

        const useSlowOnce = () => {
          if (slowUsed || gameOver) return;
          slowUsed = true;
          stepMs = Math.min(260, stepMs + 40);
          speedLevel = Math.max(1, speedLevel - 1);
          score = Math.max(0, score - 10);
          startLoop();
          updateHud();
        };

        const rotateSnake = (turnDelta) => {
          dirIndex = (dirIndex + turnDelta + DIRECTIONS.length) % DIRECTIONS.length;
          dir = DIRECTIONS[dirIndex];
          started = true;
        };

        const persistHighIfNeeded = () => {
          if (score > high) {
            high = score;
            safeStorage.set("dxSnakesHighScore", String(high));
          }
        };

        const growFromTail = (segments) => {
          const tail = snake[snake.length - 1];
          if (!tail) return;
          for (let i = 0; i < segments; i += 1) {
            snake.push({ x: tail.x, y: tail.y });
          }
        };

        const step = () => {
          if (!started || gameOver) return;

          const head = snake[0];
          const next = { x: head.x + dir.x, y: head.y + dir.y };

          // Nokia challenge rule: wall hit = game over.
          if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
            gameOver = true;
            persistHighIfNeeded();
            updateHud();
            return;
          }

          if (isCellOnSnake(next.x, next.y)) {
            gameOver = true;
            persistHighIfNeeded();
            updateHud();
            return;
          }

          snake.unshift(next);

          if (next.x === food.x && next.y === food.y) {
            score += 5;
            justAteFrames = 5;
            if (score % 25 === 0) {
              speedLevel += 1;
              stepMs = Math.max(70, stepMs - 10);
              startLoop();
            }
            persistHighIfNeeded();
            spawnFood();
          } else {
            snake.pop();
          }

          if (frog && next.x === frog.x && next.y === frog.y) {
            score += 20;
            justAteFrames = 6;
            // Frog is a bonus prey: always grow extra segments.
            growFromTail(2);
            frog = null;
            frogTicksLeft = 0;
            persistHighIfNeeded();
          } else {
            spawnFrog();
            moveFrog();
          }

          updateHud();
        };

        const drawCell = (x, y, color) => {
          ctx.fillStyle = color;
          ctx.fillRect(
            OFFSET_X + x * CELL + SEGMENT_PAD,
            OFFSET_Y + y * CELL + SEGMENT_PAD,
            SEGMENT_SIZE,
            SEGMENT_SIZE
          );
        };

        const draw = () => {
          // Field
          ctx.fillStyle = COLORS.field;
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);
          ctx.fillStyle = COLORS.field2;
          ctx.fillRect(OFFSET_X, OFFSET_Y, FIELD_W, FIELD_H);

          // Grid
          ctx.strokeStyle = COLORS.grid;
          ctx.lineWidth = 1;
          for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(OFFSET_X + x * CELL, OFFSET_Y);
            ctx.lineTo(OFFSET_X + x * CELL, OFFSET_Y + FIELD_H);
            ctx.stroke();
          }
          for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(OFFSET_X, OFFSET_Y + y * CELL);
            ctx.lineTo(OFFSET_X + FIELD_W, OFFSET_Y + y * CELL);
            ctx.stroke();
          }

          // Border
          ctx.lineWidth = 3;
          ctx.strokeStyle = COLORS.border;
          ctx.strokeRect(OFFSET_X, OFFSET_Y, FIELD_W, FIELD_H);

          // Food
          drawCell(food.x, food.y, COLORS.food);
          ctx.fillStyle = "#0b1712";
          ctx.fillRect(
            OFFSET_X + food.x * CELL + SEGMENT_PAD + Math.floor(SEGMENT_SIZE * 0.25),
            OFFSET_Y + food.y * CELL + SEGMENT_PAD + Math.floor(SEGMENT_SIZE * 0.25),
            Math.floor(SEGMENT_SIZE * 0.5),
            Math.floor(SEGMENT_SIZE * 0.5)
          );

          // Frog bonus
          if (frog) {
            drawCell(frog.x, frog.y, COLORS.frog);
            ctx.fillStyle = "#0c1a13";
            const frogX = OFFSET_X + frog.x * CELL + SEGMENT_PAD;
            const frogY = OFFSET_Y + frog.y * CELL + SEGMENT_PAD;
            const eye = Math.max(1, Math.floor(SEGMENT_SIZE * 0.16));
            ctx.fillRect(frogX + eye, frogY + eye, eye, eye);
            ctx.fillRect(frogX + SEGMENT_SIZE - eye * 2, frogY + eye, eye, eye);
          }

          // Snake
          snake.forEach((segment, index) => {
            drawCell(segment.x, segment.y, index === 0 ? COLORS.snakeHead : COLORS.snakeBody);
          });

          // Snake head details (eyes + mouth animation + tongue)
          if (snake.length > 0) {
            const head = snake[0];
            const hx = OFFSET_X + head.x * CELL + SEGMENT_PAD;
            const hy = OFFSET_Y + head.y * CELL + SEGMENT_PAD;
            const eye = Math.max(1, Math.floor(SEGMENT_SIZE * 0.18));
            const mouth = Math.max(2, Math.floor(SEGMENT_SIZE * 0.18));

            ctx.fillStyle = "#1b1b1b";
            if (dir.x !== 0) {
              ctx.fillRect(hx + Math.floor(SEGMENT_SIZE * 0.24), hy + eye, eye, eye);
              ctx.fillRect(hx + Math.floor(SEGMENT_SIZE * 0.24), hy + SEGMENT_SIZE - eye * 2, eye, eye);
            } else {
              ctx.fillRect(hx + eye, hy + Math.floor(SEGMENT_SIZE * 0.24), eye, eye);
              ctx.fillRect(hx + SEGMENT_SIZE - eye * 2, hy + Math.floor(SEGMENT_SIZE * 0.24), eye, eye);
            }

            // Mouth opens briefly when eating.
            if (justAteFrames > 0) {
              ctx.fillStyle = "#2d2d2d";
              if (dir.x === 1) ctx.fillRect(hx + SEGMENT_SIZE - mouth, hy + Math.floor(SEGMENT_SIZE * 0.35), mouth, mouth);
              if (dir.x === -1) ctx.fillRect(hx, hy + Math.floor(SEGMENT_SIZE * 0.35), mouth, mouth);
              if (dir.y === 1) ctx.fillRect(hx + Math.floor(SEGMENT_SIZE * 0.35), hy + SEGMENT_SIZE - mouth, mouth, mouth);
              if (dir.y === -1) ctx.fillRect(hx + Math.floor(SEGMENT_SIZE * 0.35), hy, mouth, mouth);
              justAteFrames -= 1;
            } else {
              ctx.fillStyle = "#3a3a3a";
              if (dir.x === 1) ctx.fillRect(hx + SEGMENT_SIZE - 1, hy + Math.floor(SEGMENT_SIZE * 0.44), 1, mouth);
              if (dir.x === -1) ctx.fillRect(hx, hy + Math.floor(SEGMENT_SIZE * 0.44), 1, mouth);
              if (dir.y === 1) ctx.fillRect(hx + Math.floor(SEGMENT_SIZE * 0.44), hy + SEGMENT_SIZE - 1, mouth, 1);
              if (dir.y === -1) ctx.fillRect(hx + Math.floor(SEGMENT_SIZE * 0.44), hy, mouth, 1);
            }
          }

          // Overlay states
          if (!started || gameOver) {
            ctx.fillStyle = COLORS.overlay;
            ctx.fillRect(OFFSET_X, OFFSET_Y, FIELD_W, FIELD_H);
            ctx.fillStyle = COLORS.text;
            ctx.textAlign = "center";
            if (!started && !gameOver) {
              ctx.fillStyle = "rgba(28, 28, 28, 0.92)";
              const cardW = Math.min(460, FIELD_W - 40);
              const cardH = 210;
              const cardX = VIEW_W / 2 - cardW / 2;
              const cardY = VIEW_H / 2 - cardH / 2;
              ctx.fillRect(cardX, cardY, cardW, cardH);
              ctx.strokeStyle = "#5e5e5e";
              ctx.lineWidth = 2;
              ctx.strokeRect(cardX, cardY, cardW, cardH);

              ctx.fillStyle = "#f2f0ea";
              ctx.font = "bold 28px Consolas, monospace";
              ctx.fillText("DX SNAKES", VIEW_W / 2, cardY + 46);
              ctx.font = "15px Consolas, monospace";
              ctx.fillText("Press S to Start", VIEW_W / 2, cardY + 92);
              ctx.fillText("or click Start Game button", VIEW_W / 2, cardY + 118);
              ctx.fillText("Use Up/Down to turn after start", VIEW_W / 2, cardY + 154);
            } else {
              ctx.fillStyle = "rgba(28, 28, 28, 0.92)";
              const cardW = Math.min(430, FIELD_W - 40);
              const cardH = 190;
              const cardX = VIEW_W / 2 - cardW / 2;
              const cardY = VIEW_H / 2 - cardH / 2;
              ctx.fillRect(cardX, cardY, cardW, cardH);
              ctx.strokeStyle = "#5e5e5e";
              ctx.lineWidth = 2;
              ctx.strokeRect(cardX, cardY, cardW, cardH);

              ctx.fillStyle = "#f2f0ea";
              ctx.font = "bold 24px Consolas, monospace";
              ctx.fillText("DEV SCORE CARD", VIEW_W / 2, cardY + 36);
              ctx.font = "15px Consolas, monospace";
              ctx.fillText("Score : " + score + "  |  High : " + high, VIEW_W / 2, cardY + 82);
              ctx.fillText("Review: bitten by production bugs.", VIEW_W / 2, cardY + 116);
              ctx.fillText("Press R or click Restart", VIEW_W / 2, cardY + 148);
            }
            ctx.textAlign = "start";
          }
        };

        const tick = () => {
          step();
          draw();
        };

        const startLoop = () => {
          if (timerId) {
            clearInterval(timerId);
          }
          timerId = setInterval(tick, stepMs);
        };

        window.addEventListener("keydown", (event) => {
          if ((event.key === "s" || event.key === "S") && !started && !gameOver) {
            startGame();
          } else if (event.key === "s" || event.key === "S") {
            useSlowOnce();
          }
          if (event.key === "ArrowUp") rotateSnake(-1);
          if (event.key === "ArrowDown") rotateSnake(1);
          if (event.key === "r" || event.key === "R") resetGame();

          if (["ArrowUp", "ArrowDown", "r", "R", "s", "S", " "].includes(event.key)) {
            event.preventDefault();
          }
        });

        restartBtn.addEventListener("click", () => {
          resetGame();
          canvas.focus();
        });
        restartTopBtn.addEventListener("click", () => {
          resetGame();
          canvas.focus();
        });
        startBtn.addEventListener("click", () => {
          startGame();
          canvas.focus();
        });
        slowBtn.addEventListener("click", () => {
          useSlowOnce();
          canvas.focus();
        });
        canvas.addEventListener("click", () => canvas.focus());
        window.addEventListener("resize", () => {
          applyResponsiveCanvas();
          draw();
        });
        window.addEventListener("error", (e) => {
          showError("Runtime error: " + e.message);
        });

        applyResponsiveCanvas();
        updateHud();
        resetGame(false);
        canvas.focus();
      } catch (error) {
        showError("Failed to initialize game: " + String(error));
      }
    })();
  </script>
</body>
</html>`;
}
