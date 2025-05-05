const evaluate = (board, player = "w", level = 1) => {
  var score_fun = level == 1 ? score1 : level == 2 ? score2 : score3;
  var board2 = board.clone();
  board2.nextTurn();
  if (board.turn == player) return score_fun(board) - score_fun(board2);
  return score_fun(board2) - score_fun(board);  
};

const score1 = (board) => {
  const values = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 200,
    "-": 0,
  };
  var score = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board.isPlayerPiece(i, j))
        score += values[board.pieces[i][j].toLowerCase()];
    }
  }
  return score;
};

const score2 = (board) => {
  var score = score1(board);
  var counts = Array.from({ length: 8 }, (_) => 0);
  var blocked = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board.isPlayerPiece(i, j) && board.isPawnPiece(i, j)) {
        counts[j]++;
        if (board.isWhiteTurn()) {
          if (board.isOpponentPiece(i - 1, j)) blocked++;
        } else {
          if (board.isOpponentPiece(i + 1, j)) blocked++;
        }
      }
    }
  }
  var doubles = counts.filter((x) => x >= 2).reduce((acc, cur) => acc + cur, 0);
  var isolated = 0;
  for (let i = 0; i < 8; i++) {
    if (counts[i] != 1) continue;
    if (i > 0 && counts[i - 1] > 0) continue;
    if (i < 7 && counts[i + 1] > 0) continue;
    isolated++;
  }
  score -= 0.5 * (doubles + isolated + blocked);
  // let nboards = board.getNeighbors();
  // score += 0.1 * (nboards == null ? 0 : nboards.length);
  return score;
};

const score3 = (board) => {
  const pst = {
    k: [
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-3, -4, -4, -5, -5, -4, -4, -3],
      [-2, -3, -3, -4, -4, -3, -3, -2],
      [-1, -2, -2, -2, -2, -2, -2, -1],
      [2, 2, 0, 0, 0, 0, 2, 2],
      [2, 3, 1, 0, 0, 1, 3, 2],
    ],
    q: [
      [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
      [-1, 0, 0, 0, 0, 0, 0, -1],
      [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
      [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
      [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
      [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
      [-1, 0, 0.5, 0, 0, 0, 0, -1],
      [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
    ],
    r: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0.5, 1, 1, 1, 1, 1, 1, 0.5],
      [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
      [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
      [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
      [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
      [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
      [0, 0, 0, 0.5, 0.5, 0, 0, 0],
    ],
    n: [
      [-5, -4, -3, -3, -3, -3, -4, -5],
      [-4, -2, 0, 0, 0, 0, -2, -4],
      [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
      [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
      [-3, 0.0, 1.5, 2, 2, 1.5, 0, -3],
      [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
      [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
      [-5, -4, -3, -3, -3, -3, -4, -5],
    ],
    p: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [5, 5, 5, 5, 5, 5, 5, 5],
      [1, 1, 2, 3, 3, 2, 1, 1],
      [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
      [0.5, 1, 1, -2, -2, 1, 1, 0.5],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    b: [
      [-2, -1, -1, -1, -1, -1, -1, -2],
      [-1, 0, 0, 0, 0, 0, 0, -1],
      [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
      [-1, 0, 1, 1, 1, 1, 0, -1],
      [-1, 0, 1, 1, 1, 1, 0, -1],
      [-1, 1, 1, 1, 1, 1, 1, -1],
      [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
      [-2, -1, -1, -1, -1, -1, -1, -2],
    ],
  };

  var score = score2(board);
  const w = 0.1;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      var piece = board.pieces[i][j];
      if (board.isPlayerPiece(i, j)) {
        if (board.isWhitePiece(i, j))
          score += w * pst[piece.toLowerCase()][i][j];
        else score += w * pst[piece.toLowerCase()][7 - i][j];
      }
    }
  }
  return score;
};


export { evaluate };
