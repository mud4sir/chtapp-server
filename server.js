const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(3000, {
  cors: ["http://localhost:8080", "https://admin.socket.io"],
});

const userIo = io.of("/user");

userIo.on("connection", (socket) => {
  console.log(`connected to user namespace of id: ${socket.username}`);
});

userIo.use((socket, next) => {
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  } else {
    next(new Error("no token provided"));
  }
});

const getUsernameFromToken = function (token) {
  return token;
};

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("send-message", (message, room) => {
    if (!room) {
      socket.broadcast.emit("receive-message", message);
    } else {
      socket.to(room).emit("receive-message", message);
    }
  });

  socket.on("join-room", (room, callBack) => {
    socket.join(room);
    callBack(`Joined room: ${room}`);
  });
});

instrument(io, { auth: false });
