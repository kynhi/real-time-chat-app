var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();
var messageBackground = true;
console.log(name + ' wants to join ' + room);

// Update h1 tag
jQuery('.room-title').text(room);

socket.on('connect', function () {
	console.log('Conncted to socket.io server!');
	socket.emit('joinRoom', {
		name: name,
		room: room
	});
});

socket.on('message', function (message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $messages = jQuery('.messages');
	var $message
	if (messageBackground){
		$message = jQuery('<li class="list-group-item" style="background-color: #808080;" ></li>');
		messageBackground =!messageBackground;
	} else {
		$message = jQuery('<li class="list-group-item"></li>');
		messageBackground =!messageBackground;
	}

	console.log('New message:');
	console.log(message.text);

	$message.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a') + '</strong></p>');
	$message.append('<p>' + message.text + '</p>');
	$messages.append($message);
});

socket.on('pastMessage', function (message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $messages = jQuery('.messages');
	var $message
	if (messageBackground){
		$message = jQuery('<li class="list-group-item" style="background-color: #808080;" ></li>');
		messageBackground =!messageBackground;
	} else {
		$message = jQuery('<li class="list-group-item"></li>');
		messageBackground =!messageBackground;
	}
	console.log('Past message:');
	console.log(message.text);

	$message.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a') + '</strong></p>');
	$message.append('<p>' + message.text + '</p>');
	$messages.append($message);
});

// Handles submitting of new message
var $form = jQuery('#message-form');

$form.on('submit', function (event) {
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		name: name,
		text: $message.val()
	});

	$message.val('');
});