import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const LOGO = "/loadhawk-logo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
  .lh-forgot *,.lh-forgot *::before,.lh-forgot *::after{box-sizing:border-box;margin:0;padding:0}
  .lh-forgot{
    --bg:#0d0d0d;--card:#161616;--border:#282828;--border2:#333;
    --gold:#f5a820;--gold3:#d97706;--white:#f0ece4;
    --muted:#505050;--muted2:#888;--red:#e05555;
    --fd:"Bebas Neue",sans-serif;--fb:"DM Sans",sans-serif;--fm:"JetBrains Mono",monospace;
    background:var(--bg);color:var(--white);font-family:var(--fb);min-height:100vh;
  }
  :root:not(.dark) .lh-forgot{
    --bg:#f5f5f7;--card:#ffffff;--border:#e0e0e0;--border2:#d1d1d6;
    --white:#1d1d1f;--muted:#a1a1a6;--muted2:#6e6e73;
  }
  :root:not(.dark) .lh-forgot .lb{background:#fff}
  :root:not(.dark) .lh-forgot .li{mix-blend-mode:multiply}
  :root:not(.dark) .lh-forgot .bgd{background-image:radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px)}
  :root:not(.dark) .lh-forgot input:-webkit-autofill,:root:not(.dark) .lh-forgot input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #f5f5f7 inset;-webkit-text-fill-color:#1d1d1f}
  :root:not(.dark) .lh-forgot .inp:focus{background:#fff}
  :root:not(.dark) .lh-forgot .cd{box-shadow:0 0 0 1px rgba(245,168,32,.06),0 8px 30px rgba(0,0,0,.08)}
  :root:not(.dark) .lh-forgot .success-box .s-text strong{color:#333}
  .lh-forgot .shell{width:100%;max-width:420px;min-height:100vh;margin:0 auto;background:var(--bg);display:flex;flex-direction:column;position:relative;overflow:hidden}
  .lh-forgot .bgl{position:absolute;inset:0;pointer-events:none;z-index:0}
  .lh-forgot .bgc{position:absolute;bottom:25%;left:50%;transform:translateX(-50%);width:340px;height:340px;background:radial-gradient(ellipse,rgba(245,168,32,.11) 0%,transparent 65%);animation:lh-bgp 7s ease-in-out infinite}
  .lh-forgot .bgd{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px);background-size:26px 26px;mask-image:radial-gradient(ellipse 80% 60% at 50% 65%,black,transparent)}
  @keyframes lh-bgp{0%,100%{opacity:.5}50%{opacity:1}}
  .lh-forgot .ls{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;padding:48px 24px 0}
  .lh-forgot .lw{position:relative;width:200px;height:96px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
  .lh-forgot .lb{position:absolute;inset:0;background:#000;border-radius:10px}
  .lh-forgot .li{position:relative;z-index:2;width:100%;height:100%;object-fit:contain;mix-blend-mode:screen;animation:lh-lf 4s ease-in-out infinite}
  .lh-forgot .lw::after{content:"";position:absolute;inset:-14px;border-radius:18px;background:radial-gradient(ellipse,rgba(245,168,32,.18) 0%,transparent 68%);z-index:1;pointer-events:none;animation:lh-lg 3.5s ease-in-out infinite}
  @keyframes lh-lf{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  @keyframes lh-lg{0%,100%{opacity:.6}50%{opacity:1}}
  .lh-forgot .cd{position:relative;z-index:10;margin:24px 14px 0;background:var(--card);border-radius:20px;border:1px solid var(--border2);padding:28px 22px 28px;box-shadow:0 0 0 1px rgba(245,168,32,.04),0 20px 60px rgba(0,0,0,.6)}
  .lh-forgot .cd::before{content:"";position:absolute;top:0;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,rgba(245,168,32,.45),transparent)}
  .lh-forgot .title{font-family:var(--fd);font-size:28px;letter-spacing:2px;color:var(--gold);text-align:center;margin-bottom:6px}
  .lh-forgot .subtitle{font-family:var(--fm);font-size:11px;color:var(--muted2);text-align:center;margin-bottom:22px;line-height:1.5}
  .lh-forgot .fi{margin-bottom:14px}
  .lh-forgot .fl{display:block;font-family:var(--fm);font-size:9.5px;font-weight:700;letter-spacing:2.5px;color:var(--muted2);margin-bottom:5px}
  .lh-forgot .fw{position:relative;display:flex;align-items:center}
  .lh-forgot .fic{position:absolute;left:12px;font-size:16px;pointer-events:none;z-index:2;opacity:.45;line-height:1;display:flex;align-items:center}
  .lh-forgot .inp{width:100%;background:var(--bg);border:1.5px solid var(--border2);border-radius:11px;padding:12px 13px 12px 40px;font-size:14px;font-weight:500;color:var(--white);font-family:var(--fb);outline:none;transition:all .18s;-webkit-appearance:none}
  .lh-forgot .inp::placeholder{color:var(--muted)}
  .lh-forgot .inp:focus{border-color:var(--gold3);background:#111;box-shadow:0 0 0 3px rgba(245,168,32,.1)}
  .lh-forgot .inp.err{border-color:var(--red);box-shadow:0 0 0 3px rgba(220,85,85,.1)}
  .lh-forgot .em{font-family:var(--fm);font-size:10px;color:var(--red);margin-top:4px;padding-left:2px;display:flex;align-items:center;gap:4px;animation:lh-sk .3s ease}
  @keyframes lh-sk{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
  .lh-forgot .cta{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#f5a820,#d97706);color:#000;font-size:14px;font-weight:800;font-family:var(--fm);letter-spacing:2px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 24px rgba(245,168,32,.38);margin-top:6px}
  .lh-forgot .cta:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(245,168,32,.55)}
  .lh-forgot .cta:active{transform:translateY(0)}
  .lh-forgot .cta.loading{pointer-events:none;opacity:.8}
  .lh-forgot .sp{width:16px;height:16px;border:2.5px solid rgba(0,0,0,.25);border-top-color:#000;border-radius:50%;animation:lh-spin .65s linear infinite}
  @keyframes lh-spin{to{transform:rotate(360deg)}}
  .lh-forgot .success-box{text-align:center;padding:20px 16px;background:rgba(245,168,32,0.08);border-radius:14px;border:1px solid rgba(245,168,32,0.2);margin-bottom:16px}
  .lh-forgot .success-box .s-icon{font-size:28px;margin-bottom:8px}
  .lh-forgot .success-box .s-title{font-size:14px;font-weight:700;color:var(--gold);margin-bottom:6px;font-family:var(--fm)}
  .lh-forgot .success-box .s-text{font-size:12px;color:var(--muted2);line-height:1.6}
  .lh-forgot .success-box .s-text strong{color:#ccc}
  .lh-forgot .back{display:block;text-align:center;margin-top:18px;font-family:var(--fm);font-size:12px;color:var(--gold);cursor:pointer;opacity:.85;font-weight:600;text-decoration:none;letter-spacing:1px}
  .lh-forgot .back:hover{opacity:1}
  .lh-forgot input:-webkit-autofill,.lh-forgot input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #0d0d0d inset;-webkit-text-fill-color:#f0ece4}
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.includes("@") || !email.includes(".")) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="lh-forgot">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="shell">
        <div className="bgl">
          <div className="bgc" />
          <div className="bgd" />
        </div>

        <div className="ls">
          <div className="lw">
            <div className="lb" />
            <img src={LOGO} className="li" alt="LoadHawk" />
          </div>
        </div>

        <div className="cd">
          <div className="title">RESET PASSWORD</div>
          <div className="subtitle">
            Enter the email address associated with your account and we will send you a link to reset your password.
          </div>

          {sent ? (
            <div className="success-box">
              <div className="s-icon">{"\u2709"}</div>
              <div className="s-title">Reset link sent</div>
              <div className="s-text">
                We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions to reset your password.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="fi">
                <label className="fl">EMAIL</label>
                <div className="fw">
                  <span className="fic">{"\u{1F4E7}"}</span>
                  <input
                    className={"inp" + (error ? " err" : "")}
                    placeholder="driver@loadhawk.io"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                {error && <div className="em">{"\u26A0"} {error}</div>}
              </div>

              <button className={"cta" + (loading ? " loading" : "")} type="submit">
                {loading ? (
                  <>
                    <div className="sp" />
                    <span>SENDING...</span>
                  </>
                ) : (
                  "SEND RESET LINK"
                )}
              </button>
            </form>
          )}

          <a className="back" onClick={() => navigate("/login")}>
            {"\u2190"} BACK TO SIGN IN
          </a>
        </div>
      </div>
    </div>
  );
}
