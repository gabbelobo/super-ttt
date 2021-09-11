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
app.get('/rooms', (req,res) => {
  res.send(rooms)
})

io.on('connection', (socket) => {
  console.log("New client connected");

  socket.on("new message", (msg) => {
    console.log('msg: ' + msg, " - to: " + users[socket.id]);
    socket.broadcast.to(users[socket.id]).emit('new message', msg)
    console.log(io.sockets.adapter.rooms);
  })

  socket.on('create', ()=> {
    const roomid = socket.id + '$'
    rooms.push(roomid)
    users[socket.id] = roomid
    socket.join(roomid)
    socket.emit('joined', {roomid, owner: true})
    io.emit('new room', roomid)
  })

  socket.on("join", ({room}) => {
    console.log(room);
    socket.join(room)
    socket.emit('joined', {roomid: room, owner: false})
    users[socket.id] = room
  })

  socket.on("play", (data) => {
    socket.broadcast.to(users[socket.id]).emit('play', data)
  })

  socket.on("replay", (data) => {
    socket.broadcast.to(users[socket.id]).emit('replay', data)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    
    let room = users[socket.id]
    let numUsers = 0
    Object.keys(users).forEach(key => {
      if(users[key] === room ) numUsers++
    })
    if(numUsers > 0) {
      console.log('removing room');
      rooms = rooms.filter(item=> item !== room)
      io.emit('remove room', room)
    }
    if(socket.id in users) delete users[socket.id]
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
