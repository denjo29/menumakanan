const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('./database/settings.js'));

const bot = new TelegramBot(settings.token, { polling: true });
const PREMIUM_FILE = './database/premiumusers.json';

// Utility Functions
const isAdmin = (userId) => settings.admins.includes(String(userId)) || String(userId) === settings.ownerId;
const isOwner = (userId) => String(userId) === settings.ownerId;

if (!fs.existsSync(PREMIUM_FILE)) fs.writeFileSync(PREMIUM_FILE, JSON.stringify({}));

// Handler: /addprem (Hanya Owner/Admin)
bot.onText(/\/addprem (\d+) (\d+)/, (msg, match) => {
    if (!isAdmin(msg.from.id)) return;
    const targetId = match[1];
    const days = parseInt(match[2]);
    const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);

    const db = JSON.parse(fs.readFileSync(PREMIUM_FILE));
    db[targetId] = expiry;
    fs.writeFileSync(PREMIUM_FILE, JSON.stringify(db, null, 2));

    bot.sendMessage(msg.chat.id, `✅ User \`${targetId}\` berhasil menjadi Premium selama ${days} hari.`, { parse_mode: "Markdown" });
});

// Handler: /createlink (Hanya Owner/Admin/Premium)
bot.onText(/\/createlink (.+)/, (msg, match) => {
    const userId = String(msg.from.id);
    const db = JSON.parse(fs.readFileSync(PREMIUM_FILE));
    
    // Cek apakah user Admin atau Premium yang belum expired
    const isPremium = db[userId] && db[userId] > Date.now();
    if (!isAdmin(userId) && !isPremium) {
        return bot.sendMessage(msg.chat.id, "❌ Anda memerlukan akses Premium untuk fitur ini.");
    }

    const path = match[1].toLowerCase().replace(/\s+/g, '-');
    const link = `${settings.baseUrlVercel}/index.html?ref=${userId}&path=${path}`;

    bot.sendMessage(msg.chat.id, `🚀 **Link Berhasil Dibuat**\n\n🔗 Link: \`${link}\`\n👤 Creator: ${msg.from.first_name}`, { parse_mode: "Markdown" });
});

console.log("✅ Bot Lacak Aktif...");