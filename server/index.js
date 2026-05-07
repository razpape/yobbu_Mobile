require('dotenv').config({ path: './server/.env' });
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Lightweight request log (skip large bodies)
app.use((req, _, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Increase body size limit for image uploads
app.use(express.json({ limit: '10mb' }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In-memory OTP store — replace with Redis/DB in production
const otpStore = new Map(); // phone -> { code, expiresAt }

// POST /send-otp  { phone: '+12125550000' }
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(phone, { code, expiresAt });

  console.log(`OTP for ${phone}: ${code}`);

  try {
    await client.messages.create({
      body: `Your Yobbu verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Twilio error:', err.message);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// POST /verify-otp  { phone: '+12125550000', code: '123456' }
app.post('/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  const entry = otpStore.get(phone);

  if (!entry) return res.status(400).json({ error: 'No OTP found for this number' });
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (entry.code !== code) return res.status(400).json({ error: 'Invalid code' });

  otpStore.delete(phone);
  res.json({ success: true });
});

// POST /verify-otp-auth  { phone: '+12125550000', otp: '123456' } - unified signup/signin
app.post('/verify-otp-auth', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  const entry = otpStore.get(phone);

  if (!entry) return res.status(400).json({ error: 'No OTP found' });
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (entry.code !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  otpStore.delete(phone);

  try {
    // Check if user exists with this phone
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    let userId, email, fullName;

    if (existingUser) {
      // Sign in existing user
      userId = existingUser.id;
      email = existingUser.email;
      fullName = existingUser.name || 'User';
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ phone, name: 'User', email: null }])
        .select('*')
        .single();

      if (insertError) {
        console.error('[DB] Insert error:', insertError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      userId = newUser.id;
      email = newUser.email;
      fullName = newUser.name;
    }

    // Create session token
    const sessionToken = Buffer.from(`${userId}:${phone}:${Date.now()}`).toString('base64');

    res.json({
      sessionToken,
      userId,
      email,
      fullName,
      phone,
    });
  } catch (err) {
    console.error('[Auth] Exception:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /auth/social-login  { provider: 'google', accessToken: '...', idToken: '...' }
app.post('/auth/social-login', async (req, res) => {
  const { provider, accessToken } = req.body;
  if (!provider) return res.status(400).json({ error: 'Provider required' });

  try {
    let email, name;

    if (provider === 'google' && accessToken) {
      // Fetch user info from Google using accessToken
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoRes.ok) {
        const error = await userInfoRes.text();
        console.error('[Google] User info fetch failed:', error);
        return res.status(400).json({ error: 'Failed to fetch user info from Google' });
      }

      const userInfo = await userInfoRes.json();
      email = userInfo.email;
      name = userInfo.name;
    } else {
      return res.status(400).json({ error: 'Missing accessToken or unsupported provider' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Could not retrieve email from provider' });
    }

    // Save or update user in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    let userId;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ email, name: name || 'User', provider }])
        .select('id')
        .single();

      if (insertError) {
        console.error('[DB] Insert error:', insertError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      userId = newUser.id;
    }

    // Create session token with user ID
    const sessionToken = Buffer.from(`${userId}:${email}:${Date.now()}`).toString('base64');

    res.json({
      sessionToken,
      userId,
      email,
      fullName: name || 'User',
    });
  } catch (err) {
    console.error('[Auth] Exception:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Detect image format from base64 magic bytes
function detectMediaType(base64) {
  if (!base64) return 'image/jpeg';
  // Decode first few bytes to detect format
  const header = Buffer.from(base64.substring(0, 16), 'base64');
  if (header[0] === 0xFF && header[1] === 0xD8) return 'image/jpeg';
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return 'image/png';
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) return 'image/gif';
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) return 'image/webp';
  return 'image/jpeg';
}

// POST /scan-package  { base64: '...', mediaType: 'image/jpeg' }
app.post('/scan-package', async (req, res) => {
  const { base64 } = req.body;
  if (!base64) return res.status(400).json({ error: 'Image required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Anthropic API key not configured' });

  const mediaType = detectMediaType(base64);
  console.log('[Scan] Detected media type:', mediaType);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `You are a shipping assistant for Yobbu, a peer delivery app serving West Africa (Senegal, Côte d'Ivoire, Mali, Ghana, Nigeria) and the diaspora in the US and Europe.

Identify what is in this image. Include traditional West African items like boubou, thiéboudienne ingredients, bissap, café Touba, thiakry, kora, wax fabric, etc.

Respond ONLY with valid JSON, no extra text:
{
  "itemName": "short item name",
  "category": "Clothes" or "Electronics" or "Food Items" or "Documents" or "Other",
  "weightEstimate": "estimated weight as number like 0.5",
  "description": "one sentence description for the traveler"
}`,
            },
          ],
        }],
      }),
    });

    console.log('[Scan] Anthropic status:', response.status);
    if (!response.ok) {
      const data = await response.json();
      const errorMsg = data.error?.message || data.message || JSON.stringify(data);
      console.error('[Scan] API error:', response.status, errorMsg);
      return res.status(response.status).json({ error: errorMsg });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    console.log('[Scan] Claude says:', text);
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Could not parse response' });

    res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error('[Scan] Exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Yobbu server running on http://192.168.1.178:${PORT}`));
