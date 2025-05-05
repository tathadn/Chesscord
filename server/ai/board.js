class ChessBoard {
  constructor(
    FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    this.pieces = Array.from({ length: 8 }, (_) =>
      Array.from({ length: 8 }, (_) => "-")
    );

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
    this.move = null;
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
    copy.move = this.move;
    return copy;
  }

  isWhiteTurn() {
    return this.turn == "w";
  }

  isBlackTurn() {
    return this.turn == "b";
  }

  getNeighbors(filter = true) {
    var neigbors = [];
    if (this.getKingPos(true) == null || this.getKingPos(false) == null)
      return null;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.isWhiteTurn() && this.isBlackPiece(i, j)) continue;
        if (this.isBlackTurn() && this.isWhitePiece(i, j)) continue;
        if (this.isPawnPiece(i, j))
          neigbors.push(...this.makePawnMoves(i, j, filter));
        if (this.isKingPiece(i, j))
          neigbors.push(...this.makeKingMoves(i, j, filter));
        if (this.isQueenPiece(i, j))
          neigbors.push(...this.makeQueenMoves(i, j, filter));
        if (this.isRookPiece(i, j))
          neigbors.push(...this.makeRookMoves(i, j, filter));
        if (this.isBishopPiece(i, j))
          neigbors.push(...this.makeBishopMoves(i, j, filter));
        if (this.isKnightPiece(i, j))
          neigbors.push(...this.makeKnightMoves(i, j, filter));
      }
    }

    return neigbors;
  }
  isTerminal() {
    return this.isCheckmate() || this.isDraw();
  }
  isCheckmate() {
    if (!this.isCheck()) {
      return false;
    }
    return this.getNeighbors().length == 0;
  }
  checkDirectionalMoves(i, j, directions, pieces) {
    for (const { di, dj } of directions) {
      let steps = 1;
      while (true) {
        const ri = i + di * steps;
        const rj = j + dj * steps;

        if (!this.isValidSquare(ri, rj)) break;
        if (!this.isEmptySquare(ri, rj)) {
          if (pieces.includes(this.pieces[ri][rj])) {
            return true;
          }
          break;
        }
        steps++;
      }
    }
    return false;
  }
  isCheck() {
    let king = this.getKingPos(this.turn == "w");
    if (king == null) return true;
    return this.isCheckIJ(king.i, king.j);
  }
  isCheckIJ(i, j) {
    let king = { i: i, j: j };
    const is_white = this.isWhiteTurn();
    if (
      this.checkDirectionalMoves(
        king.i,
        king.j,
        [
          { di: 0, dj: 1 },
          { di: 1, dj: 0 },
          { di: 0, dj: -1 },
          { di: -1, dj: 0 },
        ],
        [this.getRookPiece(!is_white), this.getQueenPiece(!is_white)]
      )
    )
      return true;
    if (
      this.checkDirectionalMoves(
        king.i,
        king.j,
        [
          { di: 1, dj: 1 },
          { di: 1, dj: -1 },
          { di: -1, dj: 1 },
          { di: -1, dj: -1 },
        ],
        [this.getBishopPiece(!is_white), this.getQueenPiece(!is_white)]
      )
    )
      return true;
    //check pawns
    var di = is_white ? -1 : +1;
    for (const dj of [1, -1]) {
      if (
        this.isValidSquare(king.i + di, king.j + dj) &&
        this.pieces[king.i + di][king.j + dj] == this.getPawnPiece(!is_white)
      ) {
        return true;
      }
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
    if (!this.check() && this.getNeighbors().length == 0) return true;
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

  isPlayerPiece(i, j) {
    if (this.turn == "b" && this.isBlackPiece(i, j)) return true;
    if (this.turn == "w" && this.isWhitePiece(i, j)) return true;
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

  nextTurn() {
    this.turn = this.turn == "w" ? "b" : "w";
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
    return null;
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

  filterAndTurn(nboards, filter = false) {
    if (filter) nboards = nboards.filter((board) => !board.isCheck());
    nboards.forEach((board) => board.nextTurn());
    return nboards;
  }

  enPassantLetter(from, to) {
    const files = "abcdefgh";
    let i = from.i + (to.i - from.i) / 2;
    return `${files[to.j]}${8 - i}`;
  }

  copyAndMove(from, to, piece, type = null) {
    var nboard = this.clone();
    if (type == null && !this.isEmptySquare(to.i, to.j)) type = "capture";
    nboard.pieces[from.i][from.j] = this.getEmptySquare();
    nboard.pieces[to.i][to.j] = piece;
    // if (type == null && nboard.isCheck()) type = "check";
    nboard.move = {
      from: type === "promotion" ? this.move.from : from,
      to: to,
      promotion: piece.toLowerCase(),
      type: type,
    };
    //update en passant
    nboard.en_passant =
      piece.toLowerCase() == "p" && Math.abs(from.i - to.i) == 2
        ? this.enPassantLetter(from, to)
        : "-";
    //update castling
    if (piece == "k") {
      nboard.castling = nboard.castling.replaceAll("k", "");
      nboard.castling = nboard.castling.replaceAll("q", "");
    }
    if (piece == "K") {
      nboard.castling = nboard.castling.replaceAll("K", "");
      nboard.castling = nboard.castling.replaceAll("Q", "");
    }
    if (piece == "r") {
      if (nboard.pieces[0][0] == "-")
        nboard.castling = nboard.castling.replaceAll("q", "");
      if (nboard.pieces[0][7] == "-")
        nboard.castling = nboard.castling.replaceAll("k", "");
    }
    if (piece == "R") {
      if (nboard.pieces[7][0] == "-")
        nboard.castling = nboard.castling.replaceAll("Q", "");
      if (nboard.pieces[7][7] == "-")
        nboard.castling = nboard.castling.replaceAll("K", "");
    }
    return nboard;
  }

  makePawnEnPassantMoves(i, j) {
    let nboards = [];
    if (!this.isPawnPiece(i, j)) {
      throw new Error("Pawn not found");
    }
    if (this.en_passant == "-") return [];
    const is_white = this.isWhitePiece(i, j);
    const ej = this.en_passant.charCodeAt(0) - "a".charCodeAt(0);
    const ei = 8 - parseInt(this.en_passant.charAt(1));
    const di = is_white ? -1 : 1;
    if (Math.abs(ej - j) == 1 && ei + di == i) {
      var nboard = this.copyAndMove(
        { i, j },
        { i: i + di, j: ej },
        this.getPawnPiece(is_white)
      );
      nboard.pieces[ei - di][ej] = this.getEmptySquare();
      nboard.move_type = "capture";
      nboards.push(nboard);
    }
    return nboards;
  }

  makePawnPromotionMoves(i, j) {
    let nboards = [];
    if (!this.isPawnPiece(i, j)) {
      throw new Error("Pawn not found");
    }
    const is_white = this.isWhitePiece(i, j);
    if ((i == 0 && is_white) || (i == 7 && !is_white)) {
      nboards.push(
        this.copyAndMove(
          { i, j },
          { i, j },
          this.getKnightPiece(is_white),
          "promotion"
        )
      );
      nboards.push(
        this.copyAndMove(
          { i, j },
          { i, j },
          this.getBishopPiece(is_white),
          "promotion"
        )
      );
      nboards.push(
        this.copyAndMove(
          { i, j },
          { i, j },
          this.getQueenPiece(is_white),
          "promotion"
        )
      );
      nboards.push(
        this.copyAndMove(
          { i, j },
          { i, j },
          this.getRookPiece(is_white),
          "promotion"
        )
      );
    }
    return nboards;
  }

  makePawnMoves(i, j, filter) {
    if (!this.isPawnPiece(i, j)) {
      throw new Error("Pawn not found");
    }
    let nboards = this.makePawnEnPassantMoves(i, j);
    const is_white = this.isWhitePiece(i, j);
    const inc = is_white ? -1 : 1;

    if (this.isValidSquare(i + inc, j) && this.isEmptySquare(i + inc, j)) {
      var nboard = this.copyAndMove(
        { i, j },
        { i: i + inc, j },
        this.getPawnPiece(is_white)
      );
      var promotions = nboard.makePawnPromotionMoves(i + inc, j);
      if (promotions.length == 0) nboards.push(nboard);
      else nboards.push(...promotions);
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
        var nboard = this.copyAndMove(
          { i, j },
          { i: i + inc, j: j + dj },
          this.getPawnPiece(is_white)
        );
        var promotions = nboard.makePawnPromotionMoves(i + inc, j + dj);
        if (promotions.length == 0) nboards.push(nboard);
        else nboards.push(...promotions);
      }
    });
    return this.filterAndTurn(nboards, filter);
  }

  makeCastlingMoves(i, j) {
    if (!this.isKingPiece(i, j)) {
      throw new Error("King not found");
    }
    let nboards = [];
    const is_white = this.isWhitePiece(i, j);
    const queen_side = is_white ? "Q" : "q";
    const king_side = is_white ? "K" : "k";
    if (j != 4) return [];
    if (is_white && i != 7) return [];
    if (!is_white && i != 0) return [];
    if (this.castling.includes(queen_side)) {
      if (!this.isCheckIJ(i, j - 1) && !this.isCheckIJ(i, j - 2)) {
        if (this.pieces[i].slice(0, 5).join("").toLowerCase() === "r---k") {
          var nboard = this.copyAndMove(
            { i, j },
            { i: i, j: j - 2 },
            this.getKingPiece(is_white)
          );
          nboard.pieces[i][0] = this.getEmptySquare();
          nboard.pieces[i][j - 1] = this.getRookPiece(is_white);
          nboards.push(nboard);
        }
      }
    }
    if (this.castling.includes(king_side)) {
      if (this.pieces[i].slice(4, 8).join("").toLowerCase() === "k--r") {
        if (!this.isCheckIJ(i, j + 1) && !this.isCheckIJ(i, j + 2)) {
          var nboard = this.copyAndMove(
            { i, j },
            { i: i, j: j + 2 },
            this.getKingPiece(is_white)
          );
          nboard.pieces[i][7] = this.getEmptySquare();
          nboard.pieces[i][j + 1] = this.getRookPiece(is_white);
          nboards.push(nboard);
        }
      }
    }

    return nboards;
  }

  makeKingMoves(i, j, filter) {
    if (!this.isKingPiece(i, j)) {
      throw new Error("King not found");
    }
    let nboards = this.makeCastlingMoves(i, j);
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
    return this.filterAndTurn(nboards, filter);
  }
  makeKnightMoves(i, j, filter) {
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
    return this.filterAndTurn(nboards, filter);
  }
  makeDirectionalMoves(i, j, directions, piece, filter) {
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
    return this.filterAndTurn(nboards, filter);
  }
  makeQueenMoves(i, j, filter) {
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
      this.getQueenPiece(is_white),
      filter
    );
  }

  makeBishopMoves(i, j, filter) {
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
      this.getBishopPiece(is_white),
      filter
    );
  }

  makeRookMoves(i, j, filter) {
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
      this.getRookPiece(is_white),
      filter
    );
  }
}

export { ChessBoard };
