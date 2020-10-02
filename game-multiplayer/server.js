import express from 'express';
import http from 'http';
import socketio from 'socket.io';

import createGame from './src/bootstrap.game.js';
import {_actions} from './src/model/constants/const.js';

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static('src'));
app.use(express.static('src/model/constants/const.js'));

const game = createGame();
game.start();

game.subscribe((command) => {
  console.log(`> Emitting ${command.type}`);
  sockets.emit(command.type, command);
});

sockets.on(_actions.connection, (socket) => {
  const playerId = socket.id;
  console.log(`> Player connected: ${playerId}`);

  game.addPlayer({playerId: playerId});
  socket.emit('setup', game.state);

  socket.on(_actions.disconnect, () => {
    game.removePlayer({ playerId: playerId })
    console.log(`> Player disconnected: ${playerId}`);
  });

  socket.on(_actions.movePlayer, (command) => {
    command.playerId = playerId;
    command.type = _actions.movePlayer;

    game.movePlayer(command);
  });
});


server.listen(3000, () => {
  console.log(`> Server listening on port: 3000`);
});
