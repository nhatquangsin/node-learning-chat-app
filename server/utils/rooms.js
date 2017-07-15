[{
    name: 'banana'
}]

class Rooms {
    constructor () {
        this.rooms = [];
    }
    addRoom (name) {
        var room = {name};
        this.rooms.push(room);
        return room;
    }
    removeRoom (name) {
        var room = this.getRoom(name);

        if (room) {
            this.rooms = this.rooms.filter((room) => rooms.name !== name);
        }

        return room;
    }
    getRoom (name) {
        return this.rooms.filter((room) => room.name === name)[0];
    }
    getRoomList () {
        var rooms = this.rooms.map((room) => room.name);

        return rooms;
    }
}

module.exports = {Rooms}