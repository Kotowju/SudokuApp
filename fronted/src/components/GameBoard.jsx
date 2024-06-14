import React from 'react';

const GameBoard = ({ game, onMove }) => {
  const handleMove = (position, value) => {
    onMove(position, value); 
  };

  return (
    <div className="game-board">
      <h2>Oyun Tahtası</h2>
      <table>
        <tbody>
          {game.board.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={cell}
                    onChange={(e) => handleMove(`${i}-${j}`, parseInt(e.target.value))}
                    disabled={cell !== 0}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameBoard;
