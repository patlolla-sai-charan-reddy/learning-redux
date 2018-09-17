import 'regenerator-runtime/runtime';

import { createStore, applyMiddleware } from 'redux';
import createBehavioralMiddleware from './bp-middleware';
import {
  findWins,
  generateThreads,
  matchAny
} from './utils';
const log = document.getElementById('log');

const threads = [
  function* blockOverflowingBoard() {
    yield {
      block: [
        function(event, payload) {
          if (payload && payload.length) {
            return payload[0] > 2 || payload[1] > 2;
          } else {
            return false;
          }
        }
      ]
    };
  },
  
  ...generateThreads(
    findWins,
    ([x1, x2, x3]) =>
      function* detectWinByX() {
        const eventFn = matchAny('X', [x1, x2, x3]);
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          request: ['XWins']
        };
      }
  ),
  ...generateThreads(
    findWins,
    ([x1, x2, x3]) =>
      function* detectWinByO() {
        const eventFn = matchAny('O', [x1, x2, x3]);
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          wait: [eventFn]
        };
        yield {
          request: ['OWins']
        };
      }
  ),
  ...generateThreads(
    function*() {
      const values = [0, 1, 2];
      for (var i = 0; i < values.length; i++) {
        for (var y = 0; y < values.length; y++) {
          yield [i, y];
        }
      }
    },
    ([x, y]) =>
      function* disallowSquareReuse() {
        const event = (e, payload) =>
          (e === 'X' || e === 'O') &&
          payload[0] === x &&
          payload[1] === y;
        yield {
          wait: [event]
        };
        yield {
          block: [event]
        };
      }
  ),
  function* enforcePlayerTurns() {
    while (true) {
      yield { wait: ['X'], block: ['O'] };
      yield { wait: ['O'], block: ['X'] };
    }
  },
  // Strategy
  ...generateThreads(
    function*() {
      const values = [0, 1, 2];
      for (var i = 0; i < values.length; i++) {
        for (var y = 0; y < values.length; y++) {
          yield [i, y];
        }
      }
    },
    ([x, y]) =>
      function* defaultMoves() {
        while (true) {
          yield {
            request: ['O'],
            payload: [x, y]
          };
        }
      }
  ),
  function* afterWinAllowOnlyReset() {
    while (true) {
      yield { wait: ['OWins', 'XWins'] };
      yield {
        wait: ['RESET'],
        block: ['X', 'O']
      };
    }
  },
  function* logger() {
    while (true) {
      yield {
        wait: [
          (event, payload) => {
            log.innerHTML =
              JSON.stringify({
                type: event,
                payload,
                bpThread: true
              }) +
              '\n' +
              log.innerHTML;
            return true;
          }
        ]
      };
    }
  }
];

const defaultState = [
  ['_', '_', '_'],
  ['_', '_', '_'],
  ['_', '_', '_']
];
const content = document.getElementById('content');

function reducer(state = defaultState, action) {
  if (action.type === 'RESET') {
    return defaultState;
  }
  let row, column;
  if (
    action.payload &&
    (action.type === 'X' || action.type === 'O')
  ) {
    row = action.payload[0];
    column = action.payload[1];

    let newState = JSON.parse(JSON.stringify(state));

    newState[row][column] = action.type;
    return newState;
  }
  return state;
}

const store = createStore(
  reducer,
  applyMiddleware(createBehavioralMiddleware(threads))
);

const render = () => {
  content.innerHTML = JSON.stringify(
    store.getState(),
    function(k, v) {
      if (v.length && v[0] instanceof Array) return v;
      if (v instanceof Array)
        return JSON.stringify(v).replace(/"/g, '');
      return v;
    },
    2
  );
};

store.subscribe(render);

render();
document
  .getElementById('dispatch')
  .addEventListener('click', () => {
    store.dispatch(
      JSON.parse(
        document.getElementById('action').value
      )
    );
  });
