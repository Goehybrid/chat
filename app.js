'use strict';

var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var usernames = [];

server.listen(process.env.PORT || 3000);

app.get("/",(req,res) => {
	res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", (socket) => {
	socket.on("new user", (data,callback) => {
		if(usernames.indexOf(data) != -1){
			// the username is already taken
			callback(false);
		} else {
			// the username is available
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
		}
	});
	
	//update usernames
	function updateUsernames(){
		io.sockets.emit('usernames', usernames);
	}
	
	// send message event
	socket.on("send message", (data) => {
		io.sockets.emit("new message", {msg: data, user:socket.username});
	});
	
	// disconnect
	socket.on("disconnect", (data) => {
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames();
	})
});