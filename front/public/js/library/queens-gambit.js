const game = new Chess();
const board = Chessboard('board', {
    position: 'start',
    draggable: false,
    pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png'
});

const moves = ['d4', 'd5', 'c4'];

function playOpening() {
    game.reset();
    board.position('start');
    let i = 0;

    const interval = setInterval(() => {
        if (i >= moves.length) {
            clearInterval(interval);
            return;
        }
        game.move(moves[i]);
        board.position(game.fen());
        i++;
    }, 800);
}

window.addEventListener('resize', () => board.resize());
