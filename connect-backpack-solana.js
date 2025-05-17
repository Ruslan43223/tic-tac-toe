import { Connection, PublicKey } from '@solana/web3.js';

// Настройка подключения к Solana Mainnet
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

async function waitForBackpack() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 20; // 10 секунд
    console.log('Начало поиска Backpack...');
    const interval = setInterval(() => {
      // Ищем все ключи, связанные с solana или backpack
      const solanaKeys = Object.keys(window).filter(key => key.toLowerCase().includes('solana') || key.toLowerCase().includes('backpack'));
      console.log('Обнаруженные ключи:', solanaKeys);

      // Проверяем window.backpack
      if (window.backpack?.isBackpack) {
        clearInterval(interval);
        console.log('Найден Backpack в window.backpack:', window.backpack);
        resolve(window.backpack);
        return;
      }

      // Проверяем другие ключи
      for (const key of solanaKeys) {
        const solanaObj = window[key];
        console.log(`Проверка ключа ${key}:`, solanaObj);
        if (solanaObj?.isBackpack) {
          clearInterval(interval);
          console.log('Найден Backpack:', solanaObj);
          resolve(solanaObj);
          return;
        }
      }

      attempts++;
      console.log(`Попытка ${attempts}/${maxAttempts}`);
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.log('Backpack не найден. Доступные объекты:', window.solana, window.backpack);
        reject(new Error('Backpack wallet not detected after timeout'));
      }
    }, 500);
  });
}

document.getElementById('connect-button').addEventListener('click', async () => {
  try {
    const wallet = await waitForBackpack();
    if (!wallet.isBackpack) {
      throw new Error('Выбранный кошелёк не является Backpack');
    }
    await wallet.connect();
    const publicKey = new PublicKey(wallet.publicKey.toString());
    console.log('Кошелёк Backpack подключен к Solana Mainnet:', publicKey.toBase58());
    document.getElementById('wallet-status').textContent = `Подключен: ${publicKey.toBase58()}`;
    initializeGame(publicKey);
  } catch (error) {
    console.error('Ошибка подключения кошелька:', error);
    alert(`Не удалось подключить кошелёк Backpack: ${error.message}`);
  }
});

function initializeGame(publicKey) {
  const cells = document.querySelectorAll('.grid-cell');
  const restartButton = document.querySelector('.restart-button');
  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameActive = true;

  function placeSymbol(cell, player) {
    const templateId = player === 'X' ? 'x-template' : 'o-template';
    const svg = document.getElementById(templateId)?.cloneNode(true);
    svg.style.display = 'block';
    cell.appendChild(svg);
    setTimeout(() => {
      svg.classList.add('visible');
    }, 10);
  }

  function checkWin(board, player) {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    return winConditions.some(condition => condition.every(index => board[index] === player));
  }

  function isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  function minimax(newBoard, player, depth = 0) {
    const opponent = player === 'O' ? 'X' : 'O';
    if (checkWin(newBoard, 'O')) return { score: 10 - depth };
    if (checkWin(newBoard, 'X')) return { score: depth - 10 };
    if (isBoardFull(newBoard)) return { score: 0 };

    const scores = [];
    const moves = [];

    newBoard.forEach((cell, index) => {
      if (cell === null) {
        newBoard[index] = player;
        const result = minimax(newBoard, opponent, depth + 1);
        scores.push(result.score);
        moves.push(index);
        newBoard[index] = null;
      }
    });

    if (player === 'O') {
      const maxScoreIndex = scores.indexOf(Math.max(...scores));
      return { score: scores[maxScoreIndex], index: moves[maxScoreIndex] };
    } else {
      const minScoreIndex = scores.indexOf(Math.min(...scores));
      return { score: scores[minScoreIndex], index: moves[minScoreIndex] };
    }
  }

  function botMove() {
    if (!gameActive) return;
    const bestMove = minimax(board, 'O');
    if (bestMove.index !== undefined) {
      board[bestMove.index] = 'O';
      const cell = cells[bestMove.index];
      placeSymbol(cell, 'O');
      if (checkWin(board, 'O')) {
        setTimeout(() => alert('Бот победил!'), 300);
        gameActive = false;
      } else if (isBoardFull(board)) {
        setTimeout(() => alert('Ничья!'), 300);
        gameActive = false;
      } else {
        currentPlayer = 'X';
        updateClickableCells();
      }
    }
  }

  function updateClickableCells() {
    cells.forEach((cell, index) => {
      if (board[index] === null && currentPlayer === 'X' && gameActive) {
        cell.classList.add('clickable');
      } else {
        cell.classList.remove('clickable');
      }
    });
  }

  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = publicKey ? true : false;
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('clickable');
    });
    updateClickableCells();
  }

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const index = cell.dataset.index;
      if (board[index] === null && currentPlayer === 'X' && gameActive) {
        board[index] =