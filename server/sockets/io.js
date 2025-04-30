const passport = require('passport');
const { Chess } = require('chess.js');

const Match = require('../models/match');

const { ChessBoard } = require("../ai/board");
const { evaluate } = require("../ai/evaluation");
const { iterativeMinimax } = require("../ai/minimax");

module.exports = (io, sessionMiddleware, games) => {      
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.session()));
    
    io.on('connection', socket => {
        console.log('New socket connection');
        let currentCode = null;
        let username = socket.request.user?.username || "Guest"
        //Online
        socket.on('hello', (data) => {
            const {join, code, color, fen} = data;
            console.log("hello called: " + join + code + color + fen)

            currentCode = code;
            socket.join(code)

            switch (join) {
                case "create":
                    games[code] = {}
                    lobby(games[code], color, username, fen, true)
                break;
                case "resume":
                    games[code] = {}
                    games[code].matchID = code;
                    lobby(games[code], color, username, fen, true)
                break;
                case "join":
                    lobby(games[code], color, username, "", false)
                    io.to(code).emit('startGame', games[code].white, games[code].black, games[code].start)
                break;
                case "spectate":
                    currentCode = null;
                    socket.emit('spectateGame', games[code].white, games[code].black, games[code].board.fen())
                break;
                default:
                    console.log("Server state error on 'hello'")
            }
        })

        // Augmented for AI
        socket.on('move', (move) => {
            if (socket.data.ai) {
                io.to(currentCode).emit("newMove", move);
                return;
            }
            theMove = Move(games[currentCode], move)
            io.to(currentCode).emit('newMove', theMove);
        })

        socket.on('disconnect', () => {
            if (socket.data.ai) return;

            if (currentCode && games[currentCode]) {
                Match.recordMatch(games[currentCode].white, games[currentCode].black, games[currentCode].board.pgn(), games[currentCode].board.fen(), false, games[currentCode].matchID)
                io.to(currentCode).emit('gameOverDisconnect');
                delete games[currentCode]
            }
        })

        //AI
        socket.on("aiGame", (data) => {
            socket.data.ai = true;
            currentCode = data.code;

            socket.data.color = data.color == "white" ? "w" : "b";
            socket.data.aiLevel = data.level === "normal" ? 2 : data.level === "easy" ? 1 : 3;
          
            socket.join(currentCode);
            io.to(currentCode).emit("startGame");
        });
        
        socket.on("getAIMove", (fen) => {
            let board = new ChessBoard(fen)
            let time = 2
            console.log("ai move made")
            let { evaluation, next_move } = iterativeMinimax(
            board,
            (board) => evaluate(board, board.turn, socket.data.aiLevel),
            time
            );
            console.log(evaluation)
            io.to(currentCode).emit("ai-move", next_move.move);
        })

        socket.on("undo", (newFen) => {
            let board = new ChessBoard(newFen);
            let time = 2;
          
            if (board.turn != socket.data.color) {
              let { evaluation, next_move } = iterativeMinimax(
                board,
                (board) => evaluate(board, board.turn, socket.data.aiLevel),
                time
              );
              io.to(currentCode).emit("ai-move", next_move.move);
            }
        });
        
    });
};

// Multiplayer helper functions
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
        Match.recordMatch(room.white, room.black, room.board.pgn(), room.board.fen(), true, room.matchID)
        delete room
    }

    return theMove;
}