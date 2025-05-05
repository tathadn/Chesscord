let current_dialog = null;

let board = Chessboard('myBoard', {draggable: true, position: 'start', pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png'})

$('.open-dialog').on('click', async function() {
    if (current_dialog) current_dialog.hide();
    const targetDialogId = $(this).data('target');
    current_dialog = $(`#${targetDialogId}`);
    if (targetDialogId == "resume-dialog") {
        let res = await fetch('/resume')
        let html = await res.text();
        $('.list-matches').html(html);
    }
    current_dialog.show();
});

$('.close-dialog').on('click', function() {
    if (current_dialog) {
        current_dialog.hide();
        current_dialog = null;
    }
});

$('.list-matches').on('click', '.match-badge', async function() {
    const matchId = $(this).data('id');
    const whitePlayer = $(this).data('white');
    const blackPlayer = $(this).data('black');
    fen = $(this).data('fen');

    console.log("Match ID:", matchId);
    console.log("White Player:", whitePlayer);
    console.log("Black Player:", blackPlayer);
    console.log("FEN:", fen);

    join = "resume";
    code = matchId
    if (whitePlayer == username) {
        playerColor = "white"
    } else {
        playerColor = "black"
    }
    let req = "/?code=" + code + "&color=" + playerColor;

    current_dialog.hide();
    current_dialog = null;

    let res = await fetch(window.location.origin + "/create" + req);
    let html = await res.text();
    history.pushState({}, '', window.location.href + req)
    $('.status-dock').html(html);
});

$(document).on('click', function(event) {
    if (current_dialog && !$(event.target).closest(current_dialog).length && !$(event.target).hasClass('open-dialog')) {
        current_dialog.hide();
        current_dialog = null;
    }
});

async function requestLobby(event) {
    event.preventDefault();

    let form = event.target;
    fen = form.elements["fen"].value
    playerColor = form.elements["color"].value
    code = form.elements["code"].value;
    join = "create"

    current_dialog.hide();
    current_dialog = null;

    let req = "/?code=" + code + "&color=" + playerColor;
    let res = await fetch(window.location.origin + "/create" + req);
    let html = await res.text();
    history.pushState({}, '', window.location.href + req)
    $('.status-dock').html(html);
}

$(window).resize(() => board.resize());
$('#whitePlayer').html(username);