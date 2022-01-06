const socket = io()

//Elements
const mform = document.querySelector("form")
const mformInput = document.querySelector("input")
const mformButton = document.querySelector("button")
const lbutton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffet = $messages.scrollTop + visibleHeight

    if(containerHeight- newMessageHeight <= scrollOffet){
        $messages.scrollTop =$messages.scrollHeight
    }

}
socket.on("all", (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on("locationMessage",(message)=>{
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        location:message.location,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()

})

socket.on("room-data", ({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

mform.addEventListener("submit",(e)=>{
    e.preventDefault()
    mformButton.setAttribute('disabled', 'disabled')
    const search = e.target.elements.message
    socket.emit("sendMessage",search.value,(error)=>{
        mformButton.removeAttribute('disabled')
        mformInput.value = ""
        mformInput.focus()
        if(error){
            return console.log(error)
        }
            console.log("message delivered")
        
    })
})

document.querySelector("#send-location").addEventListener("click",()=>{
    if (!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }
    lbutton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        const location={
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit("sendLocation", location, ()=>{
            lbutton.removeAttribute('disabled')
            console.log("Location shared !!")
        })
    })
})

socket.emit('join', {username, room},(error)=>{
    if(error){
        alert(error)
        location.href = "/"
    }

})
