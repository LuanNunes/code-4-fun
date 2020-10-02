import {_actions} from './model/constants/const';

export function createKeyboardListener(document) {
  const state = {
    observers: [],
    playerId: null
  }

  function registerPlayerId(playerId) {
    state.playerId = playerId;
  }

  function subscribe(observerFunction) {
    state.observers.push(observerFunction);
  }

  function notifyAll(command) {
    for(const observer of state.observers) {
      observer(command);
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  function handleKeyDown(event) {
    const keyPressed = event.key;

    const command = {
      type: _actions.movePlayer,
      playerId: state.playerId,
      keyPressed
    };

    notifyAll(command);
  }

  return {
    subscribe,
    registerPlayerId
  }
}
