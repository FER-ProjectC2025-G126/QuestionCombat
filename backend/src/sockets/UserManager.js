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


import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { TICK_RATE, Room } from "../models/Room.js";


export default class UserManager {
    constructor(io) {
        // socket.io server instance
        this.io = io;

        // random room name generator
        this.roomNameGen = () => uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: "-",
            length: 2,
        });
        this.usedRoomNames = new Set();

        this.lobbyRoomId = 1;     // ID of the lobby room
        this.lastGameRoomId = 1;  // last assigned game room ID (1 is reserved for lobby)

        this.userToSocketIDs = new Map();  // Map of username to socket IDs
        this.userToRoomID = new Map();     // Map of username to room ID
        this.roomIdToRoom = new Map();     // Map of room ID to Room instance

        this.lobbyUpdateInterval = setInterval(() => this.sendLobbyUpdate(), 1000 / TICK_RATE);
    }

    sendLobbyUpdate() {
        let availableRooms = [];
        for (const room of this.roomIdToRoom.values()) {
            if (room.isPrivate === false && room.playerCount < room.capacity) {
                availableRooms.push({
                    name: room.name,
                    id: room.id,
                    playerCount: room.playerCount,
                    capacity: room.capacity
                });
            }
        }
        this.io.to(this.lobbyRoomId).emit("stateUpdate", {
            type: "lobby",
            rooms: availableRooms
        });
    }

    connectUser(username, socket) {
        console.log(`User ${username} connected with socket ID ${socket.id}`);

        // Add socket ID to the user's set of socket IDs
        const userSockets = this.userToSocketIDs.get(username) || new Set();
        userSockets.add(socket.id);
        this.userToSocketIDs.set(username, userSockets);

        // connect new user's socket to their existing room if applicable
        const userRoomId = this.userToRoomID.get(username);
        if (userRoomId) {
            socket.join(userRoomId);
        } else {
            socket.join(this.lobbyRoomId);
        }

        socket.on('disconnect', () => this.disconnectUser(username, socket.id));

        socket.on("createRoom", () => this.createRoom(username, socket));
        socket.on("joinRoom", (roomId) => this.joinRoom(username, roomId));
        socket.on("leaveRoom", () => this.leaveRoom(username, socket));

        socket.on("submitAnswer", (answerIndex) => {});
        socket.on("chooseQuestion", (questionIndex) => {});
    }

    // Disconnect a user's socket
    disconnectUser(username, socketId) {
        console.log(`UserManager: User ${username} disconnected from socket ID ${socketId}`);

        const userSockets = this.userToSocketIDs.get(username);
        if (userSockets) {
            userSockets.delete(socketId);
            if (userSockets.size === 0) {
                this.userToSocketIDs.delete(username);
            }
        }
    }

    createRoom() {

    }

    joinRoom(username, roomId) {
        this.userToRoomID.set(username, roomId);
        for (const socketId of this.userToSocketIDs.get(username) || []) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                socket.join(roomId);
            }
        }
    }

    leaveRoom() {

    }
}
