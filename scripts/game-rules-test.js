function rotateIndex(current, delta, len) {
  return (current + delta + len) % len;
}

function stepSnake(head, dir, cols, rows) {
  const next = { x: head.x + dir.x, y: head.y + dir.y };
  const hitWall = next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows;
  return { next, hitWall };
}

function applySlowOnce(state) {
  if (state.slowUsed) return { ...state };
  return {
    ...state,
    slowUsed: true,
    stepMs: Math.min(260, state.stepMs + 40),
    speedLevel: Math.max(1, state.speedLevel - 1),
    score: Math.max(0, state.score - 10)
  };
}

function computeLayout(viewW, viewH) {
  const baseCell = Math.max(14, Math.floor(Math.min(viewW / 28, viewH / 17)));
  const cell = baseCell;
  const cols = Math.max(20, Math.floor(viewW / cell));
  const rows = Math.max(12, Math.floor(viewH / cell));
  const fieldW = cols * cell;
  const fieldH = rows * cell;
  const offsetX = Math.floor((viewW - fieldW) / 2);
  const offsetY = Math.floor((viewH - fieldH) / 2);
  return { cell, cols, rows, fieldW, fieldH, offsetX, offsetY };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  // Rotation rules for Up/Down control.
  assert(rotateIndex(0, -1, 4) === 3, "Up turn from right should face up");
  assert(rotateIndex(0, +1, 4) === 1, "Down turn from right should face down");

  // Wall collision behavior.
  const wall = stepSnake({ x: 0, y: 0 }, { x: -1, y: 0 }, 28, 17);
  assert(wall.hitWall === true, "Snake must die on wall hit");

  // In-bound move behavior.
  const ok = stepSnake({ x: 10, y: 10 }, { x: 0, y: -1 }, 28, 17);
  assert(ok.hitWall === false, "In-bound move must continue");
  assert(ok.next.y === 9, "Y movement should decrease by 1");

  // Slow once behavior.
  const initial = { slowUsed: false, stepMs: 170, speedLevel: 2, score: 35 };
  const once = applySlowOnce(initial);
  assert(once.slowUsed, "Slow should become used");
  assert(once.stepMs === 210, "Slow should increase stepMs once");
  assert(once.speedLevel === 1, "Speed level should not go below 1");
  assert(once.score === 25, "Score should reduce by 10");

  const twice = applySlowOnce(once);
  assert(twice.stepMs === 210, "Second slow use should have no effect");
  assert(twice.score === 25, "Second slow use should not reduce score");

  // Layout bounds behavior (small, normal, very large screens).
  const small = computeLayout(800, 500);
  assert(small.offsetX >= 0 && small.offsetY >= 0, "Small layout must stay within frame");
  assert(small.fieldW <= 800 && small.fieldH <= 500, "Small layout should not overflow");

  const normal = computeLayout(1366, 768);
  assert(normal.offsetX >= 0 && normal.offsetY >= 0, "Normal layout must stay within frame");
  assert(normal.fieldW <= 1366 && normal.fieldH <= 768, "Normal layout should not overflow");

  const large = computeLayout(2560, 1440);
  assert(large.offsetX >= 0 && large.offsetY >= 0, "Large layout must stay within frame");
  assert(large.fieldW <= 2560 && large.fieldH <= 1440, "Large layout should not overflow");

  console.log("All game rule tests passed.");
}

run();
