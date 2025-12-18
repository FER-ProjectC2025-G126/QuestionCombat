export default class UserManager {
    constructor(io) {
        this.io = io;
        this.lastRoomId = 1;
        this.userToSocketIDs = new Map();  // Map of username to socket IDs
        this.userToRoom = new Map();       // Map of username to room ID
        this.roomIdToRoom = new Map();     // Map of room ID to Room instance
    }

    connectUser(username, socket) {
        console.log(`UserManager: User ${username} connected with socket ID ${socket.id}`);

        socket.on('disconnect', () => this.disconnectUser(username, socket));

        socket.on("createRoom", () => this.createRoom(username, socket));
        socket.on("joinRoom", (roomId) => this.joinRoom(username, socket));
        socket.on("leaveRoom", () => this.leaveRoom(username, socket));

        socket.on("chooseAnswer", (answerIndex) => {});
        socket.on("chooseQuestion", (questionIndex) => {});
    }

    disconnectUser(username, socket) {
        console.log(`UserManager: User ${username} disconnected from socket ID ${socket.id}`);
    }

    createRoom() {

    }

    joinRoom() {

    }

    leaveRoom() {

    }
}
