const socket = io();

let gameHasStarted = false;
var board = null
var game = new Chess()
var $status = $('#status')
var $pgn = $('#pgn')
let gameStalled = false;

var $opponent = $('#opponent')
$opponent.html("Loading..")

//Game Functions
function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false
    if (!gameHasStarted) return false;
    if (gameStalled) return false;

    if ((playerColor === 'black' && piece.search(/^w/) !== -1) || (playerColor === 'white' && piece.search(/^b/) !== -1)) {
        return false;
    }

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop (source, target) {
    let theMove = {
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for simplicity
    };
    // see if the move is legal
    var move = game.move(theMove);


    // illegal move
    if (move === null) return 'snapback'

    socket.emit('move', theMove);

    updateStatus()
}

socket.on('newMove', function(move) {
    game.move(move);
    board.position(game.fen());
    updateStatus();
});

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
    board.position(game.fen())
}

function updateStatus () {
    var status = ''

    var moveColor = 'White'
    if (game.turn() === 'b') {
        moveColor = 'Black'
    }

    // checkmate?
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
        postGame(game.pgn())
    }

    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position'
        postGame(game.pgn())
    }

    else if (gameStalled) {
        status = 'Opponent disconnected'
        postGame(game.pgn())
    }

    else if (!gameHasStarted) {
        status = 'Waiting for black to join'
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
        
    }

    $status.html(status)
    $pgn.html(game.pgn())
}

//Server Requests
function postGame(pgn) {
    if (pgn == null) return;
    fetch(window.location.origin + "/match", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: pgn
    })
    .then((response) => response.text())
    .then((data) => {
        console.log(data);
    });
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png'
}
board = Chessboard('myBoard', config)
if (playerColor == 'black') {
    board.flip();
}

updateStatus()

var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('code')) {
    socket.emit('joinGame', {
        code: urlParams.get('code'),
        username: username
    });
}

socket.on('startGame', function(whitePlayer, blackPlayer) {
    gameHasStarted = true;
    $opponent.html(playerColor == 'white' ? whitePlayer : blackPlayer)
    updateStatus()
});

socket.on('gameOverDisconnect', function() {
    gameStalled = true;
    updateStatus()
}); 