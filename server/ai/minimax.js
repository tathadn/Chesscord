const sort_boards = (nboards) => {
  const priority = {
    promotion: 1,
    capture: 5,
    check: 6,
    null: 7,
  };
  nboards.sort(() => Math.random() - 0.5); //shuffle
  nboards.sort((x, y) => priority[x.move.type] - priority[y.move.type]);
};

const minimax = (
  board,
  eval_func,
  depth,
  alpha = -Infinity,
  beta = Infinity,
  is_max = true,
  end_time = null
) => {
  if (end_time != null && performance.now() >= end_time)
    throw new Error("Timeout");
  var best_board = board.clone();
  best_board.nextTurn();
  if (depth == 0) {
    return {
      evaluation: eval_func(board),
      next_move: best_board.clone(),
    };
  }

  var nboards = board.getNeighbors(false);
  if (nboards == null) {
    return {
      evaluation: eval_func(board),
      next_move: best_board.clone(),
    };
  }
  sort_boards(nboards);

  if (is_max) {
    var max_eval = -Infinity;
    for (let i = 0; i < nboards.length; i++) {
      var { evaluation, next_move } = minimax(
        nboards[i],
        eval_func,
        depth - 1,
        alpha,
        beta,
        false,
        end_time
      );
      if (evaluation > max_eval) {
        max_eval = evaluation;
        best_board = nboards[i].clone();
      }
      alpha = alpha < evaluation ? evaluation : alpha;
      if (beta <= alpha) break;
    }
    return { evaluation: max_eval, next_move: best_board.clone() };
  } else {
    var min_eval = Infinity;
    for (let i = 0; i < nboards.length; i++) {
      var { evaluation, next_move } = minimax(
        nboards[i],
        eval_func,
        depth - 1,
        alpha,
        beta,
        true,
        end_time
      );
      if (evaluation < min_eval) {
        min_eval = evaluation;
        best_board = nboards[i].clone();
      }
      beta = beta > evaluation ? evaluation : beta;
      if (beta <= alpha) break;
    }
    return { evaluation: min_eval, next_move: best_board.clone() };
  }
};

const iterativeMinimax = (board, eval_func, time_limit = 5) => {
  var end_time = performance.now() + time_limit * 1000;
  var depth = 1;
  var best = minimax(board, eval_func, depth++);
  while (true)
    try {
      best = minimax(
        board,
        eval_func,
        depth++,
        -Infinity,
        Infinity,
        true,
        end_time
      );
    } catch (error) {
      break;
    }
  return best;
};

export { iterativeMinimax, minimax };
