const { ChessBoard } = require("../ai/board");
const { evaluate } = require("../ai/evaluation");
const { iterativeMinimax } = require("../ai/minimax");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New socket connection");

    let currentCode = null;

    socket.on("move", function (move) {
      console.log("move detected");

      io.to(currentCode).emit("newMove", move);
    });

    socket.on("joinGame", function (data) {
      currentCode = data.code;
      socket.join(currentCode);
      if (!games[currentCode]) {
        games[currentCode] = true;
        return;
      }

      io.to(currentCode).emit("startGame");
    });

    socket.on("disconnect", function () {
      console.log("socket disconnected");

      if (currentCode) {
        io.to(currentCode).emit("gameOverDisconnect");
        delete games[currentCode];
      }
    });

    socket.on("aiGame", function () {
      socket.join(currentCode);
      io.to(currentCode).emit("startGame");
    });

    socket.on("getAIMove", function ({ fen, level }) {
      let board = new ChessBoard(fen);
      let lvl = level === "normal" ? 2 : level === "easy" ? 1 : 3;
      let player = board.turn;
      let time = 2;
      let { evaluation, next_move } = iterativeMinimax(
        board,
        (board) => evaluate(board, player, lvl),
        time
      );
      io.to(currentCode).emit("ai-move", next_move.move);
    });
  });
};
