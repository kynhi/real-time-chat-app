var PORT = process.env.PORT || 8000;
//var rounter = require(http)
var moment = require('moment');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connect = require('./public/js/dbconnect.js')
var chatSchema = require('./public/js/chat.model.js');
const mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers (socket) {
	var info = clientInfo[socket.id];
	var users = [];

	if (typeof info === 'undefined') {
		return;
	}

	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];

		if (info.room === userInfo.room) {
			users.push(userInfo.name);
		}
	});

	let message = {
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment().valueOf()
	}
	socket.emit('message', message);
	savetoAtlas(info.room, message)
}
//function to save data to Atlas
function savetoAtlas(room,message){
	let chat = mongoose.model(room, chatSchema,room)
	let newMessage = new chat(message)
	newMessage.save()
}

io.on('connection', function (socket) {
	console.log('User connected via socket.io!');

	socket.on('disconnect', function () {
		var userData = clientInfo[socket.id];

		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			let message = {
				name: 'System',
				text: userData.name + ' has left!',
				timestamp: moment().valueOf()
			}
			io.to(userData.room).emit('message', message );
			savetoAtlas(userData.room,message)
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);

		let pastmessages   = mongoose.model(req.room, chatSchema).find({}, function(err,docs){
			docs.forEach( (pastmessage) =>{
				let pmessage = {
					name: pastmessage.name,
					text: pastmessage.text,
					timestamp: pastmessage.timestamp
				}
				socket.emit('pastMessage', pmessage);	
			})
		}).then( ()=>{
				let message = {
					name: 'System',
					text: req.name + ' has joined!',
					timestamp: moment().valueOf()
				}
				socket.broadcast.to(req.room).emit('message', message);			
				savetoAtlas(req.room,message)
			})

		// mongoose.connection.db.collection(req.room, function (err, collection) {
		// 	console.log(collection.find())
		// 	collection.forEach( pastmessage =>{
		// 		let message = {
		// 			name: pastmessage.name,
		// 			text: pastmessage.text,
		// 			timestamp: moment.format(pastmessage.timestamp)
		// 		}
		// 		socket.broadcast.to(req.room).emit('message', message);	
		// 	})
		// });

	});

	socket.on('message', function (message) {
		console.log('Message received: ' + message.text);

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);	
			savetoAtlas(clientInfo[socket.id].room, message)
		}
	});

	// timestamp property - JavaScript timestamp (milliseconds)

	socket.emit('message', {
		name: 'System',
		text: 'Welcome to the chat application!',
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function () {
	console.log('Server started!');
});