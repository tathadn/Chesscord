const $whitePlayer = $('#whitePlayer'),
    $blackPlayer = $('#blackPlayer'),
    $pgn = $('#pgn'),
    $status = $('#status')

let user_disconnected = false,
    spectating = false,
    game_started = false,
    game_over = false

function onDragStart(source, piece, position, orientation) {
    if (spectating || game_over || !game_started || user_disconnected) return false;

    if ((playerColor === 'black' && piece.search(/^w/) !== -1) || (playerColor === 'white' && piece.search(/^b/) !== -1)) {
        return false;
    }

    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    let theMove = {
        from: source,
        to: target,
        promotion: 'q'
    };

    let move = game.move(theMove);

    if (move === null) return 'snapback';

    socket.emit('move', theMove);
    console.log("moved")

    updateStatus();
}

function onSnapEnd() {
    board.position(game.fen())
}

function updateStatus() {
    let status = '',
        moveColor = game.turn() == 'w' ? "White" : "Black"

    if (!game_started) {
        status = "Waiting on player"
    }
     else if (user_disconnected) {
        status = "Opponent disconnected"
    }
    else if (game.in_threefold_repetition()) {
        status = 'Game over by threefold repetition'
    }
    else if (game.in_draw()) {
        status = 'Game over, drawn position'
    }
    else if (game.in_stalemate()) {
        status = 'Game over, stalemate'
    }
    else if(game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }
    else {
        status = moveColor + " to move"

        if (game.in_check()) {
            status += ', check'
        }
    }

    $status.html(status)
    $pgn.html(game.pgn());
}

let config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png'
}

let game = new Chess();
board = Chessboard('myBoard', config);

if (playerColor == "black") {
    board.flip();
    $whitePlayer.html("Loading..");
    $blackPlayer.html(username ? username: "Guest");
} else {
    $whitePlayer.html(username ? username: "Guest");
    $blackPlayer.html("Loading..");
}

updateStatus();

console.log({code, join, playerColor, fen});
socket.emit('hello', {code: code, join: join, color: playerColor, fen: fen})

socket.on('newMove', function(move) {
    console.log("got move")
    game.move(move);
    board.position(game.fen())
    updateStatus();
});

socket.on('startGame', function(whitePlayer, blackPlayer, startFen) {
    game_started = true;
    game.load(startFen)
    onSnapEnd();
    playerColor == "white" ? $blackPlayer.html(blackPlayer) : $whitePlayer.html(whitePlayer);
    updateStatus();
})

socket.on('spectateGame', function(whitePlayer, blackPlayer, startFen) {
    spectating = true;
    game_started = true;
    game.load(startFen)
    onSnapEnd();
    $blackPlayer.html(blackPlayer);
    $whitePlayer.html(whitePlayer);
    updateStatus();
})

socket.on('gameOverDisconnect', function() {
    user_disconnected = true;
    updateStatus()
}); 