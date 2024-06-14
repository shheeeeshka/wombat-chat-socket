import { Server } from "socket.io";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 5000;
const io = new Server({ cors: process.env.CLIENT_URL });

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log('new connection: ' + socket.id);

    socket.on("addNewUser", (userId) => {
        !onlineUsers.some(user => user.userId === userId) &&
            onlineUsers.push({ userId, socketId: socket.id });

        console.log({ onlineUsers });
        io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("sendMessage", (msg) => {
        const user = onlineUsers.find(user => user.userId === msg.recipientId);

        if (user) {
            io.to(user.socketId).emit("getMessage", msg);
        }
    });

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    });
});

io.listen(PORT);