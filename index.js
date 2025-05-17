// bot.js
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

// Modul importlari
const { getGame, addPlayer, removePlayer, startGame } = require('./game');
const { killPlayer, healPlayer } = require('./roles');
const { saveGameResult } = require('./currentgames');
const { clearNonParticipants } = require('./clear');
const { getUser,readUsers, addUser, addAdmin, incrementWins } = require('./showUsermember');

// Konfiguratsiya
const TOKEN = '8009840344:AAEzqDZdmH4VM8wE1xDQ7CvcOk0P_QvlXlE';
const SUPERADMIN_ID = 2043384301;

// Guruhlar ro‘yxatini saqlash uchun fayl
const GROUPS_PATH = path.join(__dirname, './data/groups.json');
function readGroups() {
  if (!fs.existsSync(GROUPS_PATH)) return [];
  return JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'));
}
function writeGroups(list) {
  fs.writeFileSync(GROUPS_PATH, JSON.stringify(list, null, 2));
}

// Botni ishga tushuramiz
const bot = new TelegramBot(TOKEN, { polling: true });

// Har qanday xabarda guruhni ro‘yxatga qo‘shish
bot.onText(/\/register/, (msg) => {
  const chatId = msg.chat.id;
  if (msg.chat.type === 'private') {
    return bot.sendMessage(chatId, 'Faqat guruhda ishlaydi.');
  }
  let groups = readGroups();
  if (!groups.includes(chatId)) {
    groups.push(chatId);
    writeGroups(groups);
    bot.sendMessage(chatId, `Guruh (ID: ${chatId}) ro‘yxatga olindi.`);
  } else {
    bot.sendMessage(chatId, `Guruh allaqachon ro‘yxatda.`);
  }
});

// /start — shaxsiy va guruhda
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  bot.sendMessage(chatId, `Salom, ${msg.from.username || 'foydalanuvchi'}!`);
  addUser(msg.from);
  let added = addPlayer(chatId, userId);
  if (added) {
    let count = getGame(chatId).players.length;
    bot.sendMessage(chatId,
      `${msg.from.username || userId} o‘yinga qo‘shildi. ` +
      `Hozir o‘yinchilar: ${count}`
    );
  } else {
    bot.sendMessage(chatId, `${msg.from.username || userId}, siz allaqachon o‘yindasiz.`);
  }
});

bot.onText(/\/join/, (msg) => {
  const user = msg.from;
  const chatId = msg.chat.id;
  console.log(chatId);
  
  const users = readUsers();
  
  if (!users[user.id]) {
   bot.sendMessage(chatId, "Avval /start bosib ro'yxatdan o'ting.");
   return;
  }
  
  // Taklif qilgan odamlar sonini tekshirish
  if ((users[user.id].invited || []).length < 5) {
   bot.sendMessage(chatId, "Oʻyin boshlash uchun siz kamida 5 ta odamni taklif qilishingiz kerak.");
   return;
  }
  
  // Bu yerda siz uni o‘yinga `games.json` orqali qo‘shishingiz mumkin
  bot.sendMessage(chatId, "Siz o‘yinga muvaffaqiyatli qo‘shildingiz!");
});
bot.onText(/\/invite (.+)/, (msg, match) => {
  const inviterId = msg.from.id;
  const invitedUsername = match[1].replace('@', '');
  const users = readUsers();

  if (!users[inviterId]) {
    return bot.sendMessage(msg.chat.id, "Siz ro'yxatdan o'tmagansiz.");
  }

  // Duplicate takliflarni oldini olamiz
  if (!users[inviterId].invited.includes(invitedUsername)) {
    users[inviterId].invited.push(invitedUsername);
    writeUsers(users);
    bot.sendMessage(msg.chat.id, `Siz @${invitedUsername} ni taklif qildingiz!`);
  } else {
    bot.sendMessage(msg.chat.id, `Siz allaqachon bu foydalanuvchini taklif qilgansiz.`);
  }
});


// /addadmin — faqat superadmin
bot.onText(/\/addadmin (\d+)/, (msg, match) => {
  if (msg.from.id !== SUPERADMIN_ID) {
    return bot.sendMessage(msg.chat.id, 'Siz superadmin emassiz.');
  }
  const target = parseInt(match[1], 10);
  const res = addAdmin(target, msg.chat.id);
  bot.sendMessage(msg.chat.id, res.success ? 'Admin qo‘shildi.' : res.error);
});

// /startgame — faqat adminlar
bot.onText(/\/startgame/, (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(msg.from.id);
  if (!user || !user.admin_of.includes(chatId)) {
    return bot.sendMessage(chatId, 'Sizda o‘yin boshlash huquqi yo‘q.');
  }

  const res = startGame(chatId);
  if (res.error) {
    return bot.sendMessage(chatId, res.error);
  }

  // Rollarni shaxsan xabarlash
  res.game.players.forEach(pid => {
    let role = res.game.mafia.includes(pid) ? 'Mafia' :
               (res.game.doctor === pid ? 'Doctor' : 'Fuqarо');
    bot.sendMessage(pid, `Sizning rolingiz: ${role}`);
  });
  bot.sendMessage(chatId, 'O‘yinning rollari taqsimlandi. O‘yin boshlandi!');
});


bot.onText(/\/kill (\d+)/, (msg, m) => {
  const chatId = msg.chat.id;
  const user = getUser(msg.from.id);
  if (!user || !user.admin_of.includes(chatId)) {
    return bot.sendMessage(chatId, 'Admin emassiz.');
  }
  const victim = parseInt(m[1], 10);
  let r = killPlayer(chatId, victim);
  bot.sendMessage(chatId, r.success ? `💀 ${victim} o‘ldirildi.` : r.error);
});

bot.onText(/\/heal (\d+)/, (msg, m) => {
  const chatId = msg.chat.id;
  const user = getUser(msg.from.id);
  if (!user || !user.admin_of.includes(chatId)) {
    return bot.sendMessage(chatId, 'Admin emassiz.');
  }
  const healed = parseInt(m[1], 10);
  let r = healPlayer(chatId, healed);
  bot.sendMessage(chatId, r.success ? `❤️ ${healed} davolandi.` : r.error);
});

// O‘yin holatini ko‘rsatish
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  let game = getGame(chatId);
  if (!game) return bot.sendMessage(chatId, 'O‘yin topilmadi.');
  const alive = Object.values(game.players_status).filter(p=>p.alive).length;
  bot.sendMessage(chatId,
    `▶️ O‘yin holati: ${game.state}\n` +
    `👥 Jami o‘yinchilar: ${game.players.length}\n` +
    `💚 Yashab qolganlar: ${alive}`
  );
});

// Guruhlar bo‘yicha doimiy “kuzatuv” — masalan, non-participant xabarlarni tozalash
setInterval(() => {
  let groups = readGroups();
  groups.forEach(chatId => {
    let game = getGame(chatId);
    clearNonParticipants(bot, chatId, game.players);
  });
}, 5 * 60 * 1000); // har 5 daqiqada

console.log('Mafia bot ishga tushdi');
