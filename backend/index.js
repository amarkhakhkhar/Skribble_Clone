const io = require('socket.io')(8000, {
    cors: {
        origin: '*',
    }
});

const users = {};
const players = [];
const scores = {};
let guessedusers = {};
var turns = [];
let current_turn = 0;
let round = 1;
let number_of_users = 0;
let selectedword;
let timerrtime;
let currenttimeloop = 0;
let orderofguess = 0;

io.on('connection', socket => {

    function arraycurrentturn() {
        // console.log(turns[current_turn]);
        return turns[current_turn];
    }

    function turnmover() {
        if (current_turn == (number_of_users - 1)) {
            round++
            socket.emit('newround', round);
            socket.broadcast.emit('newround', round);
            current_turn = 0;
        } else {
            current_turn++;
        }
    }


    // Timer
    var sec = 0;
    var stoptime = true;

    function startTimer() {
        if (stoptime == true) {
            stoptime = false;
            timerCycle();
        }
    }

    function timerCycle() {
        currenttimeloop++
        if (stoptime == false) {
            sec = parseInt(sec);
            timerrtime = (60 - sec)
            sec = sec + 1;
            if (sec == 60) {

                sec = 0;
                timerrtime = 0
                stopTimer();
                socket.emit('nextturn');
                socket.emit('turnlist');
                socket.emit('timeup')
                socket.emit('clearscreen')

                socket.broadcast.emit('clearscreen')
            }
            timwefunc = setTimeout(timerCycle, 1000);
        }
    }

    function stopTimer() {
        if (stoptime == false) {
            stoptime = true;
            clearTimeout(timwefunc)
        }
    }

    function resetTimer() {
        if (currenttimeloop == 0) {

        } else {
            clearTimeout(timwefunc)
        }
        stoptime = true;
        sec = 0;
    }



    // User Intialization
    socket.on('new-user-joined', name => {
        {
            socket.broadcast.emit('users', users)
            console.log('New-user', name)
            users[socket.id] = name;
            players[number_of_users] = name;
            turns.push(name);
            guessedusers[name] = false
            scores[users[socket.id]] = 0;
            // scores.push(name);
            number_of_users++;
            socket.broadcast.emit('user-joined', name)
            socket.emit('newround', round);
            socket.broadcast.emit('newround', round);
        }
    })

    // Getting selcted word
    socket.on('wordselected', word => {
        selectedword = word;
    })

    // Message mechanism
    socket.on('send', message => {
        // Matching guessed word with selected everytime chat is recieved
        let status;
        if (message == selectedword) {
            if (guessedusers[users.socketid] == true) {
                console.log("Already guessed")
            } else {
                orderofguess++;
                guessedusers[users[socket.id]] = true
                scores[users[socket.id]] += ((number_of_users) - orderofguess) * 100;
            }
            if (orderofguess == number_of_users - 1) {
                orderofguess = 0;
                for (var key in guessedusers) {
                    guessedusers[key] = false;
                }
                socket.emit('nextturn');
                socket.emit('clearscreen')
                socket.broadcast.emit('clearscreen')
                socket.emit('turnlist');
            }
            status = true
        } else {
            status = false
        }
        socket.emit('recieve', { message: message, name: users[socket.id], status: status })
        socket.broadcast.emit('recieve', { message: message, name: users[socket.id], status: status })
    })

    // Sending selected word for blanks creation
    socket.on('bword', () => {
        socket.broadcast.emit('cword', selectedword);
        socket.emit('cword', selectedword);
    })

    // Timeout functionality
    socket.on('starttimer', () => {
        resetTimer();
        startTimer();
        // resettimer();
        emitter = setInterval(emitting, 1000)
    })

    let emitting = () => {
        let timestatus = timerrtime;
        socket.emit('timestatus', timestatus),
            socket.broadcast.emit('timestatus', timestatus)
    }

    // Disconnect mechanism
    socket.on('disconnect', message => {
        let usertobedeleted = users[socket.id];
        for (i = 0; i < number_of_users; i++) {
            if (turns[i] == usertobedeleted) {
                // console.log(current_turn)
                // console.log(i)
                if (current_turn == i) {
                    turnmover()
                }
                turns.splice(i, 1);
                number_of_users--;
            }
        }

        let currentuser = arraycurrentturn();
        socket.emit('turns', currentuser)
        socket.broadcast.emit('turns', currentuser)
        socket.broadcast.emit('users', users)
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];

    })

    // Drawing sending
    socket.on('senddrawing', imgData => {
        socket.broadcast.emit('drawdata', imgData);
    })

    // Turn list sender
    socket.on('turnlist', message => {
        let currentuser = arraycurrentturn();
        socket.emit('turns', currentuser)
        socket.broadcast.emit('turns', currentuser)
    })

    // Turns mover
    socket.on('nextturn', () => {
        turnmover();
    })

    // Scorecard passing
    socket.on('scorecard', () => {
        socket.broadcast.emit('scores', scores)
    })

})


