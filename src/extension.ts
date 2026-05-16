import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand("dxSnakes.startGame", () => {
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
  });

  context.subscriptions.push(command);
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
      --bg: #151813;
      --screen: #9bbc0f;
      --screen-dark: #8bac0f;
      --pixel-dark: #0f380f;
      --pixel-mid: #306230;
      --pixel-light: #8bac0f;
      --panel: #1f241d;
      --text: #dce8b2;
      --muted: #b7c781;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: "Lucida Console", "Courier New", monospace;
      height: 100%;
      overflow: hidden;
    }

    .container {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 8px;
      height: 100vh;
      padding: 10px;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      padding: 8px 10px;
      border: 1px solid #3a4230;
      background: var(--panel);
      border-radius: 8px;
    }

    .hint {
      color: var(--muted);
      font-size: 12px;
    }

    .stats {
      display: flex;
      gap: 16px;
      font-size: 14px;
    }

    .pill {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #5f7048;
      background: #252b20;
    }

    canvas {
      width: 100%;
      height: 100%;
      border: 10px solid #2f3629;
      border-radius: 8px;
      background: var(--screen);
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      outline: none;
    }

    .footer {
      padding: 8px 10px;
      border: 1px solid #3a4230;
      background: var(--panel);
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 12px;
      color: var(--muted);
    }

    .kbd {
      display: inline-block;
      border: 1px solid #5f7048;
      border-bottom-width: 2px;
      border-radius: 4px;
      padding: 1px 6px;
      color: var(--text);
      background: #252b20;
      margin: 0 2px;
    }

    .btn {
      background: #3f4c30;
      color: var(--text);
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
    }

    .btn:hover {
      background: #4e5d3b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="topbar">
      <div>
        <strong>DX Snakes</strong>
        <div class="hint">Nokia-style classic snake for VS Code.</div>
      </div>
      <div class="stats">
        <div class="pill">Score: <span id="score">0</span></div>
        <div class="pill">High: <span id="high">0</span></div>
        <div class="pill">Speed: <span id="speed">1</span></div>
      </div>
    </div>
    <canvas id="game" width="900" height="540" tabindex="0" aria-label="Nokia snake game area"></canvas>
    <div class="footer">
      <div>
        Move <span class="kbd">↑</span><span class="kbd">↓</span><span class="kbd">←</span><span class="kbd">→</span> or
        <span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span>.
        Pause <span class="kbd">P</span>, Restart <span class="kbd">R</span>.
      </div>
      <button class="btn" id="restartBtn" type="button">Restart</button>
    </div>
  </div>

  <script>
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("score");
    const highEl = document.getElementById("high");
    const speedEl = document.getElementById("speed");
    const restartBtn = document.getElementById("restartBtn");

    const COLS = 28;
    const ROWS = 17;
    const CELL = Math.floor(Math.min(canvas.width / COLS, canvas.height / ROWS));
    const FIELD_W = COLS * CELL;
    const FIELD_H = ROWS * CELL;
    const OFFSET_X = Math.floor((canvas.width - FIELD_W) / 2);
    const OFFSET_Y = Math.floor((canvas.height - FIELD_H) / 2);

    let snake = [];
    let dir = { x: 1, y: 0 };
    let queuedDir = { x: 1, y: 0 };
    let food = { x: 0, y: 0 };
    let score = 0;
    let high = Number(localStorage.getItem("dxSnakesHighScore") || "0");
    let gameOver = false;
    let paused = false;
    let started = false;
    let stepMs = 170;
    let speedLevel = 1;
    let lastStep = performance.now();

    function resetGame() {
      snake = [
        { x: 6, y: 8 },
        { x: 5, y: 8 },
        { x: 4, y: 8 }
      ];
      dir = { x: 1, y: 0 };
      queuedDir = { x: 1, y: 0 };
      score = 0;
      stepMs = 170;
      speedLevel = 1;
      gameOver = false;
      paused = false;
      started = false;
      lastStep = performance.now();
      spawnFood();
      updateHud();
    }

    function updateHud() {
      scoreEl.textContent = String(score);
      highEl.textContent = String(high);
      speedEl.textContent = String(speedLevel);
    }

    function isCellOnSnake(x, y) {
      return snake.some((part) => part.x === x && part.y === y);
    }

    function spawnFood() {
      if (snake.length >= COLS * ROWS) {
        // All cells filled: treat as a completed run.
        gameOver = true;
        return;
      }
      let x = 0;
      let y = 0;
      do {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
      } while (isCellOnSnake(x, y));
      food = { x, y };
    }

    function setDirection(nextX, nextY) {
      // Nokia rule: no immediate 180-degree turn.
      if (nextX === -dir.x && nextY === -dir.y) return;
      queuedDir = { x: nextX, y: nextY };
      started = true;
    }

    function step() {
      if (gameOver || paused || !started) return;

      dir = queuedDir;
      const head = snake[0];
      const next = { x: head.x + dir.x, y: head.y + dir.y };

      // Classic collision with walls ends the game.
      if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
        gameOver = true;
        if (score > high) {
          high = score;
          localStorage.setItem("dxSnakesHighScore", String(high));
        }
        updateHud();
        return;
      }

      if (isCellOnSnake(next.x, next.y)) {
        gameOver = true;
        if (score > high) {
          high = score;
          localStorage.setItem("dxSnakesHighScore", String(high));
        }
        updateHud();
        return;
      }

      snake.unshift(next);

      if (next.x === food.x && next.y === food.y) {
        score += 5;
        if (score % 25 === 0) {
          speedLevel += 1;
          stepMs = Math.max(70, stepMs - 10);
        }
        if (score > high) {
          high = score;
          localStorage.setItem("dxSnakesHighScore", String(high));
        }
        spawnFood();
      } else {
        snake.pop();
      }
      updateHud();
    }

    function drawCell(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(
        OFFSET_X + x * CELL + 1,
        OFFSET_Y + y * CELL + 1,
        CELL - 2,
        CELL - 2
      );
    }

    function drawGrid() {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--screen");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--screen-dark");
      ctx.fillRect(OFFSET_X, OFFSET_Y, FIELD_W, FIELD_H);

      ctx.strokeStyle = "rgba(15, 56, 15, 0.12)";
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

      // Border walls.
      ctx.lineWidth = 3;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--pixel-dark");
      ctx.strokeRect(OFFSET_X, OFFSET_Y, FIELD_W, FIELD_H);
    }

    function drawSnake() {
      snake.forEach((part, index) => {
        const shade = index === 0 ? "var(--pixel-dark)" : "var(--pixel-mid)";
        drawCell(part.x, part.y, shade);
      });
    }

    function drawFood() {
      drawCell(food.x, food.y, "var(--pixel-dark)");
      ctx.fillStyle = "var(--pixel-light)";
      ctx.fillRect(
        OFFSET_X + food.x * CELL + Math.floor(CELL / 3),
        OFFSET_Y + food.y * CELL + Math.floor(CELL / 3),
        Math.floor(CELL / 3),
        Math.floor(CELL / 3)
      );
    }

    function drawOverlay() {
      if (!gameOver && !paused && started) return;
      ctx.fillStyle = "rgba(15,56,15,0.42)";
      ctx.fillRect(OFFSET_X, OFFSET_Y, FIELD_W, FIELD_H);

      ctx.fillStyle = "var(--pixel-dark)";
      ctx.textAlign = "center";
      ctx.font = "bold 34px 'Lucida Console', monospace";

      if (!started) {
        ctx.fillText("SNAKE", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "18px 'Lucida Console', monospace";
        ctx.fillText("Press Arrow Keys to Start", canvas.width / 2, canvas.height / 2 + 18);
      } else if (paused) {
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = "18px 'Lucida Console', monospace";
        ctx.fillText("Press P to Resume", canvas.width / 2, canvas.height / 2 + 24);
      } else if (gameOver) {
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "18px 'Lucida Console', monospace";
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 14);
        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 40);
      }
      ctx.textAlign = "start";
    }

    function tick(now) {
      if (now - lastStep >= stepMs) {
        lastStep += stepMs;
        step();
      }
      drawGrid();
      drawFood();
      drawSnake();
      drawOverlay();
      requestAnimationFrame(tick);
    }

    // Restore persistent high score with new key.
    high = Number(localStorage.getItem("dxSnakesHighScore") || "0");

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") setDirection(0, -1);
      if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") setDirection(0, 1);
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") setDirection(-1, 0);
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") setDirection(1, 0);

      if (event.key === "p" || event.key === "P") {
        paused = !paused;
      }
      if (event.key === "r" || event.key === "R") {
        resetGame();
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
      }
      updateHud();
    });

    restartBtn.addEventListener("click", () => {
      resetGame();
      canvas.focus();
    });

    canvas.addEventListener("click", () => canvas.focus());

    resetGame();
    canvas.focus();
    requestAnimationFrame(tick);
  </script>
</body>
</html>`;
}
