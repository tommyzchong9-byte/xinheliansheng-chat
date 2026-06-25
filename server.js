const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 5e6 // 5MB for images
});

const PORT = process.env.PORT || 8080;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Image upload via multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// State
const rooms = {
  '综合': { messages: [], description: '欢迎来到新和联胜！' },
  '工作': { messages: [], description: '工作交流区' },
  '闲聊': { messages: [], description: '随便聊聊' },
  '图片': { messages: [], description: '分享图片' },
};

// username -> { socketId, room, color, joinedAt }
const onlineUsers = new Map();

const userColors = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7'];
let colorIndex = 0;

function getRoomUsers(room) {
  const users = [];
  onlineUsers.forEach((u, name) => {
    if (u.room === room) users.push({ name, color: u.color });
  });
  return users;
}

function getAllOnlineUsers() {
  const users = [];
  onlineUsers.forEach((u, name) => {
    users.push({ name, color: u.color, room: u.room });
  });
  return users;
}

io.on('connection', (socket) => {
  let currentUser = null;
  let currentRoom = null;

  socket.on('join', ({ username, room }) => {
    if (!username || !room || !rooms[room]) return;

    // Handle duplicate usernames
    if (onlineUsers.has(username)) {
      const existing = onlineUsers.get(username);
      if (existing.socketId !== socket.id) {
        username = username + '_' + Math.floor(Math.random() * 100);
      }
    }

    currentUser = username;
    currentRoom = room;

    const color = userColors[colorIndex % userColors.length];
    colorIndex++;

    onlineUsers.set(currentUser, { socketId: socket.id, room, color, joinedAt: Date.now() });
    socket.join(room);

    // Send history
    socket.emit('history', rooms[room].messages.slice(-100));

    // Send room list and all users
    socket.emit('roomList', Object.keys(rooms).map(r => ({
      name: r,
      description: rooms[r].description,
      count: getRoomUsers(r).length
    })));

    socket.emit('userConfirmed', { username: currentUser, color });
    socket.emit('onlineUsers', getAllOnlineUsers());

    // Notify room
    const sysMsg = {
      id: Date.now(),
      type: 'system',
      text: `${currentUser} 加入了频道`,
      timestamp: new Date().toISOString(),
      room
    };
    rooms[room].messages.push(sysMsg);
    io.to(room).emit('message', sysMsg);
    io.emit('onlineUsers', getAllOnlineUsers());
    io.emit('roomUserCount', { room, count: getRoomUsers(room).length });
  });

  socket.on('switchRoom', ({ room }) => {
    if (!rooms[room] || !currentUser) return;

    const oldRoom = currentRoom;
    socket.leave(oldRoom);

    // Update user room
    const userData = onlineUsers.get(currentUser);
    if (userData) {
      userData.room = room;
      onlineUsers.set(currentUser, userData);
    }

    currentRoom = room;
    socket.join(room);

    socket.emit('history', rooms[room].messages.slice(-100));
    socket.emit('switchedRoom', room);

    io.emit('onlineUsers', getAllOnlineUsers());
    io.emit('roomUserCount', { room: oldRoom, count: getRoomUsers(oldRoom).length });
    io.emit('roomUserCount', { room, count: getRoomUsers(room).length });
  });

  socket.on('sendMessage', ({ text, room }) => {
    if (!currentUser || !text?.trim() || !rooms[room]) return;
    const msg = {
      id: Date.now() + Math.random(),
      type: 'text',
      username: currentUser,
      color: onlineUsers.get(currentUser)?.color || '#333',
      text: text.trim().slice(0, 2000),
      timestamp: new Date().toISOString(),
      room
    };
    rooms[room].messages.push(msg);
    if (rooms[room].messages.length > 500) rooms[room].messages.shift();
    io.to(room).emit('message', msg);
  });

  socket.on('sendImage', ({ url, room }) => {
    if (!currentUser || !url || !rooms[room]) return;
    const msg = {
      id: Date.now() + Math.random(),
      type: 'image',
      username: currentUser,
      color: onlineUsers.get(currentUser)?.color || '#333',
      url,
      timestamp: new Date().toISOString(),
      room
    };
    rooms[room].messages.push(msg);
    if (rooms[room].messages.length > 500) rooms[room].messages.shift();
    io.to(room).emit('message', msg);
  });

  socket.on('disconnect', () => {
    if (!currentUser) return;
    onlineUsers.delete(currentUser);
    if (currentRoom && rooms[currentRoom]) {
      const sysMsg = {
        id: Date.now(),
        type: 'system',
        text: `${currentUser} 离开了频道`,
        timestamp: new Date().toISOString(),
        room: currentRoom
      };
      rooms[currentRoom].messages.push(sysMsg);
      io.to(currentRoom).emit('message', sysMsg);
    }
    io.emit('onlineUsers', getAllOnlineUsers());
    if (currentRoom) io.emit('roomUserCount', { room: currentRoom, count: getRoomUsers(currentRoom).length });
  });
});

server.listen(PORT, () => console.log(`新和联胜 running on port ${PORT}`));
