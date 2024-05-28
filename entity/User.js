class User {
    constructor(id, username, socketId, createdAt, updatedAt) {
        this.id = id;
        this.username = username;
        this.socketId = socketId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = User;