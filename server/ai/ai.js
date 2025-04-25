class ChessBoard {
  constructor(
    FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    this.pieces = Array.from({ length: 8 }, (_) =>
      Array.from({ length: 8 }, (_) => "-")
    );
    //TODO: validate FEN before parsing
    const [placement, turn, castling, en_passant, half_moves, full_moves] =
      FEN.split(" ");
    const rows = placement.split("/");
    for (let i = 0; i < 8; i++) {
      var j = 0;
      rows[i].split("").forEach((char) => {
        if (!isNaN(parseInt(char))) {
          j += parseInt(char);
        } else {
          this.pieces[i][j] = char;
          j++;
        }
      });
    }
    this.turn = turn;
    this.castling = castling;
    this.en_passant = en_passant;
    this.half_moves = half_moves;
    this.full_moves = full_moves;
  }

  toString() {
    return this.pieces.map((row) => row.join(" ")).join("\n");
  }
  clone() {
    const copy = new ChessBoard();
    copy.pieces = structuredClone(this.pieces);
    copy.turn = this.turn;
    copy.castling = this.castling;
    copy.en_passant = this.en_passant;
    copy.half_moves = this.half_moves;
    copy.full_moves = this.full_moves;
    return copy;
  }

  isWhiteTurn() {
    return this.turn == "w";
  }

  isBlackTurn() {
    return this.turn == "b";
  }

  getNeighbors() {
    var neigbors = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.isWhiteTurn() && this.isBlackPiece(i, j)) continue;
        if (this.isBlackTurn() && this.isWhitePiece(i, j)) continue;
        if (this.isPawnPiece(i, j)) neigbors.push(...this.makePawnMoves(i, j));
        if (this.isKingPiece(i, j)) neigbors.push(...this.makeKingMoves(i, j));
        if (this.isQueenPiece(i, j))
          neigbors.push(...this.makeQueenMoves(i, j));
        if (this.isRookPiece(i, j)) neigbors.push(...this.makeRookMoves(i, j));
        if (this.isBishopPiece(i, j))
          neigbors.push(...this.makeBishopMoves(i, j));
        if (this.isKnightPiece(i, j))
          neigbors.push(...this.makeKnightMoves(i, j));
      }
    }

    return neigbors;
  }
  isTerminal() {
    return this.isCheckmate() || this.isDraw();
  }
  isCheckmate() {
    if (!this.isMate()) {
      return false;
    }
    return this.getNeighbors().length == 0;
  }
  isMate() {
    let king = this.getKingPos(this.turn == "w");
    //check horizontally and vertically
    for (let i = king.i + 1; i < 8; i++) {
      var pos = [i, king.j];
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isRookPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (Math.abs(king.i - i) == 1 && this.isKingPiece(...pos)) return true;
      break;
    }
    for (let i = king.i - 1; i >= 0; i--) {
      var pos = [i, king.j];
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isRookPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (Math.abs(king.i - i) == 1 && this.isKingPiece(...pos)) return true;
      break;
    }
    for (let j = king.j + 1; j < 8; j++) {
      var pos = [king.i, j];
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isRookPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (Math.abs(king.j - j) == 1 && this.isKingPiece(...pos)) return true;
      break;
    }
    for (let j = king.j - 1; j >= 0; j--) {
      var pos = [king.i, j];
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isRookPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (Math.abs(king.j - j) == 1 && this.isKingPiece(...pos)) return true;
      break;
    }
    //check diagonally
    var dx = 1;
    while (this.isValidSquare(king.i + dx, king.j + dx)) {
      var pos = [king.i + dx, king.j + dx];
      dx++;
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isBishopPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (dx == 2 && (this.isPawnPiece(...pos) || this.isKingPiece(...pos)))
        return true;
      break;
    }
    var dx = 1;
    while (this.isValidSquare(king.i - dx, king.j + dx)) {
      var pos = [king.i - dx, king.j + dx];
      dx++;
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isBishopPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (dx == 2 && (this.isPawnPiece(...pos) || this.isKingPiece(...pos)))
        return true;
      break;
    }
    var dx = 1;
    while (this.isValidSquare(king.i + dx, king.j - dx)) {
      var pos = [king.i + dx, king.j - dx];
      dx++;
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isBishopPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (dx == 2 && (this.isPawnPiece(...pos) || this.isKingPiece(...pos)))
        return true;
      break;
    }
    var dx = 1;
    while (this.isValidSquare(king.i - dx, king.j - dx)) {
      var pos = [king.i - dx, king.j - dx];
      dx++;
      if (this.isEmptySquare(...pos)) continue;
      if (!this.isOpponentPiece(...pos)) break;
      if (this.isBishopPiece(...pos) || this.isQueenPiece(...pos)) return true;
      if (dx == 2 && (this.isPawnPiece(...pos) || this.isKingPiece(...pos)))
        return true;
      break;
    }
    //check L
    for (const di of [2, -2]) {
      for (const dj of [1, -1]) {
        var pos = [king.i + di, king.j + dj];
        if (this.isOpponentPiece(...pos)) {
          if (this.isKnightPiece(...pos)) return true;
        }
        var pos = [king.i + dj, king.j + di];
        if (this.isOpponentPiece(...pos)) {
          if (this.isKnightPiece(...pos)) return true;
        }
      }
    }

    return false;
  }
  isDraw() {
    if (this.getNeighbors().length == 0) return true;
    return false;
  }
  isValidSquare(i, j) {
    return i >= 0 && i < 8 && j >= 0 && j < 8;
  }

  isOpponentPiece(i, j) {
    if (this.turn == "w" && this.isBlackPiece(i, j)) return true;
    if (this.turn == "b" && this.isWhitePiece(i, j)) return true;
    return false;
  }

  isWhitePiece(i, j) {
    if (this.isValidSquare(i, j) && this.pieces[i][j] != "-") {
      return this.pieces[i][j].toUpperCase() == this.pieces[i][j];
    }
    return false;
  }
  isBlackPiece(i, j) {
    if (this.isValidSquare(i, j) && this.pieces[i][j] != "-") {
      return this.pieces[i][j].toLowerCase() == this.pieces[i][j];
    }
    return false;
  }

  isKingPiece(i, j) {
    return this.pieces[i][j].toLowerCase() == "k";
  }
  isQueenPiece(i, j) {
    return this.pieces[i][j].toLowerCase() == "q";
  }
  isRookPiece(i, j) {
    return this.pieces[i][j].toLowerCase() == "r";
  }
  isBishopPiece(i, j) {
    return this.pieces[i][j].toLowerCase() == "b";
  }
  isKnightPiece(i, j) {
    return this.pieces[i][j].toLowerCase() == "n";
  }
  isPawnPiece(i, j) {
    return this.pieces[i][j].toLowerCase() == "p";
  }
  isEmptySquare(i, j) {
    return this.pieces[i][j].toLowerCase() == "-";
  }

  nextTurn(i, j) {
    this.turn = this.turn == "w" ? "b" : "w";
    //TODO: halfmoves and fullmoves?
  }

  getKingPos(white = true) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.isKingPiece(i, j)) {
          if (white && this.isWhitePiece(i, j)) return { i: i, j: j };
          if (!white && this.isBlackPiece(i, j)) return { i: i, j: j };
        }
      }
    }
    console.log(`${this}`);
    throw new Error("King not found");
  }

  getPawnPiece(is_white = true) {
    return is_white ? "P" : "p";
  }

  getKingPiece(is_white = true) {
    return is_white ? "K" : "k";
  }
  getQueenPiece(is_white = true) {
    return is_white ? "Q" : "q";
  }
  getKnightPiece(is_white = true) {
    return is_white ? "N" : "n";
  }
  getBishopPiece(is_white = true) {
    return is_white ? "B" : "b";
  }
  getRookPiece(is_white = true) {
    return is_white ? "R" : "r";
  }

  getEmptySquare() {
    return "-";
  }

  filterAndTurn(nboards) {
    nboards = nboards.filter((board) => !board.isMate());
    nboards.forEach((board) => board.nextTurn());
    return nboards;
  }

  copyAndMove(from, to, piece) {
    var nboard = this.clone();
    nboard.pieces[from.i][from.j] = this.getEmptySquare();
    nboard.pieces[to.i][to.j] = piece;
    return nboard;
  }

  makePawnMoves(i, j) {
    if (!this.isPawnPiece(i, j)) {
      throw new Error("Pawn not found");
    }
    let nboards = [];
    const is_white = this.isWhitePiece(i, j);
    const inc = is_white ? -1 : 1;

    if (this.isValidSquare(i + inc, j) && this.isEmptySquare(i + inc, j)) {
      nboards.push(
        this.copyAndMove(
          { i, j },
          { i: i + inc, j },
          this.getPawnPiece(is_white)
        )
      );
      if (
        ((i == 6 && is_white) || (i == 1 && !is_white)) &&
        this.isValidSquare(i + inc * 2, j) &&
        this.isEmptySquare(i + inc * 2, j)
      ) {
        nboards.push(
          this.copyAndMove(
            { i, j },
            { i: i + inc * 2, j },
            this.getPawnPiece(is_white)
          )
        );
      }
    }
    [-1, 1].forEach((dj) => {
      if (
        this.isValidSquare(i + inc, j + dj) &&
        this.isOpponentPiece(i + inc, j + dj)
      ) {
        nboards.push(
          this.copyAndMove(
            { i, j },
            { i: i + inc, j: j + dj },
            this.getPawnPiece(is_white)
          )
        );
      }
    });
    return this.filterAndTurn(nboards);
  }
  makeKingMoves(i, j) {
    if (!this.isKingPiece(i, j)) {
      throw new Error("King not found");
    }
    let nboards = [];
    const is_white = this.isWhitePiece(i, j);
    for (const di of [-1, 0, 1]) {
      for (const dj of [-1, 0, 1]) {
        if (di == 0 && dj == 0) continue;
        if (!this.isValidSquare(i + di, j + dj)) continue;
        if (
          this.isOpponentPiece(i + di, j + dj) ||
          this.isEmptySquare(i + di, j + dj)
        ) {
          nboards.push(
            this.copyAndMove(
              { i, j },
              { i: i + di, j: j + dj },
              this.getKingPiece(is_white)
            )
          );
        }
      }
    }
    return this.filterAndTurn(nboards);
  }
  makeKnightMoves(i, j) {
    if (!this.isKnightPiece(i, j)) {
      throw new Error("Knight not found");
    }
    let nboards = [];
    const is_white = this.isWhitePiece(i, j);
    for (const di of [-1, 1]) {
      for (const dj of [-2, 2]) {
        var pos = [i + di, j + dj];
        if (this.isValidSquare(...pos)) {
          if (this.isOpponentPiece(...pos) || this.isEmptySquare(...pos)) {
            nboards.push(
              this.copyAndMove(
                { i, j },
                { i: pos[0], j: pos[1] },
                this.getKnightPiece(is_white)
              )
            );
          }
        }
        var pos = [i + dj, j + di];
        if (this.isValidSquare(...pos)) {
          if (this.isOpponentPiece(...pos) || this.isEmptySquare(...pos)) {
            nboards.push(
              this.copyAndMove(
                { i, j },
                { i: pos[0], j: pos[1] },
                this.getKnightPiece(is_white)
              )
            );
          }
        }
      }
    }
    return this.filterAndTurn(nboards);
  }
  makeDirectionalMoves(i, j, directions, piece) {
    let nboards = [];
    directions.forEach(({ di, dj }) => {
      let steps = 1;
      while (true) {
        const ri = i + di * steps;
        const rj = j + dj * steps;

        if (!this.isValidSquare(ri, rj)) break;

        if (!this.isEmptySquare(ri, rj)) {
          if (this.isOpponentPiece(ri, rj)) {
            nboards.push(this.copyAndMove({ i, j }, { i: ri, j: rj }, piece));
          }
          break;
        }

        nboards.push(this.copyAndMove({ i, j }, { i: ri, j: rj }, piece));
        steps++;
      }
    });
    return this.filterAndTurn(nboards);
  }
  makeQueenMoves(i, j) {
    if (!this.isQueenPiece(i, j)) {
      throw new Error("Queen not found");
    }
    const is_white = this.isWhitePiece(i, j);
    const directions = [
      { di: 1, dj: 0 },
      { di: -1, dj: 0 },
      { di: 0, dj: 1 },
      { di: 0, dj: -1 },
      { di: 1, dj: 1 },
      { di: -1, dj: -1 },
      { di: 1, dj: -1 },
      { di: -1, dj: 1 },
    ];

    return this.makeDirectionalMoves(
      i,
      j,
      directions,
      this.getQueenPiece(is_white)
    );
  }

  makeBishopMoves(i, j) {
    if (!this.isBishopPiece(i, j)) {
      throw new Error("Bishop not found");
    }
    const is_white = this.isWhitePiece(i, j);
    const directions = [
      { di: 1, dj: 1 },
      { di: -1, dj: -1 },
      { di: 1, dj: -1 },
      { di: -1, dj: 1 },
    ];

    return this.makeDirectionalMoves(
      i,
      j,
      directions,
      this.getBishopPiece(is_white)
    );
  }

  makeRookMoves(i, j) {
    if (!this.isRookPiece(i, j)) {
      throw new Error("Rook not found");
    }
    const is_white = this.isWhitePiece(i, j);
    const directions = [
      { di: 1, dj: 0 },
      { di: -1, dj: 0 },
      { di: 0, dj: 1 },
      { di: 0, dj: -1 },
    ];

    return this.makeDirectionalMoves(
      i,
      j,
      directions,
      this.getRookPiece(is_white)
    );
  }
}

const evaluate = (board, player = "w") => {
  const values = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
    "-": 0,
  };
  const inf =
    8 * values["p"] +
    2 * (values["n"] + values["b"] + values["r"]) +
    values["q"] +
    values["k"] +
    1;
  if (board.isCheckmate()) {
    return board.turn == player ? -inf : inf;
  }
  const is_white = player == "w";
  score = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (is_white && board.isWhitePiece(i, j))
        score += values[board.pieces[i][j].toLowerCase()];
      else if (!is_white && board.isBlackPiece(i, j))
        score += values[board.pieces[i][j].toLowerCase()];
      else score -= values[board.pieces[i][j].toLowerCase()];
    }
  }
  return score;
};

const minimax = (board, depth, alpha, beta, player = "w", is_max = true) => {
  if (board.isTerminal() || depth == 0)
    return { eval: evaluate(board, player), path: [] };
  var best_board = board;
  var nboards = board.getNeighbors();
  nboards.sort(() => Math.random() - 0.5); //shuffle
  if (is_max) {
    var max_eval = -Infinity;
    for (let i = 0; i < nboards.length; i++) {
      const nboard = nboards[i];
      var { eval, path } = minimax(nboard, depth - 1, alpha, beta, player, false);
      // console.log(`max: ${eval}\n${nboard}\n`)
      if (eval >= max_eval) {
        max_eval = eval;
        best_board = nboard.clone();
      }
      alpha = alpha < eval ? eval : alpha;
      if (beta <= alpha) break;
    }
    return { eval: max_eval, path: [best_board.clone()].concat(path)  };
  } else {
    var min_eval = Infinity;
    for (let i = 0; i < nboards.length; i++) {
      const nboard = nboards[i];
      var { eval, path } = minimax(nboard, depth - 1, alpha, beta, player, true);
      // console.log(`min: ${eval}\n${nboard}\n`)
      if (eval <= min_eval) {
        min_eval = eval;
        best_board = nboard.clone();
      }
      beta = beta > eval ? eval : beta;
      if (beta <= alpha) break;
    }
    return { eval: min_eval, path: [best_board.clone()].concat(path) };
  }
};
var board = new ChessBoard(
  // "r1b1nbk1/p4p1p/6p1/BNn1p3/q3P3/1N4P1/P1P2P1P/1R1Q2K1 w - - 1 27"
  // "r1b1nbk1/p4p1p/6p1/qNNQp3/4P3/6P1/P1P2P1P/1R4K1 b - - 1 28"
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  // "3bk3/8/8/8/8/8/8/3BK3 w KQkq - 0 1"
  // "2kr3r/p1pq2p1/1pb1p2p/4P3/1bPP4/2N1R3/P1N3PP/R2Q2K1 w - - 1 1"
);
console.log(evaluate(board, "b"));
console.log(`${board}\n`);
// board.getNeighbors().forEach((board) => {
//   console.log(evaluate(board));
//   console.log(`${board}\n`);
// });

depth = 3;
moves = 100;
for (let i = 0; i < moves; i++) {
  console.log(`move: ${i + 1}`);
  var { path, eval } = minimax(board, depth, -Infinity, Infinity, "w");
  // path.forEach(b => {
  //   console.log(`${b}\n`)
  // });
  board = path[0].clone();
  console.log(`white: ${eval}`);
  console.log(`${board}\n`);
  if (board.isTerminal()) break;
  var { path, eval } = minimax(board, depth, -Infinity, Infinity, "b");
  board = path[0].clone();
  console.log(`black: ${eval}`);
  console.log(`${board}\n`);
  if (board.isTerminal()) break;
}
console.log(board.isCheckmate());
console.log(board.isDraw());
// console.log(minimax(board, depth, -Infinity, Infinity, "b"));
