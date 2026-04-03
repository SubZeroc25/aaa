/**
 * O2C Router - Cloudflare Worker
 * Routes: /subzero, /poli, /poli/api/chat, /health, /domains
 * Hostname routing: subzero.o2c.one → SubZero landing page
 */

// ─── HTML Templates ────────────────────────────────────────────────

const SUBZERO_HTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SubZero - ניהול מנויים חכם</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0d1137 100%);
      color: #e0e0e0;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
      position: relative;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
      animation: float 20s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(-2%, 2%); }
    }
    .logo {
      font-size: 4rem;
      font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }
    .tagline {
      font-size: 1.5rem;
      color: #94a3b8;
      margin-bottom: 3rem;
      position: relative;
      z-index: 1;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      max-width: 900px;
      width: 100%;
      position: relative;
      z-index: 1;
    }
    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      transition: transform 0.3s, border-color 0.3s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      border-color: rgba(59, 130, 246, 0.4);
    }
    .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .feature-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }
    .feature-desc { color: #94a3b8; line-height: 1.6; }
    .cta-section {
      margin-top: 3rem;
      position: relative;
      z-index: 1;
    }
    .cta-btn {
      display: inline-block;
      padding: 1rem 2.5rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      font-size: 1.1rem;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 30px rgba(59, 130, 246, 0.3);
    }
    .stats {
      display: flex;
      gap: 3rem;
      margin-top: 2rem;
      position: relative;
      z-index: 1;
    }
    .stat { text-align: center; }
    .stat-num {
      font-size: 2rem;
      font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label { color: #64748b; font-size: 0.9rem; margin-top: 0.25rem; }
    footer {
      text-align: center;
      padding: 2rem;
      color: #475569;
      font-size: 0.85rem;
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="logo">SubZero</div>
    <p class="tagline">ניהול מנויים חכם — חסוך כסף בלי מאמץ</p>
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">🔍</div>
        <div class="feature-title">זיהוי אוטומטי</div>
        <div class="feature-desc">סריקה חכמה של חשבון הבנק שלך — מזהה את כל המנויים בלי שתצטרך לחפש</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💰</div>
        <div class="feature-title">חיסכון מיידי</div>
        <div class="feature-desc">התראות על מנויים כפולים, לא בשימוש, או יקרים מדי — עם המלצות לחיסכון</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <div class="feature-title">דשבורד מלא</div>
        <div class="feature-desc">תמונה ברורה של כל ההוצאות החודשיות שלך במקום אחד</div>
      </div>
    </div>
    <div class="cta-section">
      <a href="#" class="cta-btn">הרשמה חינם</a>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-num">10K+</div>
        <div class="stat-label">משתמשים</div>
      </div>
      <div class="stat">
        <div class="stat-num">₪2.5M</div>
        <div class="stat-label">נחסך</div>
      </div>
      <div class="stat">
        <div class="stat-num">50+</div>
        <div class="stat-label">שירותים נתמכים</div>
      </div>
    </div>
  </div>
  <footer>SubZero &copy; 2024 — All rights reserved | Powered by O2C</footer>
</body>
</html>`;

const POLYBET_HTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PolyBet - הימורים חכמים עם AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a0a2e 50%, #0a1628 100%);
      color: #e0e0e0;
      min-height: 100vh;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 3rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .brand {
      font-size: 1.8rem;
      font-weight: 900;
      background: linear-gradient(135deg, #f59e0b, #ef4444, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    nav a {
      color: #94a3b8;
      text-decoration: none;
      margin-right: 2rem;
      transition: color 0.2s;
    }
    nav a:hover { color: #f59e0b; }
    .main-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }
    .chat-container {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 2rem;
      min-height: 400px;
      display: flex;
      flex-direction: column;
    }
    .chat-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .chat-header h2 {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .chat-header p { color: #64748b; margin-top: 0.5rem; }
    .messages {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .message {
      padding: 1rem 1.25rem;
      border-radius: 16px;
      max-width: 80%;
      line-height: 1.6;
    }
    .message.assistant {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      align-self: flex-start;
    }
    .message.user {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      align-self: flex-end;
    }
    .chat-input-area {
      display: flex;
      gap: 0.75rem;
    }
    .chat-input {
      flex: 1;
      padding: 1rem 1.25rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: #f59e0b; }
    .send-btn {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .send-btn:hover { transform: scale(1.05); }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  </style>
</head>
<body>
  <header>
    <div class="brand">PolyBet</div>
    <nav>
      <a href="/subzero">SubZero</a>
      <a href="/poli">PolyBet</a>
    </nav>
  </header>
  <div class="main-content">
    <div class="chat-container">
      <div class="chat-header">
        <h2>PolyBet AI Assistant</h2>
        <p>שאל אותי על שווקי הימורים, סיכויים, ואסטרטגיות</p>
      </div>
      <div class="messages" id="messages">
        <div class="message assistant">שלום! אני PolyBet AI. איך אוכל לעזור לך היום?</div>
      </div>
      <div class="chat-input-area">
        <input type="text" class="chat-input" id="chatInput" placeholder="שאל שאלה..." />
        <button class="send-btn" id="sendBtn" onclick="sendMessage()">שלח</button>
      </div>
    </div>
  </div>
  <script>
    const messagesEl = document.getElementById('messages');
    const inputEl = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    async function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;

      appendMessage('user', text);
      inputEl.value = '';
      sendBtn.disabled = true;

      try {
        const res = await fetch('/poli/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        appendMessage('assistant', data.reply || data.error || 'No response');
      } catch (err) {
        appendMessage('assistant', 'Error: ' + err.message);
      } finally {
        sendBtn.disabled = false;
        inputEl.focus();
      }
    }

    function appendMessage(role, text) {
      const div = document.createElement('div');
      div.className = 'message ' + role;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  </script>
</body>
</html>`;

// ─── CORS Headers ──────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html;charset=UTF-8', ...CORS_HEADERS },
  });
}

// ─── Chat API (Claude) ────────────────────────────────────────────

async function handleChat(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { message } = await request.json();
    if (!message) {
      return jsonResponse({ error: 'Missing "message" field' }, 400);
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'ANTHROPIC_API_KEY not configured' }, 500);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: 'You are PolyBet AI, a helpful assistant specializing in prediction markets, betting odds, and strategies. Respond in Hebrew when the user writes in Hebrew. Be concise and informative.',
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return jsonResponse({ error: `Claude API error: ${response.status}`, details: err }, 502);
    }

    const result = await response.json();
    const reply = result.content?.[0]?.text || 'No response from AI';
    return jsonResponse({ reply });

  } catch (err) {
    return jsonResponse({ error: 'Internal error', details: err.message }, 500);
  }
}

// ─── Domain Info ───────────────────────────────────────────────────

function handleDomains() {
  return jsonResponse({
    domains: [
      { hostname: 'subzero.o2c.one', route: '/subzero', description: 'SubZero Landing Page' },
      { hostname: '*', route: '/poli', description: 'PolyBet AI Chat' },
      { hostname: '*', route: '/poli/api/chat', description: 'PolyBet Chat API (POST)' },
      { hostname: '*', route: '/health', description: 'Health Check' },
      { hostname: '*', route: '/domains', description: 'This endpoint' },
    ],
  });
}

// ─── Main Router ───────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Hostname-based routing: subzero.o2c.one → SubZero page
    if (hostname === 'subzero.o2c.one') {
      return htmlResponse(SUBZERO_HTML);
    }

    // Path-based routing
    switch (true) {
      // Health check
      case path === '/health':
        return jsonResponse({
          status: 'ok',
          worker: 'o2c-router',
          timestamp: new Date().toISOString(),
          routes: ['/subzero', '/poli', '/poli/api/chat', '/health', '/domains'],
        });

      // Domain info
      case path === '/domains':
        return handleDomains();

      // SubZero landing page
      case path === '/subzero' || path === '/subzero/':
        return htmlResponse(SUBZERO_HTML);

      // PolyBet chat API
      case path === '/poli/api/chat':
        return handleChat(request, env);

      // PolyBet UI
      case path === '/poli' || path === '/poli/':
        return htmlResponse(POLYBET_HTML);

      // Root → redirect to SubZero
      case path === '/' || path === '':
        return htmlResponse(SUBZERO_HTML);

      // 404
      default:
        return jsonResponse({
          error: 'Not Found',
          message: `Route "${path}" does not exist`,
          availableRoutes: ['/subzero', '/poli', '/poli/api/chat', '/health', '/domains'],
        }, 404);
    }
  },
};
