const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateLocationMessage} = require("./utils/messages")
const {addUser, removeUser, getUser, getUserInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT||3000
const publicDirectoryPath = path.join(__dirname,'../public')

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))

// let count=0
io.on("connection",(socket)=>{
    // console.log("new WebSocket connection")
    

    socket.on("join",({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("all", generateMessage("Admin","Welcome"))
        socket.broadcast.to(user.room).emit("all", generateMessage("Admin",`${user.username} has joined!`))
        io.to(user.room).emit("room-data",{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()
    })
    socket.on("sendMessage",(val,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(val)){
            return callback("Profanity is not allowed")
        }
        io.to(user.room).emit("all",generateMessage(user.username, val))
        callback()
    })

    socket.on("sendLocation", (location,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`) )
        callback()
    })
    socket.on("disconnect", ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit("all",generateMessage("Admin",`${user.username} has left`))
            io.to(user.room).emit("room-data",{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
        
    })
})

server.listen(port,()=>{
    console.log("server started on port", port)
})