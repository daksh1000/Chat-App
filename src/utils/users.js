const users = []

//addUser, removeUser, getUser, getUserInRoom

const addUser = ({id, username, room})=>{
    // Clean the data
    username = username.trim().toLowerCase()
    room  = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error : "Username and room are required!"
        }
    }

    //Check for existing user
    const existingUser = users.find((user)=>{
        return user.room == room && user.username ==username
    })

    //Validating username
    if(existingUser){
        return {
            error: "Username is in use!"
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id == id)

    if (id!==-1){
        return users.splice(index, 1)[0]
    }
}



const getUser = (id)=>{
    const user = users.find((user)=>{
        return user.id === id
    })
   
    return user
}

const getUserInRoom = (room)=>{
    const user = users.filter((user)=>{
        return user.room === room
    }) 

    return user
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}