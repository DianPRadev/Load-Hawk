import { useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

type Mode = "login" | "signup";
type RoleId = "driver" | "dispatch" | "carrier";

const LOGO = "/loadhawk-logo.png";

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MetaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" fill="#1877F2"/>
  </svg>
);

const ROLES: { id: RoleId; icon: string; bg: string; name: string; desc: string }[] = [
  { id: "driver",   icon: "\u{1F6A3}", bg: "rgba(245,168,32,0.12)",  name: "Driver",         desc: "I drive and book my own loads" },
  { id: "dispatch", icon: "\u{1F4E1}", bg: "rgba(96,165,250,0.12)",  name: "Dispatcher",     desc: "I manage loads for other drivers" },
  { id: "carrier",  icon: "\u{1F3E2}", bg: "rgba(74,222,128,0.12)",  name: "Carrier / Fleet", desc: "I run a company or fleet of trucks" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
  .lh-modal *,.lh-modal *::before,.lh-modal *::after{box-sizing:border-box;margin:0;padding:0}
  .lh-modal{
    --bg:#0d0d0d;--card:#161616;--border:#282828;--border2:#333;
    --gold:#f5a820;--gold3:#d97706;--white:#f0ece4;
    --muted:#505050;--muted2:#888;--red:#e05555;
    --fd:"Bebas Neue",sans-serif;--fb:"DM Sans",sans-serif;--fm:"JetBrains Mono",monospace;
    color:var(--white);font-family:var(--fb);
  }
  :root:not(.dark) .lh-modal{
    --bg:#f5f5f7;--card:#ffffff;--border:#e0e0e0;--border2:#d1d1d6;
    --white:#1d1d1f;--muted:#a1a1a6;--muted2:#6e6e73;
  }
  :root:not(.dark) .lh-modal .inp:focus,:root:not(.dark) .lh-modal .sel:focus{background:#fff}
  :root:not(.dark) .lh-modal input:-webkit-autofill,:root:not(.dark) .lh-modal input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #f5f5f7 inset;-webkit-text-fill-color:#1d1d1f}
  .lh-modal .cd{background:var(--card);border-radius:20px;border:1px solid var(--border2);padding:24px 22px 26px;position:relative}
  .lh-modal .cd::before{content:"";position:absolute;top:0;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,rgba(245,168,32,.45),transparent)}
  .lh-modal .tabs{display:flex;background:var(--bg);border-radius:11px;padding:3px;gap:3px;margin-bottom:18px;border:1px solid var(--border)}
  .lh-modal .tab{flex:1;padding:9px;border-radius:8px;font-family:var(--fm);font-size:12px;font-weight:700;letter-spacing:1.5px;text-align:center;cursor:pointer;color:var(--muted2);border:none;background:none;transition:all .2s}
  .lh-modal .tab.on{background:linear-gradient(135deg,var(--gold),var(--gold3));color:#000;box-shadow:0 2px 14px rgba(245,168,32,.35)}
  .lh-modal .fi{margin-bottom:12px}
  .lh-modal .fl{display:block;font-family:var(--fm);font-size:9.5px;font-weight:700;letter-spacing:2.5px;color:var(--muted2);margin-bottom:5px}
  .lh-modal .fw{position:relative;display:flex;align-items:center}
  .lh-modal .fic{position:absolute;left:12px;font-size:16px;pointer-events:none;z-index:2;opacity:.45;line-height:1;display:flex;align-items:center}
  .lh-modal .inp,.lh-modal .sel{width:100%;background:var(--bg);border:1.5px solid var(--border2);border-radius:11px;padding:12px 13px 12px 40px;font-size:14px;font-weight:500;color:var(--white);font-family:var(--fb);outline:none;transition:all .18s;-webkit-appearance:none}
  .lh-modal .inp::placeholder{color:var(--muted)}
  .lh-modal .inp:focus,.lh-modal .sel:focus{border-color:var(--gold3);background:#111;box-shadow:0 0 0 3px rgba(245,168,32,.1)}
  .lh-modal .inp.err{border-color:var(--red);box-shadow:0 0 0 3px rgba(220,85,85,.1)}
  .lh-modal .sel{cursor:pointer}
  .lh-modal .sel option{background:#111;color:var(--white)}
  .lh-modal .eye{position:absolute;right:11px;background:none;border:none;cursor:pointer;font-size:16px;color:var(--muted2);padding:4px;z-index:2;transition:color .15s}
  .lh-modal .eye:hover{color:var(--gold)}
  .lh-modal .em{font-family:var(--fm);font-size:10px;color:var(--red);margin-top:4px;padding-left:2px;display:flex;align-items:center;gap:4px;animation:lhm-sk .3s ease}
  @keyframes lhm-sk{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
  .lh-modal .or{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
  .lh-modal .cw{display:flex;align-items:center;gap:8px;cursor:pointer}
  .lh-modal .cb{width:18px;height:18px;border-radius:5px;flex-shrink:0;background:var(--bg);border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .15s}
  .lh-modal .cb.on{background:var(--gold3);border-color:var(--gold3);color:#000;font-weight:900}
  .lh-modal .cl{font-family:var(--fm);font-size:11px;color:var(--muted2);font-weight:600}
  .lh-modal .fg{font-family:var(--fm);font-size:11px;color:var(--gold);cursor:pointer;opacity:.8;font-weight:700}
  .lh-modal .fg:hover{opacity:1}
  .lh-modal .cta{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#f5a820,#d97706);color:#000;font-size:14px;font-weight:800;font-family:var(--fm);letter-spacing:2px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 24px rgba(245,168,32,.38)}
  .lh-modal .cta:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(245,168,32,.55)}
  .lh-modal .cta:active{transform:translateY(0)}
  .lh-modal .cta.loading{pointer-events:none;opacity:.8}
  .lh-modal .sp{width:16px;height:16px;border:2.5px solid rgba(0,0,0,.25);border-top-color:#000;border-radius:50%;animation:lhm-spin .65s linear infinite}
  @keyframes lhm-spin{to{transform:rotate(360deg)}}
  .lh-modal .dv{display:flex;align-items:center;gap:10px;margin:14px 0}
  .lh-modal .dl{flex:1;height:1px;background:var(--border)}
  .lh-modal .dt{font-family:var(--fm);font-size:10px;color:var(--muted);letter-spacing:2px}
  .lh-modal .sr{display:flex;gap:8px}
  .lh-modal .sb{flex:1;background:var(--bg);border:1.5px solid var(--border2);border-radius:10px;padding:11px 6px;font-size:13px;font-weight:600;color:var(--muted2);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;font-family:var(--fb)}
  .lh-modal .sb:hover{background:#1c1c1c;color:var(--white);transform:translateY(-1px);border-color:#444}
  .lh-modal .flk{color:var(--gold);cursor:pointer;opacity:.85}
  .lh-modal .flk:hover{opacity:1}
  .lh-modal .rov{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;animation:lhm-fi .25s ease}
  @keyframes lhm-fi{from{opacity:0}to{opacity:1}}
  .lh-modal .rsh{width:100%;max-width:460px;background:var(--card);border-radius:22px 22px 0 0;border-top:1px solid var(--border2);padding:0 20px 36px;box-shadow:0 -20px 60px rgba(0,0,0,.7);animation:lhm-su .3s cubic-bezier(.34,1.3,.64,1);position:relative}
  @keyframes lhm-su{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .lh-modal .rsh::before{content:"";position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(245,168,32,.4),transparent)}
  .lh-modal .rh{width:40px;height:4px;background:var(--border2);border-radius:2px;margin:14px auto 20px}
  .lh-modal .rt{font-family:"Bebas Neue",sans-serif;font-size:30px;letter-spacing:2px;color:var(--white);text-align:center;margin-bottom:4px}
  .lh-modal .rs{font-family:var(--fm);font-size:10px;letter-spacing:2px;color:var(--muted2);text-align:center;margin-bottom:20px}
  .lh-modal .rg{display:flex;flex-direction:column;gap:10px}
  .lh-modal .rc{background:var(--bg);border:1.5px solid var(--border2);border-radius:14px;padding:16px 18px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px;position:relative;overflow:hidden}
  .lh-modal .rc:hover{border-color:rgba(245,168,32,.4);background:#111;transform:translateY(-1px)}
  .lh-modal .rc.sel{border-color:var(--gold);background:rgba(245,168,32,.07);box-shadow:0 0 0 3px rgba(245,168,32,.12)}
  .lh-modal .rc::before{content:"";position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(180deg,var(--gold),var(--gold3));opacity:0;transition:opacity .2s}
  .lh-modal .rc.sel::before,.lh-modal .rc:hover::before{opacity:1}
  .lh-modal .ri{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
  .lh-modal .rn{font-size:15px;font-weight:700;color:var(--white);margin-bottom:2px}
  .lh-modal .rd{font-family:var(--fm);font-size:10px;color:var(--muted2);letter-spacing:.3px}
  .lh-modal .rck{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;transition:all .2s;margin-left:auto}
  .lh-modal .rc.sel .rck{background:var(--gold);border-color:var(--gold);color:#000;font-weight:900}
  .lh-modal .rcta{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#f5a820,#d97706);color:#000;font-size:14px;font-weight:800;font-family:var(--fm);letter-spacing:2px;cursor:pointer;margin-top:16px;transition:all .2s;box-shadow:0 4px 24px rgba(245,168,32,.35)}
  .lh-modal .rcta:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(245,168,32,.55)}
  .lh-modal .rcta:disabled{opacity:.4;pointer-events:none}
  :root:not(.dark) .lh-modal .rov{background:rgba(255,255,255,.85)}
  :root:not(.dark) .lh-modal .rsh{background:var(--card);box-shadow:0 -8px 30px rgba(0,0,0,.08)}
  :root:not(.dark) .lh-modal .rc:hover{background:#f9f9f9}
  .lh-modal input:-webkit-autofill,.lh-modal input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #0d0d0d inset;-webkit-text-fill-color:#f0ece4}
  :root:not(.dark) .lh-modal input:-webkit-autofill,:root:not(.dark) .lh-modal input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #f5f5f7 inset;-webkit-text-fill-color:#1d1d1f}
`;

function RolePicker({ onConfirm }: { onConfirm: (role: RoleId) => void }) {
  const [sel, setSel] = useState<RoleId | null>(null);
  return (
    <div className="rov">
      <div className="rsh">
        <div className="rh"/>
        <div className="rt">ONE MORE THING</div>
        <div className="rs">HOW WILL YOU USE LOADHAWK?</div>
        <div className="rg">
          {ROLES.map(r => (
            <div key={r.id} className={"rc" + (sel === r.id ? " sel" : "")} onClick={() => setSel(r.id)}>
              <div className="ri" style={{background: r.bg}}>{r.icon}</div>
              <div>
                <div className="rn">{r.name}</div>
                <div className="rd">{r.desc}</div>
              </div>
              <div className="rck">{sel === r.id ? "\u2714" : ""}</div>
            </div>
          ))}
        </div>
        <button className="rcta" disabled={!sel} onClick={() => sel && onConfirm(sel)}>
          GO {"\u2192"}
        </button>
      </div>
    </div>
  );
}

export function AuthModal() {
  const { isOpen, defaultMode, closeAuthModal } = useAuthModal();
  const { signIn, signUp, user, updateUserRole } = useAuth();
  const [authError, setAuthError] = useState("");
  const [mode, setMode] = useState<Mode>("login");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [cdl, setCdl] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setAuthError("");
      setErrors({});
      setPendingConfirmation(false);
    }
  }, [isOpen, defaultMode]);

  // Close when user logs in successfully
  useEffect(() => {
    if (user && isOpen && !showRole) {
      closeAuthModal();
    }
  }, [user, isOpen, showRole, closeAuthModal]);

  function validate() {
    const e: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) e.name = "Full name required";
    if (!email.includes("@") || !email.includes(".")) e.email = "Enter a valid email";
    if (password.length < 6) e.password = "Min 6 characters";
    if (mode === "signup" && password !== confirm) e.confirm = "Passwords don't match";
    if (mode === "signup" && !cdl) e.cdl = "Select your CDL class";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    setAuthError("");
    setPendingConfirmation(false);

    if (mode === "signup") {
      const result = await signUp(email, password, { name, phone, cdl_class: cdl });
      setLoading(false);
      if (result.error) {
        setAuthError(result.error);
      } else if (result.needsConfirmation) {
        setPendingConfirmation(true);
      } else {
        setShowRole(true);
      }
    } else {
      const result = await signIn(email, password);
      setLoading(false);
      if (result.error) {
        setAuthError(result.error);
      }
      // success: useEffect above will close modal
    }
  }

  async function handleRoleConfirm(r: RoleId) {
    setShowRole(false);
    const roleMap: Record<RoleId, string> = {
      driver: "Owner-Operator",
      dispatch: "Dispatcher",
      carrier: "Fleet Manager",
    };
    await updateUserRole(roleMap[r]);
    closeAuthModal();
    toast.success("Welcome to LoadHawk!");
  }

  if (!isOpen) return null;

  return (
    <div className="lh-modal">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget && !showRole) closeAuthModal(); }}
        style={{ animation: "lhm-fi .25s ease" }}
      >
        {showRole && <RolePicker onConfirm={handleRoleConfirm} />}

        {/* Modal card */}
        <div className="relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl" style={{ animation: "lhm-su .3s cubic-bezier(.34,1.3,.64,1)" }}>

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: "var(--border)", color: "var(--muted2)" }}
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Logo header */}
          <div className="cd" style={{ borderRadius: "20px 20px 0 0", borderBottom: "none", paddingBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
              <img src={LOGO} alt="LoadHawk" style={{ height: 64, objectFit: "contain", marginBottom: 8 }} />
              <div style={{ fontFamily: "var(--fm)", fontSize: 10, letterSpacing: 4, color: "var(--muted2)", textTransform: "uppercase", textAlign: "center" }}>
                <em style={{ color: "var(--gold)", fontStyle: "normal" }}>Book Smarter.</em>&nbsp; Earn More. &nbsp;<em style={{ color: "var(--gold)", fontStyle: "normal" }}>Move Fast.</em>
              </div>
            </div>

            <div className="tabs">
              <button className={"tab" + (mode === "login" ? " on" : "")} onClick={() => { setMode("login"); setErrors({}); }}>SIGN IN</button>
              <button className={"tab" + (mode === "signup" ? " on" : "")} onClick={() => { setMode("signup"); setErrors({}); }}>JOIN FREE</button>
            </div>

            {mode === "signup" && (
              <div className="fi">
                <label className="fl">FULL NAME</label>
                <div className="fw"><span className="fic">{"\u{1F464}"}</span><input className={"inp" + (errors.name ? " err" : "")} placeholder="Marcus Davis" value={name} onChange={e => setName(e.target.value)} /></div>
                {errors.name && <div className="em">{"\u26A0"} {errors.name}</div>}
              </div>
            )}

            <div className="fi">
              <label className="fl">EMAIL</label>
              <div className="fw"><span className="fic">{"\u{1F4E7}"}</span><input className={"inp" + (errors.email ? " err" : "")} placeholder="driver@loadhawk.io" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              {errors.email && <div className="em">{"\u26A0"} {errors.email}</div>}
            </div>

            {mode === "signup" && (
              <div className="fi">
                <label className="fl">PHONE</label>
                <div className="fw"><span className="fic">{"\u{1F4F1}"}</span><input className="inp" placeholder="+1 (555) 000-0000" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </div>
            )}

            {mode === "signup" && (
              <div className="fi">
                <label className="fl">CDL CLASS</label>
                <div className="fw"><span className="fic">{"\u{1F4CB}"}</span>
                  <select className={"sel" + (errors.cdl ? " err" : "")} value={cdl} onChange={e => setCdl(e.target.value)}>
                    <option value="" disabled>Select your CDL class...</option>
                    <option value="Class A">Class A {"\u00B7"} Tractor-Trailer</option>
                    <option value="Class B">Class B {"\u00B7"} Straight Truck</option>
                    <option value="Class C">Class C {"\u00B7"} Small Vehicle</option>
                  </select>
                </div>
                {errors.cdl && <div className="em">{"\u26A0"} {errors.cdl}</div>}
              </div>
            )}

            <div className="fi">
              <label className="fl">PASSWORD</label>
              <div className="fw">
                <span className="fic">{"\u{1F512}"}</span>
                <input className={"inp" + (errors.password ? " err" : "")} placeholder={mode === "signup" ? "Min 6 characters" : "Your password"} type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
                <button className="eye" onClick={() => setShowPass(!showPass)} type="button">{showPass ? "\u{1F441}" : "\u{1F441}\uFE0F"}</button>
              </div>
              {errors.password && <div className="em">{"\u26A0"} {errors.password}</div>}
            </div>

            {mode === "signup" && (
              <div className="fi">
                <label className="fl">CONFIRM PASSWORD</label>
                <div className="fw">
                  <span className="fic">{"\u{1F512}"}</span>
                  <input className={"inp" + (errors.confirm ? " err" : "")} placeholder="Repeat password" type={showConf ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} />
                  <button className="eye" onClick={() => setShowConf(!showConf)} type="button">{showConf ? "\u{1F441}" : "\u{1F441}\uFE0F"}</button>
                </div>
                {errors.confirm && <div className="em">{"\u26A0"} {errors.confirm}</div>}
              </div>
            )}

            <div className="or">
              <div className="cw" onClick={() => setRemember(!remember)}>
                <div className={"cb" + (remember ? " on" : "")}> {remember ? "\u2714" : ""}</div>
                <span className="cl">{mode === "login" ? "REMEMBER ME" : "AGREE TO TERMS"}</span>
              </div>
              {mode === "login" && <span className="fg" onClick={async () => { if (!email.includes("@")) { setErrors({ email: "Enter your email first" }); return; } const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" }); if (error) { toast.error(error.message); } else { toast.success(`Password reset link sent to ${email}`); } }}>FORGOT?</span>}
            </div>

            {authError && <div className="em" style={{ textAlign: "center", marginBottom: 8 }}>{"\u26A0"} {authError}</div>}
            {pendingConfirmation && <div style={{ textAlign: "center", marginBottom: 12, padding: "12px 16px", background: "rgba(245,168,32,0.08)", borderRadius: 12, border: "1px solid rgba(245,168,32,0.2)" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{"\u{1F4E7}"}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f5a820", marginBottom: 4 }}>Check your email</div>
              <div style={{ fontSize: 11, color: "#999" }}>We sent a confirmation link to <strong style={{ color: "#ccc" }}>{email}</strong>. Click the link to activate your account, then come back and sign in.</div>
            </div>}
            <button className={"cta" + (loading ? " loading" : "")} onClick={submit}>
              {loading
                ? <><div className="sp" /><span>AUTHENTICATING...</span></>
                : mode === "login" ? "\u26A1  SIGN INTO LOADHAWK" : "\u{1F680}  CREATE MY ACCOUNT"
              }
            </button>

            <div className="dv"><div className="dl" /><span className="dt">OR CONTINUE WITH</span><div className="dl" /></div>

            <div className="sr">
              <button className="sb" style={{ opacity: 0.5, cursor: "not-allowed" }} disabled title="Coming soon"><AppleIcon /><span>Apple</span></button>
              <button className="sb" style={{ opacity: 0.5, cursor: "not-allowed" }} disabled title="Coming soon"><GoogleIcon /><span>Google</span></button>
              <button className="sb" style={{ opacity: 0.5, cursor: "not-allowed" }} disabled title="Coming soon"><MetaIcon /><span>Meta</span></button>
            </div>
            <div style={{ textAlign: "center", marginTop: 4, paddingBottom: 4 }}><span style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--muted)", letterSpacing: 1 }}>SOCIAL LOGIN COMING SOON</span></div>

            <div style={{ textAlign: "center", paddingTop: 12, paddingBottom: 4 }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--muted)", lineHeight: 1.8 }}>
                {mode === "login"
                  ? <><span>New here? </span><span className="flk" onClick={() => setMode("signup")}>Create a free account</span></>
                  : <><span>Already have an account? </span><span className="flk" onClick={() => setMode("login")}>Sign in</span></>
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
