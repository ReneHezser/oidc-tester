const express = require('express');
const session = require('express-session');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const https = require('https');
const qs = require('querystring');

const app = express();
const PORT = 5000;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'oidc-secret', resave: false, saveUninitialized: true }));

app.get('/', (req, res) => {
  console.log('[GET /] Rendering index page');
  res.render('index');
});

app.post('/start', async (req, res) => {
  const { discovery_url, client_id, client_secret, redirect_uri, scope } = req.body;

  console.log('[POST /start] Received configuration:');
  console.log({ discovery_url, client_id, redirect_uri, scope });

  try {
    const discovery = await axios.get(discovery_url, { httpsAgent });
    console.log('[POST /start] Discovery document retrieved:', discovery_url);

    req.session.discovery = discovery.data;
    req.session.client_id = client_id;
    req.session.client_secret = client_secret;
    req.session.redirect_uri = redirect_uri;
    req.session.scope = scope || 'openid profile email';

    const authUrl = discovery.data.authorization_endpoint + '?' + qs.stringify({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope: req.session.scope,
    });

    console.log('[POST /start] Redirecting to authorization URL:', authUrl);
    res.redirect(authUrl);
  } catch (err) {
    console.error('[POST /start] Error retrieving discovery document:', err.message);
    res.send(`Failed to fetch discovery: ${err}`);
  }
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const {
    discovery,
    client_id,
    client_secret,
    redirect_uri
  } = req.session;

  console.log('[GET /callback] Authorization code received:', code);

  try {
    const tokenResp = await axios.post(
      discovery.token_endpoint,
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id,
        client_secret
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        httpsAgent
      }
    );

    const { access_token, id_token } = tokenResp.data;
    console.log('[GET /callback] Tokens received.');
    if (access_token) console.log('[GET /callback] Access Token (truncated):', access_token.substring(0, 20) + '...');
    if (id_token) console.log('[GET /callback] ID Token (truncated):', id_token.substring(0, 20) + '...');

    req.session.id_token = id_token;

    const decode = (token) => {
      try {
        return jwt.decode(token);
      } catch {
        return null;
      }
    };

    res.render('tokens', {
      raw_tokens: JSON.stringify(tokenResp.data, null, 2),
      access_token,
      id_token,
      access_claims: decode(access_token),
      id_claims: decode(id_token),
      expires_in: decode(access_token)?.exp,
      logout_url: discovery.end_session_endpoint
    });
  } catch (err) {
    console.error('[GET /callback] Token exchange failed:', err.message);
    res.send(`Token exchange failed: ${err}`);
  }
});

app.get('/logout', (req, res) => {
  const { id_token } = req.session;
  const endSession = req.session.discovery?.end_session_endpoint;
  const redirectUrl = `${req.protocol}://${req.get('host')}/`;

  console.log('[GET /logout] Logging out...');
  req.session.destroy(() => {
    if (endSession && id_token) {
      const logoutRedirect = endSession + '?' + qs.stringify({
        id_token_hint: id_token,
        post_logout_redirect_uri: redirectUrl
      });
      console.log('[GET /logout] Redirecting to end_session_endpoint:', logoutRedirect);
      res.redirect(logoutRedirect);
    } else {
      console.log('[GET /logout] No end_session_endpoint found, redirecting to index');
      res.redirect(redirectUrl);
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ OIDC Tester running at http://localhost:${PORT}`);
});

