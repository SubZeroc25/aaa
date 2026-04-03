'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #050510;
          color: #e2e8f0;
          overflow-x: hidden;
        }

        /* ── Navbar ── */
        .navbar {
          position: fixed; top: 0; width: 100%; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.25rem 3rem;
          background: rgba(5, 5, 16, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-logo {
          font-size: 1.6rem; font-weight: 900;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a {
          color: #94a3b8; text-decoration: none; font-size: 0.95rem;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #e2e8f0; }
        .nav-cta {
          padding: 0.6rem 1.5rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white; border: none; border-radius: 8px; font-weight: 600;
          cursor: pointer; font-size: 0.9rem; text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .nav-cta:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(59,130,246,0.3); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 8rem 2rem 4rem; position: relative;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 50% 20%, rgba(59,130,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 30% 60%, rgba(139,92,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 40%, rgba(6,182,212,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1.25rem; border-radius: 100px;
          background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
          color: #60a5fa; font-size: 0.85rem; font-weight: 600;
          margin-bottom: 2rem; position: relative; z-index: 1;
        }
        .hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900;
          line-height: 1.1; max-width: 800px; position: relative; z-index: 1;
          margin-bottom: 1.5rem;
        }
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 1.25rem; color: #94a3b8; max-width: 600px;
          line-height: 1.7; margin-bottom: 2.5rem; position: relative; z-index: 1;
        }

        /* ── Email Form ── */
        .email-form {
          display: flex; gap: 0.75rem; position: relative; z-index: 1;
          max-width: 500px; width: 100%;
        }
        .email-input {
          flex: 1; padding: 1rem 1.25rem;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: white; font-size: 1rem; outline: none;
          transition: border-color 0.2s;
        }
        .email-input:focus { border-color: #3b82f6; }
        .email-input::placeholder { color: #64748b; }
        .submit-btn {
          padding: 1rem 2rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none; border-radius: 12px; color: white; font-weight: 700;
          font-size: 1rem; cursor: pointer; white-space: nowrap;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .submit-btn:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(59,130,246,0.3); }
        .success-msg {
          color: #34d399; font-size: 1.1rem; font-weight: 600;
          position: relative; z-index: 1;
        }
        .hero-note {
          margin-top: 1rem; color: #475569; font-size: 0.85rem;
          position: relative; z-index: 1;
        }

        /* ── Stats Bar ── */
        .stats-bar {
          display: flex; justify-content: center; gap: 4rem;
          padding: 3rem 2rem; border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.01);
        }
        .stat-item { text-align: center; }
        .stat-number {
          font-size: 2.5rem; font-weight: 900;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .stat-label { color: #64748b; font-size: 0.9rem; margin-top: 0.25rem; }

        /* ── Features ── */
        .section {
          padding: 6rem 2rem; max-width: 1200px; margin: 0 auto;
        }
        .section-title {
          font-size: 2.5rem; font-weight: 800; text-align: center;
          margin-bottom: 1rem;
        }
        .section-sub {
          text-align: center; color: #94a3b8; font-size: 1.15rem;
          max-width: 600px; margin: 0 auto 4rem; line-height: 1.7;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 2.5rem;
          transition: transform 0.3s, border-color 0.3s, background 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-4px); border-color: rgba(59,130,246,0.3);
          background: rgba(255,255,255,0.05);
        }
        .feature-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; margin-bottom: 1.5rem;
          background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
        }
        .feature-card:nth-child(2) .feature-icon { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.2); }
        .feature-card:nth-child(3) .feature-icon { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.2); }
        .feature-card:nth-child(4) .feature-icon { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2); }
        .feature-card:nth-child(5) .feature-icon { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.2); }
        .feature-card:nth-child(6) .feature-icon { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); }
        .feature-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; color: #f1f5f9; }
        .feature-desc { color: #94a3b8; line-height: 1.7; }

        /* ── Comparison Table ── */
        .comparison-wrapper {
          overflow-x: auto; margin-top: 2rem;
        }
        .comparison-table {
          width: 100%; border-collapse: collapse;
          background: rgba(255,255,255,0.02);
          border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .comparison-table th, .comparison-table td {
          padding: 1.25rem 1.5rem; text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .comparison-table th {
          background: rgba(59,130,246,0.08); font-weight: 700;
          color: #e2e8f0; font-size: 0.95rem;
        }
        .comparison-table th.highlight {
          background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15));
          color: #60a5fa;
        }
        .comparison-table td { color: #94a3b8; }
        .comparison-table td:first-child { text-align: right; font-weight: 600; color: #cbd5e1; }
        .comparison-table tr:last-child td { border-bottom: none; }
        .check { color: #34d399; font-size: 1.2rem; }
        .cross { color: #475569; font-size: 1.2rem; }

        /* ── Pricing ── */
        .pricing-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 2rem; max-width: 800px; margin: 0 auto;
        }
        .pricing-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 3rem; text-align: center;
          transition: transform 0.3s;
          position: relative;
        }
        .pricing-card:hover { transform: translateY(-4px); }
        .pricing-card.featured {
          border-color: rgba(59,130,246,0.4);
          background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05));
        }
        .pricing-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          padding: 0.4rem 1.25rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 100px; font-size: 0.8rem; font-weight: 700; color: white;
        }
        .pricing-name { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem; }
        .pricing-price {
          font-size: 3.5rem; font-weight: 900; margin: 1rem 0;
        }
        .pricing-price .currency { font-size: 1.5rem; vertical-align: top; color: #94a3b8; }
        .pricing-price .period { font-size: 1rem; color: #64748b; font-weight: 400; }
        .pricing-features {
          list-style: none; margin: 2rem 0; text-align: right;
        }
        .pricing-features li {
          padding: 0.6rem 0; color: #94a3b8; display: flex;
          align-items: center; gap: 0.75rem;
        }
        .pricing-features li::before { content: '✓'; color: #34d399; font-weight: 700; }
        .pricing-btn {
          display: block; width: 100%; padding: 1rem;
          border-radius: 12px; font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none; text-align: center;
        }
        .pricing-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none; color: white;
        }
        .pricing-btn.primary:hover { transform: scale(1.03); box-shadow: 0 8px 30px rgba(59,130,246,0.3); }
        .pricing-btn.secondary {
          background: transparent; border: 1px solid rgba(255,255,255,0.15);
          color: #e2e8f0;
        }
        .pricing-btn.secondary:hover { border-color: rgba(255,255,255,0.3); transform: scale(1.03); }

        /* ── Footer ── */
        .footer {
          text-align: center; padding: 3rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: #475569; font-size: 0.85rem;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .navbar { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .stats-bar { gap: 2rem; flex-wrap: wrap; }
          .stat-number { font-size: 1.8rem; }
          .email-form { flex-direction: column; }
          .pricing-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">SubZero</div>
        <ul className="nav-links">
          <li><a href="#features">פיצ׳רים</a></li>
          <li><a href="#compare">השוואה</a></li>
          <li><a href="#pricing">מחירים</a></li>
        </ul>
        <a href="#pricing" className="nav-cta">התחל חינם</a>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">🧊 AI-Powered Subscription Management</div>
        <h1>
          <span>תפסיק לשלם על מנויים</span><br />
          <span className="gradient-text">ששכחת שקיימים</span>
        </h1>
        <p className="hero-sub">
          SubZero סורק את החשבונות שלך, מזהה מנויים מיותרים, וחוסך לך אלפי שקלים בשנה — הכל אוטומטית.
        </p>

        {!submitted ? (
          <form className="email-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="email-input"
              placeholder="הכנס את המייל שלך..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="submit-btn">קבל גישה מוקדמת</button>
          </form>
        ) : (
          <p className="success-msg">🎉 נרשמת בהצלחה! נעדכן אותך כשנשיק.</p>
        )}
        <p className="hero-note">ללא כרטיס אשראי · חינם לנצח בתוכנית הבסיסית</p>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">10,000+</div>
          <div className="stat-label">משתמשים פעילים</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">₪2.5M+</div>
          <div className="stat-label">נחסך למשתמשים</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50+</div>
          <div className="stat-label">שירותים נתמכים</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">4.9★</div>
          <div className="stat-label">דירוג משתמשים</div>
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <h2 className="section-title">למה <span className="gradient-text">SubZero</span>?</h2>
        <p className="section-sub">כל הכלים שצריך כדי לשלוט בהוצאות החודשיות שלך</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <div className="feature-title">סריקה אוטומטית</div>
            <div className="feature-desc">AI שסורק את חשבון הבנק ומזהה כל מנוי — גם כאלה ששכחת מזמן</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <div className="feature-title">המלצות חכמות</div>
            <div className="feature-desc">מזהה מנויים כפולים, לא בשימוש, או יקרים מדי ומציע חלופות זולות</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <div className="feature-title">התראות חידוש</div>
            <div className="feature-desc">מקבל התראה לפני שמנוי מתחדש — לעולם לא תופתע מחיוב</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <div className="feature-title">דשבורד מלא</div>
            <div className="feature-desc">תמונה ברורה ויזואלית של כל ההוצאות החודשיות במקום אחד</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <div className="feature-title">ביטול בקליק</div>
            <div className="feature-desc">מבטל מנויים ישירות מהאפליקציה — בלי להתקשר לשירות לקוחות</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <div className="feature-title">אבטחה מלאה</div>
            <div className="feature-desc">הצפנה בנקאית, read-only גישה, ותאימות ל-SOC2 ו-GDPR</div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section" id="compare">
        <h2 className="section-title">איך אנחנו משתווים?</h2>
        <p className="section-sub">SubZero מול הפתרונות האחרים בשוק</p>
        <div className="comparison-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>פיצ׳ר</th>
                <th className="highlight">SubZero</th>
                <th>Trim</th>
                <th>Truebill</th>
                <th>ידני</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>זיהוי אוטומטי AI</td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="cross">✕</span></td>
              </tr>
              <tr>
                <td>תמיכה בעברית</td>
                <td><span className="check">✓</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>בנקים ישראליים</td>
                <td><span className="check">✓</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>ביטול בקליק</td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="cross">✕</span></td>
              </tr>
              <tr>
                <td>תוכנית חינמית</td>
                <td><span className="check">✓</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="check">✓</span></td>
                <td><span className="check">✓</span></td>
              </tr>
              <tr>
                <td>ללא עמלה על חיסכון</td>
                <td><span className="check">✓</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="cross">✕</span></td>
                <td><span className="check">✓</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section className="section" id="pricing">
        <h2 className="section-title">תוכניות <span className="gradient-text">ומחירים</span></h2>
        <p className="section-sub">התחל חינם, שדרג כשתרצה</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">Free</div>
            <div className="pricing-price">
              <span className="currency">₪</span>0<span className="period">/חודש</span>
            </div>
            <ul className="pricing-features">
              <li>עד 5 מנויים</li>
              <li>סריקה חודשית</li>
              <li>דשבורד בסיסי</li>
              <li>התראות מייל</li>
            </ul>
            <a href="#" className="pricing-btn secondary">התחל חינם</a>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">הכי פופולרי</div>
            <div className="pricing-name">Pro</div>
            <div className="pricing-price">
              <span className="currency">₪</span>9.99<span className="period">/חודש</span>
            </div>
            <ul className="pricing-features">
              <li>מנויים ללא הגבלה</li>
              <li>סריקה יומית</li>
              <li>ביטול בקליק</li>
              <li>המלצות AI מתקדמות</li>
              <li>דשבורד מלא + ייצוא</li>
              <li>התראות push + מייל</li>
              <li>תמיכה בצ׳אט</li>
            </ul>
            <a href="#" className="pricing-btn primary">התחל תקופת ניסיון</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        SubZero &copy; {new Date().getFullYear()} — All rights reserved | Powered by O2C
      </footer>
    </>
  );
}
