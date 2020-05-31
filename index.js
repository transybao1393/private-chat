var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
const redis = require('socket.io-redis');
// io.adapter(redis({ host: 'localhost', port: 6379 }));
const {
    has
} = require('lodash');

app.use(express.static(__dirname + '/public'))
// app.use(express.static(__dirname + '/views'))
app.get('/', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/home', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});

let users = {};
//- send message to all user
io.on('connection', function(socket){
    console.log('a user connected');
    //- when disconnect
    socket.on('disconnect', function(){
        console.log(`deleted ${socket.nickname}`);
        // socket.emit('logged out user', socket.nickname);
        socket.broadcast.emit('logged out user', socket.nickname);
        delete users[socket.nickname];
        console.log('users...', users);
    });
    
    //- login - set nickname - update socket id 
    socket.on('login', (data) => {
        // check nickname or set new
        if(!has(users, data.nickname))
        {
            users[data.nickname] = {
                nickname: data.nickname,
                loggedInDate: data.loggedInDate,
                socketId: socket.id
            };
            data.socketId = socket.id;
            // users[data.nickname] = data.socketId = socket.id;
            socket.nickname = data.nickname;
            console.log('added new socket id', users);
            //- broadcast to all socket
            socket.emit('all logged in user', users);
            socket.broadcast.emit('login user nickname', data);
        }else{
            console.log('this user is already online...');
        }
        // console.log('users...', users);
    });

    socket.on('private chat', ({message, friendNickName}) => {
        // socket.broadcast.to(users[friendNickName]).emit('chat_message', message);
        io.in(users[friendNickName].socketId).emit('chat_message', {from: socket.nickname, message, dateTime: new Date()});
    });

});

server.listen(3000, function(){
  console.log('listening on *:3000');
});