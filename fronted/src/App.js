import React, { useState, useEffect } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import { createGame, fetchGame, makeMove } from './api/gameApi';

function App() {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createNewGame = async () => {
      try {
        const game = await createGame();
        console.log(game)
        setGameState(game);
      } catch (error) {
        setError(error.message);
      }
    };

    createNewGame();
  }, []);
console.log('hello')
  const handleMove = async (position, value) => {
    try {
      const updatedGame = await makeMove(gameState.id, position, value);
      setGameState(updatedGame);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchCurrentGame = async () => {
    try {
      const game = await fetchGame(gameState.id);
      setGameState(game);
    } catch (error) {
      setError(error.message);
    }
  };


console.log(gameState)
  return (
    <div className="App">
      <header className="App-header">
        <h1>Gra Sudoku</h1>
         {gameState ? (
          <GameBoard game={gameState} onMove={handleMove} />
        ) : (
          <p>Ładowanie gry...</p>
        )} 
        {error && <p className="error-msg">error: {error}</p>}
      </header>
    </div>
  );
}

export default App;
