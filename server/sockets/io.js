const passport = require('passport');
const { Chess } = require('chess.js');

const Match = require('../models/match');

module.exports = (io, sessionMiddleware) => {      
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.session()));
    
    io.on('connection', socket => {
        console.log('New socket connection');

        let currentCode = null;
        let currentUser = (socket.request.user) ? socket.request.user.username : "Guest";

        socket.on('move', function(move) {
            games[currentCode].board.move(move);
            io.to(currentCode).emit('newMove', move);
            if (games[currentCode].board.isDraw() || games[currentCode].board.isCheckmate()) {
                games[currentCode].ongoing = false;
                Match.recordMatch(games[currentCode].whitePlayer, games[currentCode].blackPlayer, games[currentCode].board.pgn(), true)
            }
        });
        
        socket.on('joinGame', function(data) {
            currentCode = data.code;

            socket.join(currentCode);
            if (!games[currentCode]) {
                games[currentCode] = {
                    ongoing: false,
                    whitePlayer: currentUser,
                    blackPlayer: null,
                    board: new Chess()
                }
                return;
            } else if (!games[currentCode].ongoing) {
                games[currentCode].blackPlayer = currentUser
                games[currentCode].ongoing = true
                games[currentCode].board.setHeader("Event", "N/A");
                games[currentCode].board.setHeader("Site", "Chesscord");
                games[currentCode].board.setHeader("Date", new Date().toLocaleDateString("en-US"));
                games[currentCode].board.setHeader("Round", "N/A");
                games[currentCode].board.setHeader("White", games[currentCode].whitePlayer);
                games[currentCode].board.setHeader("Black", games[currentCode].blackPlayer);
                io.to(currentCode).emit('startGame', games[currentCode].whitePlayer, games[currentCode].blackPlayer);
                return;
            }

            currentUser = "spectator"
            socket.emit('spectateGame', games[currentCode].whitePlayer, games[currentCode].blackPlayer, games[currentCode].board.fen());
            return;
        });

        socket.on('disconnect', function() {
            console.log('socket disconnected');
            if (currentUser == "spectator") return;

            if (currentCode && (games[currentCode] && games[currentCode].ongoing) ) {
                io.to(currentCode).emit('gameOverDisconnect');
                if (games[currentCode].board.moveNumber() > 5)
                    Match.recordMatch(games[currentCode].whitePlayer, games[currentCode].blackPlayer, games[currentCode].board.pgn(), false)
            }
            delete games[currentCode];
        });

    });
}; 