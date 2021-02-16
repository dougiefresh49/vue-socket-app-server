const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: true
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// list of users mapped by ip
const users = {};

io.on("connection", (socket) => {
  const address = socket.handshake.headers["x-forwarded-for"].split(",")[0];
  console.log(address);
  console.log(`User connected from ip: ${address}`);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  function getFlattenedUsers() {
    return Object.entries(users).map(([id, user]) => ({
      id,
      ...user
    }));
  }

  socket.on("login", (user) => {
    const ip = socket.handshake.headers["x-forwarded-for"].split(",")[0];
    console.log(`user logged in: ${user} from ${ip}`);
    users[ip] = user;
    io.emit("user list updated", getFlattenedUsers());
  });

  socket.on("reconnected", () => {
    console.log("A user has reconnected");
    io.emit("user list updated", getFlattenedUsers());
  });
});

http.listen(8080, () => {
  console.log("listening on *:8080");
});
