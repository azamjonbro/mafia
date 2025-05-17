const { getGame, saveGame } = require('./game');

function killPlayer(groupId, userId) {
    let game = getGame(groupId);
    if (!game.players_status[userId] || !game.players_status[userId].alive) {
        return { error: 'Bu o’yinchi allaqachon o’ldirilgan yoki yo’q' };
    }
    game.players_status[userId].alive = false;
    saveGame(groupId, game);
    return { success: true };
}

function healPlayer(groupId, userId) {
    let game = getGame(groupId);
    if (!game.players_status[userId]) return { error: 'O’yinchi topilmadi' };

    game.players_status[userId].alive = true; // Davolandi
    saveGame(groupId, game);
    return { success: true };
}

function setParticipatedFalse(groupId, userId) {
    let game = getGame(groupId);
    if (game.players_status[userId]) {
        game.players_status[userId].participated = false;
        saveGame(groupId, game);
        return { success: true };
    }
    return { error: 'O’yinchi topilmadi' };
}

module.exports = {
    killPlayer,
    healPlayer,
    setParticipatedFalse,
};
