// USER HANDLING LOGIC:
// 1. - each user is identified by their username
// 2. - each user can have multiple socket connections (e.g. multiple browser tabs) at the same time
//    - all socket connections for a user should show the same state (e.g. same room)
//    - when a new socket connection is made for a user, it is added to that user's set of socket IDs,
//      and subscribed to the same room as the other sockets for that user
// 3. - each user can be in at most one room at a time
// 4. - if a user isn't in any game room, it is placed in a default "lobby" room (room ID 1)
//    - default "lobby" room sends updates about available game rooms
// 5. - game room sends updates about the game state to all users in that room
// 6. - these updates should be fully trusted, that is frontend must listen to these updates and show what they say
//    - frontend should not try to maintain its own version of the game state and make decisions based on that
//    - frontend should only send user actions (e.g. "choose answer") to the server, and let the server handle the game logic
//    - these updates will be broadcast frequently (20 times per second) to ensure all clients are in sync
// 7. - when a user signs in with a new socket connection, frontend should wait for the next update from the server
//    - if the next update indicates the user is in a game room, frontend should show the game room UI
//    - if the next update indicates the user is in the lobby, frontend should show the lobby UI

import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { TICK_RATE, Room } from '../models/Room.js';

export default class UserManager {
  constructor(io) {
    // socket.io server instance
    this.io = io;

    // random room name generator
    this.roomNameGen = () =>
      uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
        length: 2,
      });

    this.lobbyRoomId = 1; // ID of the lobby room
    this.lastGameRoomId = 1; // last assigned game room ID (1 is reserved for lobby)

    this.userToSocketIDs = new Map(); // map of username to socket IDs
    this.userToRoomID = new Map(); // map of username to room ID
    this.roomIDToRoom = new Map(); // map of room ID to Room instance
    this.roomNameToRoomID = new Map(); // map of room name to room ID

    // start lobby update loop
    this.lobbyUpdateInterval = setInterval(() => this.sendLobbyUpdate(), 1000 / TICK_RATE);
  }

  sendLobbyUpdate() {
    const availableRooms = [];
    for (const room of this.roomIDToRoom.values()) {
      if (room.isPrivate === false && room.players.size < room.capacity) {
        availableRooms.push({
          name: room.name,
          playerCount: room.players.size,
          capacity: room.capacity,
          questionSets: room.questionSets,
        });
      }
    }
    this.io.to(this.lobbyRoomId).emit('stateUpdate', {
      type: 'lobby',
      rooms: availableRooms,
    });
  }

  // connect a user's socket
  connectUser(username, socket) {
    // Add socket ID to the user's set of socket IDs
    const userSockets = this.userToSocketIDs.get(username) || new Set();
    userSockets.add(socket.id);
    this.userToSocketIDs.set(username, userSockets);

    // connect new user's socket to their existing room if applicable
    const userRoomId = this.userToRoomID.get(username);
    if (userRoomId) {
      socket.join(userRoomId);
      const room = this.roomIDToRoom.get(userRoomId);
      if (room) {
        room.update(); // push current room state immediately to the newly connected socket
      }
    } else {
      socket.join(this.lobbyRoomId);
      this.sendLobbyUpdate(); // push lobby state immediately
    }

    // register socket event handlers

    // disconnect event
    socket.on('disconnect', () => this.disconnectUser(username, socket.id));

    // room management events
    socket.on('joinRoom', (roomName) => this.joinRoom(username, roomName));
    socket.on('createRoom', (roomCapacity, roomIsPrivate, roomQuestionSetsIDs) =>
      this.createRoom(username, roomCapacity, roomIsPrivate, roomQuestionSetsIDs)
    );
    socket.on('leaveRoom', () => this.leaveRoom(username));

    // game action events
    socket.on('submitAnswer', (answerIndex) => this.submitAnswer(username, answerIndex));
    socket.on('chooseQuestion', (questionIndex, attackedUsername) =>
      this.chooseQuestion(username, questionIndex, attackedUsername)
    );
    socket.on('startGame', () => this.startGame(username));
    socket.on('closeEndOfGameStats', () => this.closeEndOfGameStats(username));
  }

  // disconnect a user's socket
  disconnectUser(username, socketId) {
    const userSockets = this.userToSocketIDs.get(username);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.userToSocketIDs.delete(username);
      }
    }
  }

  // create a new room and join the user to it
  createRoom(username, roomCapacity, roomIsPrivate, roomQuestionSetsIDs) {
    if (this.userToRoomID.has(username)) {
      return;
    }

    // enforce valid capacity: 1 for singleplayer, 2-4 for multiplayer (F-10, F-27)
    if (roomCapacity < 1 || roomCapacity > 4) {
      return;
    }

    const roomId = ++this.lastGameRoomId;
    let roomName = this.roomNameGen();
    while (this.roomNameToRoomID.has(roomName)) {
      roomName = this.roomNameGen();
    }
    this.roomNameToRoomID.set(roomName, roomId);
    const room = new Room(
      this.io,
      roomId,
      roomName,
      roomCapacity,
      roomIsPrivate,
      roomQuestionSetsIDs
    );
    this.roomIDToRoom.set(roomId, room);

    this.joinRoom(username, roomName);
  }

  // join the user to an existing room
  joinRoom(username, roomName) {
    const roomId = this.roomNameToRoomID.get(roomName);
    if (!roomId) {
      return;
    }
    if (!roomId) {
      return;
    }
    const room = this.roomIDToRoom.get(roomId);

    if (!this.userToRoomID.get(username) && room.addPlayer(username)) {
      this.userToRoomID.set(username, roomId);
      for (const socketId of this.userToSocketIDs.get(username) || []) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(this.lobbyRoomId);
          socket.join(roomId);
        }
      }
    }
  }

  // remove the user from their current room
  leaveRoom(username) {
    const roomId = this.userToRoomID.get(username);
    if (roomId && roomId !== this.lobbyRoomId) {
      const room = this.roomIDToRoom.get(roomId);
      room.removePlayer(username);
      this.userToRoomID.delete(username);
      for (const socketId of this.userToSocketIDs.get(username) || []) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(roomId);
          socket.join(this.lobbyRoomId);
        }
      }
      // delete empty rooms
      if (room.playerCount === 0) {
        this.roomIDToRoom.delete(roomId);
        this.roomNameToRoomID.delete(room.name);
      }
    }
  }

  // handle game action - answer submission
  submitAnswer(username, answerIndex) {
    const roomId = this.userToRoomID.get(username);
    if (!roomId) {
      return;
    }
    const room = this.roomIDToRoom.get(roomId);
    room.submitAnswer(username, answerIndex);
  }

  // handle game action - choose question
  chooseQuestion(username, questionIndex, attackedUsername) {
    const roomId = this.userToRoomID.get(username);
    if (!roomId) {
      return;
    }
    const room = this.roomIDToRoom.get(roomId);
    room.chooseQuestion(username, questionIndex, attackedUsername);
  }

  // handle game action - start game
  startGame(username) {
    const roomId = this.userToRoomID.get(username);
    if (!roomId) {
      return;
    }
    const room = this.roomIDToRoom.get(roomId);
    room.startGame();
  }

  // handle game action - close end-of-game stats
  closeEndOfGameStats(username) {
    const roomId = this.userToRoomID.get(username);
    if (!roomId) {
      return;
    }
    const room = this.roomIDToRoom.get(roomId);
    room.closeEndOfGameStats(username);
  }
}
