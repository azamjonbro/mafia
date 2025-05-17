const fs = require('fs');
const path = require('path');

const USERS_PATH = path.join(__dirname, 'users.json');

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUser(userId) {
    let users = readJSON(USERS_PATH);
    return users[userId] || null;
}

function addAdmin(userId, groupId) {
    let users = readJSON(USERS_PATH);
    if (!users[userId]) return { error: 'Foydalanuvchi topilmadi' };

    if (!users[userId].admin_of) users[userId].admin_of = [];
    if (!users[userId].admin_of.includes(groupId)) {
        users[userId].admin_of.push(groupId);
        writeJSON(USERS_PATH, users);
        return { success: true };
    }
    return { error: 'Foydalanuvchi allaqachon admin' };
}

function incrementWins(userId) {
    let users = readJSON(USERS_PATH);
    if (!users[userId]) return { error: 'Foydalanuvchi topilmadi' };

    users[userId].wins = (users[userId].wins || 0) + 1;

    // Agar wins 100 dan oshsa admin qiling
    if (users[userId].wins >= 100) {
        if (!users[userId].admin_of) users[userId].admin_of = [];
        // Admin qilish uchun guruh id kiritilishi kerak — bu yerda misol uchun 0 ni qo'yamiz
        if (!users[userId].admin_of.includes(0)) users[userId].admin_of.push(0);
    }

    writeJSON(USERS_PATH, users);
    return { success: true, wins: users[userId].wins };
}
function readUsers() {
  if (!fs.existsSync(USERS_PATH)) return {};
  const raw = fs.readFileSync(USERS_PATH, 'utf8');
  console.log("✅ Foydalanuvchilar o'qildi");
  return JSON.parse(raw || '{}');
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

function addUser(user) {
  const users = readUsers();
  if (!users[user.id]) {
    users[user.id] = {
      id: user.id,
      username: user.username || '',
      wins: 0,
      invited: [],
      admin_of: [],
    };
    writeUsers(users);
  }
}

module.exports = {
    addUser,
    readUsers,
    getUser,
    addAdmin,
    incrementWins,
};
