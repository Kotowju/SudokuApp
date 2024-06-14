const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());


const sequelize = new Sequelize('SudokuDB', 'justyna1', '12345678', {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306, // MSSQL port
  dialectOptions: {
    options: {
      encrypt: true, 
      trustServerCertificate: true 
    },
  },
});


sequelize.authenticate()
  .then(() => console.log('Pomyślnie połączono z bazą danych.'))
  .catch(err => console.error('Błąd połączenia z bazą danych:', err));


const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER, 
    primaryKey: true,
    autoIncrement: true,
  },
  board: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  solution: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'in-progress',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});


sequelize.sync()
  .then(() => console.log('Baza danych jest zsynchronizowana.'))
  .catch(err => console.error('Błąd podczas synchronizacji bazy danych:', err));


function generateEmptyBoard() {
  return Array(9).fill(0).map(() => Array(9).fill(0));
}

function isSafe(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) {
      return false;
    }
  }

  const startRow = row - row % 3;
  const startCol = col - col % 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

function solveSudoku(board) {
  let row = -1;
  let col = -1;
  let isEmpty = true;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = false;
        break;
      }
    }
    if (!isEmpty) {
      break;
    }
  }

  if (isEmpty) {
    return true;
  }

  for (let num = 1; num <= 9; num++) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) {
        return true;
      }
      board[row][col] = 0;
    }
  }

  return false;
}

function removeDigits(board, numDigits) {
  let count = numDigits;
  while (count > 0) {
    const cellId = Math.floor(Math.random() * 81);
    const i = Math.floor(cellId / 9);
    const j = cellId % 9;
    if (board[i][j] !== 0) {
      board[i][j] = 0;
      count--;
    }
  }
}

function generateSudoku() {
  const board = generateEmptyBoard();
  solveSudoku(board);
  const solution = JSON.parse(JSON.stringify(board));
  removeDigits(board, 30); 
  return { board, solution };
}


app.post('/games', async (req, res) => {
  try {
    const { board, solution } = generateSudoku();
    const newGame = await Game.create({
      board: board,
      solution: solution,
    });
    res.json(newGame);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: error.message });
  }
});

app.get('/games/:id', async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Gra nie znaleziona.' });
    }
    res.json(game);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: error.message });
  }
});


app.put('/games/:id', async (req, res) => {
  const gameId = req.params.id;
  const { position, value } = req.body;
  try {
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Gra nie znaleziona.' });
    }
    
  
    let board = JSON.parse(game.board); 
    

    board[position.row][position.col] = value;
    
    
    game.board = JSON.stringify(board);
    await game.save();

    io.emit('gameUpdate', game);
    res.json(game);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: error.message });
  }
});