const fs = require('fs');
const path = require('path');

const GAMES_PATH = path.join(__dirname, './data/games.json');

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getGame(groupId) {
    let games = readJSON(GAMES_PATH);
    if (!games[groupId]) {
        games[groupId] = {
            players: [],
            state: 'waiting',
            mafia: [],
            doctor: null,
            players_status: {}
        };
        writeJSON(GAMES_PATH, games);
    }
    return games[groupId];
}

function saveGame(groupId, gameData) {
    let games = readJSON(GAMES_PATH);
    games[groupId] = gameData;
    writeJSON(GAMES_PATH, games);
}

function addPlayer(groupId, userId) {
    let game = getGame(groupId);
    if (!game.players.includes(userId)) {
        game.players.push(userId);
        game.players_status[userId] = { alive: true, participated: true };
        saveGame(groupId, game);
        return true;
    }
    return false;
}

function removePlayer(groupId, userId) {
    let game = getGame(groupId);
    if (game.players.includes(userId)) {
        game.players = game.players.filter(id => id !== userId);
        delete game.players_status[userId];
        saveGame(groupId, game);
        return true;
    }
    return false;
}

function startGame(groupId) {
    let game = getGame(groupId);
    if (game.players.length < 6) {
        return { error: 'Kamida 6 ta o’yinchi bo’lishi kerak' };
    }
    if (game.players.length > 10) {
        return { error: 'O’yinchilar soni 10 dan ortmasligi kerak' };
    }

    game.state = 'started';

    // Rollarni taqsimlash: 1 mafia, 1 doctor (siz o'zingiz ko'paytirishingiz mumkin)
    const shuffled = game.players.sort(() => 0.5 - Math.random());
    game.mafia = [shuffled[0]];
    game.doctor = shuffled[1];

    saveGame(groupId, game);
    return { success: true, game };
}

module.exports = {
    getGame,
    saveGame,
    addPlayer,
    removePlayer,
    startGame,
};
