const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: true,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// list of users mapped by ip
const users = {};

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("login", (user) => {
    console.log(`inside login - ${socket.request.connection.remoteAddress}`);
    const ip = socket.request.connection.remoteAddress;
    console.log(`new usersip: ${ip}`);
    users[ip] = user;

    const flatUsers = Object.entries(users).map(([id, user]) => ({
      id,
      ...user,
    }));
    io.emit("user list updated", flatUsers);
  });
});

http.listen(8080, () => {
  console.log("listening on *:8080");
});
