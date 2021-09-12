require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

const cors = require('cors')

app.use(cors({
  origin: '*'
}))
app.use(express.json());
app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});
let rooms = []
let users = {}
app.get('/rooms', (req, res) => {
  res.send(rooms)
})

io.on('connection', (socket) => {
  console.log("New client connected");

  socket.on("new message", (msg) => {
    console.log('msg: ' + msg, " - to: " + users[socket.id]);
    socket.broadcast.to(users[socket.id]).emit('new message', msg)
    console.log(io.sockets.adapter.rooms);
  })

  socket.on('create', (name) => {
    const roomid = name
    rooms.push(roomid)
    users[socket.id] = { room: roomid, name }
    socket.join(roomid)
    socket.emit('joined', { roomid, owner: true })
    io.emit('new room', roomid)
    console.log(name + ' created room ' + roomid);
  })

  socket.on("join", ({ room, name }) => {
    console.log(name + ' joined room: ' +room);
    socket.join(room)
    const partner = users[Object.keys(users).find(user => users[user].room === room)].name
    console.log(partner);
    socket.emit('joined', { roomid: room, owner: false, partner })
    socket.broadcast.to(room).emit('p2 join', name)
    users[socket.id] = { room, name }
  })

  socket.on("play", (data) => {
    socket.broadcast.to(users[socket.id].room).emit('play', data)
  })

  socket.on("replay", (data) => {
    socket.broadcast.to(users[socket.id].room).emit('replay', data)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (!users[socket.id]) return
    let room = users[socket.id].room
    if (socket.id in users) delete users[socket.id]
    let numUsers = 0
    Object.keys(users).forEach(key => {
      if (users[key].room === room) numUsers++
    })
    console.log(numUsers);
    if (numUsers === 0) {
      console.log('removing room');
      rooms = rooms.filter(item => item !== room)
      io.emit('remove room', room)
    }
    else if(numUsers === 1){
      socket.broadcast.to(room).emit('p2 disconnect')
    }
    
  });
});


const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(PORT, () => {
  console.log('listening on ' + PORT);
});
