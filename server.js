const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server);

let waitingPlayer = null;

io.on("connection", (socket) => {

    if (waitingPlayer) {
        const room = "room-" + socket.id;

        socket.join(room);
        waitingPlayer.join(room);

        io.to(room).emit("start", {
            room,
            players: {
                [waitingPlayer.id]: "red",
                [socket.id]: "blue"
            },
            turn: "red"
        });

        waitingPlayer = null;
    } else {
        waitingPlayer = socket;
        socket.emit("waiting");
    }

    socket.on("move", ({ room, move, player }) => {
        socket.to(room).emit("move", { move, player });
    });

});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Servidor rodando");
});
