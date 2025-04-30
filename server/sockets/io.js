const passport = require('passport');
const { Chess } = require('chess.js');

const Match = require('../models/match');

module.exports = (io, sessionMiddleware, games) => {      
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.session()));
    
    io.on('connection', socket => {
        console.log('New socket connection');

        socket.on('hello', (data) => {
            const {join, code, color, fen} = data;
            console.log("hello called: " + join + code + color + fen)
            socket.data.code = code;
            socket.join(code)

            if (join == "create") {
                games[code] = {}
                lobby(games[code], color, socket.request.user?.username || "Guest", fen, true)
                return;
            } else if (join == "join") {
                lobby(games[code], color, socket.request.user?.username || "Guest", "", false)
                io.to(socket.data.code).emit('startGame', games[code].white, games[code].black, games[code].start)
                return;
            } else if (join == "resume") {
                games[code] = {}
                games[code].matchID = code;
                lobby(games[code], color, socket.request.user?.username || "Guest", fen, true)
                return;
            }

            socket.data.code = null;
            socket.emit('spectateGame', games[code].white, games[code].black, games[code].board.fen())
        })

        socket.on('move', (move) => {
            theMove = Move(games[socket.data.code], move)
            io.to(socket.data.code).emit('newMove', theMove);
        })

        socket.on('disconnect', () => {
            if (games[socket.data.code]) {
                Match.recordMatch(games[socket.data.code].white, games[socket.data.code].black, games[socket.data.code].board.pgn(), games[socket.data.code].board.fen(), false, games[socket.data.code].matchID)
                io.to(socket.data.code).emit('gameOverDisconnect');
                delete games[socket.data.code]
            }
        })
    });
};

function lobby(room, color, name, fen, create) {
    fen = (fen === '' || fen === "start") ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" : fen;

    if (color == "white") {
        room.white = name;
    } else {
        room.black = name;
    }

    if (create) {
        room.start = fen;
        room.board = new Chess(fen);
    } else {
        room.board.setHeader("Event", "N/A");
        room.board.setHeader("Site", "Chesscord");
        room.board.setHeader("Date", new Date().toLocaleDateString("en-US"));
        room.board.setHeader("Round", "N/A");
        room.board.setHeader("White", room.white);
        room.board.setHeader("Black", room.black);
    }

    console.log("lobby called by " + name + "(" + color +"), created: " + create)
    return;
}

function Move(room, move) {
    console.log("move made by " + room.board.turn())
    theMove = room.board.move(move);
    
    if (room.board.isDraw() || room.board.isCheckmate()) {
        Match.recordMatch(room.white, room.black, room.board.pgn(), room.board.fen(), true, room[socket.data.code].matchID)
        delete room
    }

    return theMove;
}