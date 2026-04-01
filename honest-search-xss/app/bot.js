const express = require('express');
const puppeteer = require('puppeteer-core');
const { URL } = require('url');

const app = express();
app.use(express.json());

const FLAG = process.env.FLAG || "CTF{X55_F1lt3r_Byp4ss_w1th_3v3nt_H4ndl3rs}";

app.post('/visit', async (req, res) => {
    const targetUrl = req.body.url;

    let parsed;
    try {
        parsed = new URL(targetUrl);
    } catch {
        return res.status(400).send("Invalid URL");
    }

    // ✅ Allow only localhost / 127.0.0.1 (ANY port)
    if (!['localhost', '127.0.0.1'].includes(parsed.hostname)) {
        return res.status(400).send("Only local URLs allowed");
    }

    try {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // ✅ Step 1: Visit base origin dynamically
        const origin = `${parsed.protocol}//${parsed.hostname}:${parsed.port || 80}`;
        await page.goto(origin);

        // ✅ Step 2: Set cookie dynamically (NO HARDCODED DOMAIN)
        await page.setCookie({
            name: 'admin_session',
            value: FLAG,
            url: origin,           // 🔥 key fix
            httpOnly: false,
            sameSite: 'Lax'
        });

        // ✅ Step 3: Visit attacker URL
        await page.goto(targetUrl, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        // ✅ Step 4: Give time for XSS exfil
        await new Promise(r => setTimeout(r, 5000));

        await browser.close();

        res.send("Admin visited successfully");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.listen(3001, () => console.log('🔥 Admin Bot running on port 3001'));
