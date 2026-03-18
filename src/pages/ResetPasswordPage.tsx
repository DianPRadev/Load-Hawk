import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const LOGO = "/loadhawk-logo.png";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
  .lh-reset *,.lh-reset *::before,.lh-reset *::after{box-sizing:border-box;margin:0;padding:0}
  .lh-reset{
    --bg:#0d0d0d;--card:#161616;--border:#282828;--border2:#333;
    --gold:#f5a820;--gold3:#d97706;--white:#f0ece4;
    --muted:#505050;--muted2:#888;--red:#e05555;
    --fd:"Bebas Neue",sans-serif;--fb:"DM Sans",sans-serif;--fm:"JetBrains Mono",monospace;
    background:var(--bg);color:var(--white);font-family:var(--fb);min-height:100vh;
  }
  :root:not(.dark) .lh-reset{
    --bg:#f5f5f7;--card:#ffffff;--border:#e0e0e0;--border2:#d1d1d6;
    --white:#1d1d1f;--muted:#a1a1a6;--muted2:#6e6e73;
  }
  :root:not(.dark) .lh-reset .lb{background:#fff}
  :root:not(.dark) .lh-reset .li{mix-blend-mode:multiply}
  :root:not(.dark) .lh-reset .bgd{background-image:radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px)}
  :root:not(.dark) .lh-reset input:-webkit-autofill,:root:not(.dark) .lh-reset input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #f5f5f7 inset;-webkit-text-fill-color:#1d1d1f}
  :root:not(.dark) .lh-reset .inp:focus{background:#fff}
  :root:not(.dark) .lh-reset .cd{box-shadow:0 0 0 1px rgba(245,168,32,.06),0 8px 30px rgba(0,0,0,.08)}
  .lh-reset .shell{width:100%;max-width:420px;min-height:100vh;margin:0 auto;background:var(--bg);display:flex;flex-direction:column;position:relative;overflow:hidden}
  .lh-reset .bgl{position:absolute;inset:0;pointer-events:none;z-index:0}
  .lh-reset .bgc{position:absolute;bottom:25%;left:50%;transform:translateX(-50%);width:340px;height:340px;background:radial-gradient(ellipse,rgba(245,168,32,.11) 0%,transparent 65%);animation:lh-bgp2 7s ease-in-out infinite}
  .lh-reset .bgd{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px);background-size:26px 26px;mask-image:radial-gradient(ellipse 80% 60% at 50% 65%,black,transparent)}
  @keyframes lh-bgp2{0%,100%{opacity:.5}50%{opacity:1}}
  .lh-reset .ls{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;padding:48px 24px 0}
  .lh-reset .lw{position:relative;width:200px;height:96px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
  .lh-reset .lb{position:absolute;inset:0;background:#000;border-radius:10px}
  .lh-reset .li{position:relative;z-index:2;width:100%;height:100%;object-fit:contain;mix-blend-mode:screen;animation:lh-lf2 4s ease-in-out infinite}
  .lh-reset .lw::after{content:"";position:absolute;inset:-14px;border-radius:18px;background:radial-gradient(ellipse,rgba(245,168,32,.18) 0%,transparent 68%);z-index:1;pointer-events:none;animation:lh-lg2 3.5s ease-in-out infinite}
  @keyframes lh-lf2{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  @keyframes lh-lg2{0%,100%{opacity:.6}50%{opacity:1}}
  .lh-reset .cd{position:relative;z-index:10;margin:24px 14px 0;background:var(--card);border-radius:20px;border:1px solid var(--border2);padding:28px 22px 28px;box-shadow:0 0 0 1px rgba(245,168,32,.04),0 20px 60px rgba(0,0,0,.6)}
  .lh-reset .cd::before{content:"";position:absolute;top:0;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,rgba(245,168,32,.45),transparent)}
  .lh-reset .title{font-family:var(--fd);font-size:28px;letter-spacing:2px;color:var(--gold);text-align:center;margin-bottom:6px}
  .lh-reset .subtitle{font-family:var(--fm);font-size:11px;color:var(--muted2);text-align:center;margin-bottom:22px;line-height:1.5}
  .lh-reset .fi{margin-bottom:14px}
  .lh-reset .fl{display:block;font-family:var(--fm);font-size:9.5px;font-weight:700;letter-spacing:2.5px;color:var(--muted2);margin-bottom:5px}
  .lh-reset .fw{position:relative;display:flex;align-items:center}
  .lh-reset .fic{position:absolute;left:12px;font-size:16px;pointer-events:none;z-index:2;opacity:.45;line-height:1;display:flex;align-items:center}
  .lh-reset .inp{width:100%;background:var(--bg);border:1.5px solid var(--border2);border-radius:11px;padding:12px 13px 12px 40px;font-size:14px;font-weight:500;color:var(--white);font-family:var(--fb);outline:none;transition:all .18s;-webkit-appearance:none}
  .lh-reset .inp::placeholder{color:var(--muted)}
  .lh-reset .inp:focus{border-color:var(--gold3);background:#111;box-shadow:0 0 0 3px rgba(245,168,32,.1)}
  .lh-reset .inp.err{border-color:var(--red);box-shadow:0 0 0 3px rgba(220,85,85,.1)}
  .lh-reset .eye{position:absolute;right:11px;background:none;border:none;cursor:pointer;font-size:16px;color:var(--muted2);padding:4px;z-index:2;transition:color .15s}
  .lh-reset .eye:hover{color:var(--gold)}
  .lh-reset .em{font-family:var(--fm);font-size:10px;color:var(--red);margin-top:4px;padding-left:2px;display:flex;align-items:center;gap:4px;animation:lh-sk2 .3s ease}
  @keyframes lh-sk2{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
  .lh-reset .cta{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#f5a820,#d97706);color:#000;font-size:14px;font-weight:800;font-family:var(--fm);letter-spacing:2px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 24px rgba(245,168,32,.38);margin-top:6px}
  .lh-reset .cta:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(245,168,32,.55)}
  .lh-reset .cta:active{transform:translateY(0)}
  .lh-reset .cta.loading{pointer-events:none;opacity:.8}
  .lh-reset .sp{width:16px;height:16px;border:2.5px solid rgba(0,0,0,.25);border-top-color:#000;border-radius:50%;animation:lh-spin2 .65s linear infinite}
  @keyframes lh-spin2{to{transform:rotate(360deg)}}
  .lh-reset .success-box{text-align:center;padding:20px 16px;background:rgba(245,168,32,0.08);border-radius:14px;border:1px solid rgba(245,168,32,0.2);margin-bottom:16px}
  .lh-reset .success-box .s-icon{font-size:28px;margin-bottom:8px}
  .lh-reset .success-box .s-title{font-size:14px;font-weight:700;color:var(--gold);margin-bottom:6px;font-family:var(--fm)}
  .lh-reset .success-box .s-text{font-size:12px;color:var(--muted2);line-height:1.6}
  .lh-reset .back{display:block;text-align:center;margin-top:18px;font-family:var(--fm);font-size:12px;color:var(--gold);cursor:pointer;opacity:.85;font-weight:600;text-decoration:none;letter-spacing:1px}
  .lh-reset .back:hover{opacity:1}
  .lh-reset input:-webkit-autofill,.lh-reset input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #0d0d0d inset;-webkit-text-fill-color:#f0ece4}
`;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (password.length < 6) e.password = "Min 6 characters";
    if (password !== confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setApiError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
  }

  return (
    <div className="lh-reset">
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
          <div className="title">SET NEW PASSWORD</div>
          <div className="subtitle">
            Choose a strong password for your LoadHawk account.
          </div>

          {success ? (
            <div className="success-box">
              <div className="s-icon">{"\u2714"}</div>
              <div className="s-title">Password updated</div>
              <div className="s-text">
                Your password has been changed successfully. Redirecting you to sign in...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="fi">
                <label className="fl">NEW PASSWORD</label>
                <div className="fw">
                  <span className="fic">{"\u{1F512}"}</span>
                  <input
                    className={"inp" + (errors.password ? " err" : "")}
                    placeholder="Min 6 characters"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="eye"
                    onClick={() => setShowPass(!showPass)}
                    type="button"
                  >
                    {showPass ? "\u{1F441}" : "\u{1F441}\uFE0F"}
                  </button>
                </div>
                {errors.password && (
                  <div className="em">{"\u26A0"} {errors.password}</div>
                )}
              </div>

              <div className="fi">
                <label className="fl">CONFIRM PASSWORD</label>
                <div className="fw">
                  <span className="fic">{"\u{1F512}"}</span>
                  <input
                    className={"inp" + (errors.confirm ? " err" : "")}
                    placeholder="Repeat password"
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <button
                    className="eye"
                    onClick={() => setShowConf(!showConf)}
                    type="button"
                  >
                    {showConf ? "\u{1F441}" : "\u{1F441}\uFE0F"}
                  </button>
                </div>
                {errors.confirm && (
                  <div className="em">{"\u26A0"} {errors.confirm}</div>
                )}
              </div>

              {apiError && (
                <div className="em" style={{ textAlign: "center", marginBottom: 8 }}>
                  {"\u26A0"} {apiError}
                </div>
              )}

              <button className={"cta" + (loading ? " loading" : "")} type="submit">
                {loading ? (
                  <>
                    <div className="sp" />
                    <span>UPDATING...</span>
                  </>
                ) : (
                  "UPDATE PASSWORD"
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
