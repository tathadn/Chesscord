module.exports = io => {
    io.on('connection', socket => {
        console.log('New socket connection');

        let currentCode = null;

        socket.on('move', function(move) {
            io.to(currentCode).emit('newMove', move);
        });
        
        socket.on('joinGame', function(data) {
            currentCode = data.code;
            let username = data.username ?? "Guest"

            socket.join(currentCode);
            if (!games[currentCode]) {
                games[currentCode] = {}
                games[currentCode].whitePlayer = username
                return;
            }

            games[currentCode].blackPlayer = username;
            io.to(currentCode).emit('startGame', games[currentCode].whitePlayer, games[currentCode].blackPlayer);
        });

        socket.on('disconnect', function() {
            console.log('socket disconnected');

            if (currentCode) {
                io.to(currentCode).emit('gameOverDisconnect');
                delete games[currentCode];
            }
        });

    });
}; 