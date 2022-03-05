const canvas = document.getElementById("canvas");
const timer = document.getElementById("timer");
const wordinput = document.getElementById("word");
const guess = document.getElementById("guess");
const guesshistory = document.querySelector(".guesshistory");
const scorecard = document.querySelector(".scoreboardfetched");
const currentdrawer = document.getElementById("currentdrawer");
const part1 = document.getElementById("landingpage");
const part2 = document.getElementById("layout");
const submit = document.getElementById("submit");
canvas.height = window.innerHeight * 0.9;
canvas.width = window.innerWidth * 0.6;
const timerbutton = document.getElementById('timerr');
const words = ["pen", "caterpillar", "rocket", "alligator", "pizza", "shirt", "kite", "eyes", "chair", "cup", "jacket", "hippo", "bird", "monster", "bracelet", "coat", "balloon", "dinosaur", "head", "book", "mouse", "smile", "bridge", "blocks", "milk", "eye", "oval", "snowflake", "broom", "cheese", "lion", "lips", "beach", "cloud", "bus", "elephant", "sunglasses", "lemon", "star", "spoon", "boat", "turtle", "drum", "doll", "ant", "motorcycle", "bike", "pencil", "bunkbed", "moon", "inchworm", "slide", "hat", "cat", "tail", "helicopter", "square", "Mickey-Mouse", "octopus", "door", "table", "egg", "bell", "nose", "spider", "horse", "finger", "glasses", "jar", "girl", "ear", "lizard", "flower", "snowman", "baby", "car", "bread", "blanket", "apple", "bench", "skateboard", "pig", "icecream-cone", "frog", "feet", "lollipop", "heart", "ears", "bed", "carrot", "person", "boy", "train", "truck", "bug", "legs", "bowl", "lamp", "desk", "purse", "light", "mountain", "snail", "basketball", "orange", "bear", "chicken", "grass", "cookie", "clock", "ghost", "spider-web", "ocean", "monkey", "shoe", "dog", "face", "circle", "water", "butterfly", "house", "robot", "mouth", "branch", "worm", "socks", "grapes", "crab", "banana", "computer", "bee", "whale", "seashell", "snake", "sun", "swing", "bat", "pie", "wheel", "bunny", "hand", "cherry", "jellyfish", "tree", "stairs", "duck", "leaf", "dragon", "giraffe", "ball", "pants", "ring", "airplane", "candle", "cow", "cupcake", "football", "hamburger", "bone", "corn"];
var wordoptions = [];
const optionssection = document.querySelector('.wordsoptions');
var cturn = {};
var scorelists = {};
var username;

// socket config
const socket = io('http://localhost:8000');

// Getting name
verifyusername = (e) => {
    let userspace = document.getElementById('username');
    username = document.getElementById('username').value;
    if (username == "" || username.length == null || username.match(/^\s+$/)) {
        alert("Name must be filled out");
        userspace.focus();
        return false;
    } else {
        e;
        socket.emit('new-user-joined', username);
        console.log("username")
        part2.classList.remove('hidden');
        part1.classList.add('hidden');
    }
}
part2.classList.add('hidden');
submit.addEventListener("keypress", (event) => {
    if (event.key === 'Enter') {
        verifyusername(event.preventDefault());
    }
})
submit.addEventListener("click", (e) => {
    verifyusername(e.preventDefault());
})



// Chat message loading
const append = (message, status) => {
    const messageelement = document.createElement('div');
    messageelement.innerText = message;
    messageelement.classList.add('guessed');
    messageelement.classList.add(`${status}`)
    guesshistory.prepend(messageelement);
}

// Scoreboard filling
socket.on('scores', scorecardfs=>{
    scorelists = scorecardfs
})
const scorelist = () => {
    scorecard.innerHTML = ""
    for (var key in scorelists) {
        var value = scorelists[key];
        const scoreelement = document.createElement('div');
        scoreelement.innerHTML = `<div class="scoreboard">
                 <img src="user.png" class="scoreboard" />
            <h1>${key} : ${value}</h1>
              </div>`;
        scorecard.appendChild(scoreelement);
    }
}

socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'false')
})

socket.on('recieve', data => {
    console.log(data)
    data.name == username ? append(`You : ${data.message}`, `${data.status}`) : data.status==true ? append(`${data.name} : Guessed the word`, `${data.status}`) : append(`${data.name} : ${data.message}`, `${data.status}`)
})

socket.on('left', name => {
    delete users[socket.id]
    scorelist();
    append(`${name} left the room`, 'false')
})


const ctx = canvas.getContext("2d")

// Canvas Data Sending
let sendDrawing = () => {
    var imgData0 = canvas.toDataURL();
    socket.emit('senddrawing', imgData0);
}

// Canvas Data Recieving
socket.on('drawdata', imgData => {
    var myImage = new Image();
    myImage.src = imgData;
    myImage.onload = () => {
        ctx.drawImage(myImage, 0, 0);
    }
})

// Permission to draw & Turns setting html
let permitted = false;
let usercurrenturn;
socket.on('turns', usercurrentturnfs => {
    wordinput.innerHTML = "";
    usercurrentturn = usercurrentturnfs;
    if (usercurrentturnfs == username) {
        // Selected word emit settings
        insertwords();
        timerbutton.classList.remove("hidden")
        permitted = true;
        console.log("You");
        currentdrawer.innerHTML = "You are drawing";
    } else {
        optionssection.innerHTML = ""
        timerbutton.classList.add("hidden")
        console.log(usercurrentturnfs)
        currentdrawer.innerHTML = `${usercurrentturn} is drawing`;
        permitted = false
    }
})

// Changing turns
// Condition 1 : Timer runs out
// Condition 2 : Everyone guessed
// Both conditions are implemeneted but for starting round button is kept for now
timerbutton.addEventListener("click", () => {
    socket.emit('nextturn');
    socket.emit('turnlist');
})

// Checking for everyone guessed and timeup
socket.on('nextturn', ()=>{
    socket.emit('nextturn')
    socket.emit('turnlist')
})
socket.on('timeup', ()=>{
    alert("Sorry, timeup next turn")
})

// Clearing screen on new turn
socket.on('clearscreen', ()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
})

// Round over notification
socket.on('newround', round=>{
    append(`Round : ${round}`, 'false')
})

// Buttons for choosing words
let insertwords = () => {
    optionssection.innerHTML = ""
    for (let i = 0; i < 3; i++) {
        var choice = Math.floor(Math.random() * 101);
        var temp = words[choice];
        wordoptions.push(words[choice]);
        const wordelement = document.createElement('div');
        wordelement.innerHTML += `<div class="wordbuttons">
                 <input type="button" class="wordbutton" value=${temp} id="word${i}">
              </div>`;
        optionssection.appendChild(wordelement);
    }
    chooseword();
}

// Button choose mechanism
let chooseword = () =>{
    const word1 = document.getElementById('word0');
    const word2 = document.getElementById('word1');
    const word3 = document.getElementById('word2');
    let buttonchose = false;
    let choosedword;
        word1.addEventListener('click', () => {
            if(buttonchose==true){}else{
                buttonchose = true;
                choosedword = word1.value;
                sendselectedword(choosedword);
                optionssection.innerHTML = ""
                wordinput.innerHTML ="Your word:" +"\"" + choosedword + "\"&nbsp;&nbsp;"
            }
        })
        word2.addEventListener('click', () => {
            if(buttonchose==true){}else{
                buttonchose = true;
                choosedword = word2.value;
                sendselectedword(choosedword);
                optionssection.innerHTML = ""
                wordinput.innerHTML ="Your word:" +"\"" + choosedword + "\"&nbsp;&nbsp;"
            }
        })
        word3.addEventListener('click', () => {
            if(buttonchose==true){}else{
                buttonchose = true;
                choosedword = word3.value;
                sendselectedword(choosedword);
                optionssection.innerHTML = ""
                wordinput.innerHTML ="Your word:" +"\"" + choosedword + "\"&nbsp;&nbsp;"
            }
        })
    }

// Send the selected button to server
let sendselectedword = (selectedword) =>{
    socket.emit('wordselected', selectedword)
    socket.emit('bword')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    socket.emit('starttimer');
}

// Making blanks of words
socket.on('cword', word=>{
    console.log(word);
    console.log(permitted);
    permitted==true ? wordinput.innerHTML+="" : wordfeeder(word)
})

let wordfeeder = (word)=>{ for (let w = 0; w < word.length; w++) {wordinput.innerHTML += "_ "}}

// Timeout functionality
socket.on('timestatus', ctime=>{
    console.log("time")
    timer.innerHTML="00:"+ctime;
})


// Word correct checker and message sender to other
let guessbutton = document.querySelector(".checkans")
guessbutton.addEventListener("click", () => {
    submitchat();
})

guessbutton.addEventListener("keypress", (event) => {
    if (event.key === 'Enter') {
        submitchat();
    }
})

// Submitting chat
let submitchat = () => {
    const message = guess.value;
    if (guess.value == "" || guess.value == null) {

    } else {
        socket.emit('send', message);
        console.log('message sent')
        guess.value = "";
    }
}

// Drawing logic
let prevX = null
let prevY = null
ctx.lineWidth = 5

let draw = false;

let clrs = document.querySelectorAll(".clr")
clrs = Array.from(clrs)
clrs.forEach(clr => {
    clr.addEventListener("click", () => {
        ctx.strokeStyle = clr.dataset.clr
    })
})
let wdth = document.querySelectorAll(".wdth")
wdth = Array.from(wdth)
wdth.forEach(wdth => {
    wdth.addEventListener("click", () => {
        ctx.lineWidth = wdth.dataset.wdth
    })
})

let clearBtn = document.querySelector(".clear")
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
})

window.addEventListener("mousedown", (e) => draw = true)
window.addEventListener("mouseup", (e) => draw = false)

window.addEventListener("mousemove", (e) => {
    socket.emit('userlist');
    socket.emit('scorecard');
    scorelist();

    if (e.clientX <= window.innerWidth * 0.06 || e.clientX >= window.innerWidth * 0.8 || e.clientY <= window.innerHeight * 0.1 || e.clientY >= window.innerHeight * 0.955 || !permitted) {
        draw = false;
    } else {
        if (prevX == null || prevY == null || !draw) {
            prevX = e.clientX - window.innerWidth * 0.184
            prevY = e.clientY - window.innerHeight * 0.16

            return
        }

        let currentX = e.clientX - window.innerWidth * 0.184
        let currentY = e.clientY - window.innerHeight * 0.16

        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(currentX, currentY)
        ctx.stroke()

        prevX = currentX
        prevY = currentY
        sendDrawing();
    }
})
