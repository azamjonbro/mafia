const fs = require('fs');
const path = require('path');

const CURRENT_GAME_PATH = path.join(__dirname, './data/currentgame.json');

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function saveGameResult(gameId, groupId, winner, details) {
    let currentGames = readJSON(CURRENT_GAME_PATH);
    currentGames[gameId] = {
        group_id: groupId,
        winner,
        details,
        timestamp: Date.now()
    };
    writeJSON(CURRENT_GAME_PATH, currentGames);
}

function getGameResult(gameId) {
    let currentGames = readJSON(CURRENT_GAME_PATH);
    return currentGames[gameId] || null;
}

module.exports = {
    saveGameResult,
    getGameResult,
};
