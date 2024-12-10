const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const clientId = 'bb9289daf80c4dbcb819188ee9af98cb'; // Replace with your Spotify client ID
const clientSecret = 'de0227d89c8d4edfb8e94b1d83f7610b'; // Replace with your Spotify client secret
const redirectUri = 'https://dazzling-bavarois-ed00a0.netlify.app'; // Replace with your redirect URI

let refreshToken = null;

// Exchange authorization code for tokens
app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    refreshToken = response.data.refresh_token;
    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response.data);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// Refresh access token
app.get('/auth/refresh', async (req, res) => {
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token not available' });
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error('Error refreshing token:', error.response.data);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
