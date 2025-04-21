const socket = io();

var $status = $('#status')
var $pgn = $('#pgn')
var $blackPlayer = $('#blackPlayer')
var $whitePlayer = $('#whitePlayer')

let board = null
let game = new Chess()

let gameHasStarted = false;
let gameStalled = false;
let spectating = false;

//Game Functions
function onDragStart (source, piece, position, orientation) {
    if (game.game_over()) return false
    if (!gameHasStarted) return false;
    if (gameStalled) return false;
    if (spectating) return false;

    if ((playerColor === 'black' && piece.search(/^w/) !== -1) || (playerColor === 'white' && piece.search(/^b/) !== -1)) {
        return false;
    }

    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop (source, target) {
    let theMove = {
        from: source,
        to: target,
        promotion: 'q'
    };

    let move = game.move(theMove);

    if (move === null) return 'snapback'

    socket.emit('move', theMove);

    updateStatus()
}

socket.on('newMove', function(move) {
    game.move(move);
    board.position(game.fen());
    updateStatus();
});

function onSnapEnd () {
    board.position(game.fen())
}

function updateStatus () {
    let status = ''

    let moveColor = 'White'
    if (game.turn() === 'b') {
        moveColor = 'Black'
    }

    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    else if (game.in_draw()) {
        status = 'Game over, drawn position'
    }

    else if (gameStalled) {
        status = 'Opponent disconnected'
    }

    else if (!gameHasStarted) {
        status = 'Waiting for black to join'
    }

    else {
        status = moveColor + ' to move'

        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
        
    }

    $status.html(status)
    $pgn.html(game.pgn())
}
//

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
    $whitePlayer.html("Loading..");
    $blackPlayer.html(user ? user: "Guest");
} else {
    $whitePlayer.html(user ? user: "Guest");
    $blackPlayer.html("Loading..");
}

updateStatus()

var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('code')) {
    socket.emit('joinGame', {
        code: urlParams.get('code'),
    });
}

socket.on('startGame', function(whitePlayer, blackPlayer) {
    gameHasStarted = true;
    playerColor == 'white' ? $blackPlayer.html(blackPlayer) : $whitePlayer.html(whitePlayer)
    updateStatus();
});

socket.on('spectateGame', function(whitePlayer, blackPlayer, fen) {
    spectating = true;
    gameHasStarted = true;

    game.load(fen);
    board.position(game.fen());
    updateStatus();
})

socket.on('gameOverDisconnect', function() {
    gameStalled = true;
    updateStatus()
}); 