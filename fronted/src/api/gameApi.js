// src/api/gameApi.js
const BASE_URL = 'http://localhost:3000';

export async function createGame() {
  try {
    const response = await fetch(`${BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
console.log(response.body)
    if (!response.ok) {
      throw new Error('Nie można utworzyć gry. Kod błędu HTTP: ' + response.status);
    }

    return response.json();
  } catch (error) {
    throw new Error('Błąd komunikacji z serwerem: ' + error.message);
  }
}

export async function fetchGame(gameId) {
  try {
    const response = await fetch(`${BASE_URL}/games/${gameId}`);

    if (!response.ok) {
      throw new Error('Gra nie znaleziona. Kod błędu HTTP: ' + response.status);
    }

    return response.json();
  } catch (error) {
    throw new Error('Błąd komunikacji z serwerem: ' + error.message);
  }
}

export async function makeMove(gameId, position, value) {
  try {
    const response = await fetch(`${BASE_URL}/games/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position, value }),
    });

    if (!response.ok) {
      throw new Error('Nie można było wykonać tego ruchu. Kod błędu HTTP: ' + response.status);
    }

    return response.json();
  } catch (error) {
    throw new Error('Błąd komunikacji z serwerem: ' + error.message);
  }
}
