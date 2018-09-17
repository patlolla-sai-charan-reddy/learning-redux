export function generateThreads(fnGenerator, fn) {
  let threads = [];
  for (let o of fnGenerator()) {
    threads.push(fn(o));
  }
  return threads;
}

export function* findWins() {
  // Horizontal lines
  yield [[0, 0], [0, 1], [0, 2]];
  yield [[1, 0], [1, 1], [1, 2]];
  yield [[2, 0], [2, 1], [2, 2]];

  // Vertical lines
  yield [[0, 0], [1, 0], [2, 0]];
  yield [[0, 1], [1, 1], [2, 1]];
  yield [[0, 2], [1, 2], [2, 2]];

  // Diagonal
  yield [[0, 0], [1, 1], [2, 2]];
  yield [[0, 2], [1, 1], [2, 0]];
}

export const matchAny = (inputEvent, [x1, x2, x3]) => (event, [x, y] = []) =>
  event === inputEvent &&
  ((x === x1[0] && y === x1[1]) ||
    (x === x2[0] && y === x2[1]) ||
    (x === x3[0] && y === x3[1]));
