import {_actions, _screenHeight, _screenWidth} from './model/constants/const.js';
import {Fruit} from './model/fruit.js';

function bootstrapGame() {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: _screenWidth,
      height: _screenHeight
    }
  };

  const observers = [];

  function start() {
    const frequency = 2000;

    setInterval(addFruit, frequency);
  }

  function subscribe(observerFunction) {
    observers.push(observerFunction);
  }

  function notifyAll(command) {
    observers.forEach(observer => observer(command));
  }

  function setState(newState) {
    Object.assign(state, newState);
  }

  const random = (val) => Math.floor(Math.random() * val);
  const randomScreenWidth = () => random(state.screen.width);
  const randomScreenHeight = () => random(state.screen.height);

  function addPlayer(command) {
    const playerId = command.playerId;
    const playerX = 'playerX' in command ? command.playerX : randomScreenWidth();
    const playerY = 'playerY' in command ? command.playerY : randomScreenHeight();

    state.players[playerId] = {
      x: playerX,
      y: playerY
    };

    notifyAll({
      type: _actions.addPlayer,
      playerId: playerId,
      playerX: playerX,
      playerY: playerY
    })
  }

  function removePlayer(command) {
    const playerId = command.playerId

    delete state.players[playerId]

    notifyAll({
      type: _actions.removePlayer,
      playerId: playerId
    })
  }

  function addFruit(command) {
    const fruit = new Fruit(
        command ? command.fruitId : Math.floor(Math.random() * 10000000),
        command ? command.fruitX : randomScreenWidth(),
        command ? command.fruitY : randomScreenHeight()
    )

    state.fruits[fruit.id] = {
      x: fruit.x,
      y: fruit.y
    }

    notifyAll({
      type: _actions.addFruit,
      fruitId: fruit.id,
      fruitX: fruit.x,
      fruitY: fruit.y
    })
  }

  function removeFruit(command) {
    const fruitId = command.fruitId;

    delete state.fruits[fruitId];
    notifyAll({
      type: _actions.removeFruit,
      fruitId: fruitId
    })
  }

  function movePlayer(command) {
    notifyAll(command);

    const acceptedMoves = {
      ArrowUp(player){
        if (player.y -1 >= 0) {
          player.y--;
        }
      },
      ArrowRight(player) {
        if (player.x + 1 < state.screen.width) {
          player.x++;
        }
      },
      ArrowDown(player) {
        if (player.y + 1 < state.screen.height) {
          player.y++;
        }
      },
      ArrowLeft(player) {
        if (player.x - 1 >= 0) {
          player.x--;
        }
      }
    }

    const keyPressed = command.keyPressed;
    const playerId = command.playerId;
    const player = state.players[playerId];
    const moveFunction = acceptedMoves[keyPressed];

    if (player && moveFunction) {
      moveFunction(player);
      checkForFruitCollision(playerId);
    }
  }

  function checkForFruitCollision(playerId) {
    const player = state.players[playerId];

    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId]
      console.log(`Checking ${playerId} and ${fruitId}`)

      if (player.x === fruit.x && player.y === fruit.y) {
        console.log(`COLLISION between ${playerId} and ${fruitId}`)
        removeFruit({ fruitId: fruitId })
      }
    }
  }

  return {
    addPlayer,
    removePlayer,
    movePlayer,
    addFruit,
    removeFruit,
    state,
    setState,
    subscribe,
    start
  }
}

export default bootstrapGame;
