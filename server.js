const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const userS = [], userI = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) =>{
	res.redirect(`/${uuidV4()}`);  
 })

app.get('/:room', (req, res) =>{
	let addRoomId = req.params.room;
    console.log(addRoomId);
	res.render('room',{roomId: `${addRoomId}` }); 
})

io.on('connection', socket =>{

	socket.on('join-room',(roomId, userId) =>{
	
		userS.push(socket.id);
		userI.push(userId);
	
		console.log("room Id:- " + roomId,"userId:- "+ userId);     
		socket.join(roomId);                                       
		socket.broadcast.to(roomId).emit('user-connected',userId); 
		
	
	    socket.on('removeUser', (sUser, rUser)=>{
	    	var i = userS.indexOf(rUser);
	    	if(sUser == userI[0]){
	    	  console.log("SuperUser Removed"+rUser);
	    	  socket.broadcast.to(roomId).emit('remove-User', rUser);
	    	}
	    });


		socket.on('message', (message,yourName) =>{
			io.to(roomId).emit('createMessage',message,yourName);
			
		})

	    socket.on('disconnect', () =>{
	    
	    	var i = userS.indexOf(socket.id);
	    	userS.splice(i, 1);
            socket.broadcast.to(roomId).emit('user-disconnected', userI[i]);
    
            userI.splice(i, 1);
	    });
	    socket.on('seruI', () =>{
	    	socket.emit('all_users_inRoom', userI);

		    console.log(userI);
	    });  
	})
	
})

server.listen(process.env.PORT||3030)