import { useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { useAuthModal } from "@/store/AuthModalContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { X, User, Mail, Phone, FileText, Lock, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "signup";
type RoleId = "driver" | "dispatch" | "carrier";

const LOGO = "/loadhawk-logo.png";

const ROLES: { id: RoleId; bg: string; name: string; desc: string }[] = [
  { id: "driver",   bg: "bg-[#f5a820]/10",  name: "Driver",         desc: "I drive and book my own loads" },
  { id: "dispatch", bg: "bg-blue-400/10",    name: "Dispatcher",     desc: "I manage loads for other drivers" },
  { id: "carrier",  bg: "bg-green-400/10",   name: "Carrier / Fleet", desc: "I run a company or fleet of trucks" },
];

const ROLE_ICONS: Record<RoleId, string> = {
  driver: "\u{1F6A3}",
  dispatch: "\u{1F4E1}",
  carrier: "\u{1F3E2}",
};

function RolePicker({ onConfirm }: { onConfirm: (role: RoleId) => void }) {
  const [sel, setSel] = useState<RoleId | null>(null);
  return (
    <div className="fixed inset-0 z-[300] bg-black/85 dark:bg-black/85 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[460px] bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-[#1f1f1f] rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full mx-auto mb-5" />

        <h2 className="font-display text-3xl tracking-wide text-center mb-1">
          ONE MORE THING
        </h2>
        <p className="font-mono text-[10px] font-bold tracking-[2.5px] text-gray-400 dark:text-gray-500 text-center mb-5">
          HOW WILL YOU USE LOADHAWK?
        </p>

        <div className="flex flex-col gap-2.5">
          {ROLES.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-3.5 rounded-xl p-4 cursor-pointer border transition-all ${
                sel === r.id
                  ? "border-[#f5a820] bg-[#f5a820]/5"
                  : "border-gray-200 dark:border-[#1f1f1f] bg-gray-50 dark:bg-[#0a0a0a] hover:border-[#f5a820]/40"
              }`}
              onClick={() => setSel(r.id)}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${r.bg}`}
              >
                {ROLE_ICONS[r.id]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold">{r.name}</div>
                <div className="font-mono text-[10px] text-gray-400 dark:text-gray-500 tracking-wide">
                  {r.desc}
                </div>
              </div>
              <div
                className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center text-[13px] shrink-0 transition-all ${
                  sel === r.id
                    ? "bg-[#f5a820] border-[#f5a820] text-black font-black"
                    : "border-gray-300 dark:border-[#333]"
                }`}
              >
                {sel === r.id ? "\u2714" : ""}
              </div>
            </div>
          ))}
        </div>

        <button
          className="w-full py-3.5 rounded-xl border-none bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black text-sm font-extrabold font-mono tracking-[2px] cursor-pointer mt-4 shadow-lg shadow-[#f5a820]/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#f5a820]/40 active:translate-y-0 transition-all disabled:opacity-40 disabled:pointer-events-none"
          disabled={!sel}
          onClick={() => sel && onConfirm(sel)}
        >
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (password.length < 6) e.password = "Min 6 characters";
    if (mode === "signup" && password !== confirm) e.confirm = "Passwords don't match";
    if (mode === "signup" && !cdl) e.cdl = "Select your CDL class";
    if (mode === "signup" && !remember) e.terms = "You must agree to the Terms of Service";
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

  const inputBase =
    "w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1f1f1f] rounded-lg pl-10 pr-3 py-3 text-sm font-medium text-foreground focus:border-[#f5a820] focus:outline-none focus:ring-1 focus:ring-[#f5a820]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:outline-2 focus-visible:outline-[#f5a820] focus-visible:outline-offset-1";
  const inputError = "border-red-500 focus:ring-red-500/20";
  const labelClass =
    "block font-mono text-[9.5px] font-bold tracking-[2.5px] text-gray-400 dark:text-gray-500 mb-1.5";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !showRole) closeAuthModal();
        }}
      >
        {showRole && <RolePicker onConfirm={handleRoleConfirm} />}

        {/* Modal card */}
        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto relative shadow-2xl">
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-[#1f1f1f] rounded-full w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="p-6 pt-6 pb-7">
            {/* Logo */}
            <div className="flex flex-col items-center mb-4">
              <img
                src={LOGO}
                alt="LoadHawk"
                className="h-14 object-contain mb-2"
              />
              <div className="font-mono text-[10px] tracking-[4px] text-gray-400 dark:text-gray-500 uppercase text-center">
                <span className="text-[#f5a820]">Book Smarter.</span>
                &nbsp; Earn More. &nbsp;
                <span className="text-[#f5a820]">Move Fast.</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-[#0a0a0a] rounded-lg p-1 gap-1 mb-5">
              <button
                className={`flex-1 py-2.5 rounded-md font-mono text-xs font-bold tracking-[1.5px] text-center cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#f5a820] focus-visible:outline-offset-2 ${
                  mode === "login"
                    ? "bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black shadow-md shadow-[#f5a820]/30"
                    : "bg-transparent text-gray-400 dark:text-gray-500"
                }`}
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
              >
                SIGN IN
              </button>
              <button
                className={`flex-1 py-2.5 rounded-md font-mono text-xs font-bold tracking-[1.5px] text-center cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#f5a820] focus-visible:outline-offset-2 ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black shadow-md shadow-[#f5a820]/30"
                    : "bg-transparent text-gray-400 dark:text-gray-500"
                }`}
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                }}
              >
                JOIN FREE
              </button>
            </div>

            {/* Full Name (signup only) */}
            {mode === "signup" && (
              <div className="mb-3">
                <label className={labelClass}>FULL NAME</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                    <User size={16} />
                  </span>
                  <input
                    className={`${inputBase} ${errors.name ? inputError : ""}`}
                    placeholder="Marcus Davis"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {errors.name && (
                  <div className="font-mono text-[10px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                    {"\u26A0"} {errors.name}
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            <div className="mb-3">
              <label className={labelClass}>EMAIL</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                  <Mail size={16} />
                </span>
                <input
                  className={`${inputBase} ${errors.email ? inputError : ""}`}
                  placeholder="driver@loadhawk.io"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <div className="font-mono text-[10px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                  {"\u26A0"} {errors.email}
                </div>
              )}
            </div>

            {/* Phone (signup only) */}
            {mode === "signup" && (
              <div className="mb-3">
                <label className={labelClass}>PHONE</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                    <Phone size={16} />
                  </span>
                  <input
                    className={inputBase}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* CDL Class (signup only) */}
            {mode === "signup" && (
              <div className="mb-3">
                <label className={labelClass}>CDL CLASS</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                    <FileText size={16} />
                  </span>
                  <select
                    className={`${inputBase} cursor-pointer appearance-none ${
                      errors.cdl ? inputError : ""
                    }`}
                    value={cdl}
                    onChange={(e) => setCdl(e.target.value)}
                  >
                    <option value="" disabled>
                      Select your CDL class...
                    </option>
                    <option value="Class A">
                      Class A {"\u00B7"} Tractor-Trailer
                    </option>
                    <option value="Class B">
                      Class B {"\u00B7"} Straight Truck
                    </option>
                    <option value="Class C">
                      Class C {"\u00B7"} Small Vehicle
                    </option>
                  </select>
                </div>
                {errors.cdl && (
                  <div className="font-mono text-[10px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                    {"\u26A0"} {errors.cdl}
                  </div>
                )}
              </div>
            )}

            {/* Password */}
            <div className="mb-3">
              <label className={labelClass}>PASSWORD</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                  <Lock size={16} />
                </span>
                <input
                  className={`${inputBase} pr-10 ${
                    errors.password ? inputError : ""
                  }`}
                  placeholder={
                    mode === "signup" ? "Min 6 characters" : "Your password"
                  }
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 bg-transparent border-none cursor-pointer text-gray-400 dark:text-gray-500 hover:text-[#f5a820] p-1 z-[2] transition-colors"
                  onClick={() => setShowPass(!showPass)}
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === "signup" && (
                <div className="font-mono text-[9px] text-gray-400 dark:text-gray-600 mt-1 pl-0.5">
                  Minimum 6 characters
                </div>
              )}
              {errors.password && (
                <div className="font-mono text-[10px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                  {"\u26A0"} {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password (signup only) */}
            {mode === "signup" && (
              <div className="mb-3">
                <label className={labelClass}>CONFIRM PASSWORD</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                    <Lock size={16} />
                  </span>
                  <input
                    className={`${inputBase} pr-10 ${
                      errors.confirm ? inputError : ""
                    }`}
                    placeholder="Repeat password"
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <button
                    className="absolute right-3 bg-transparent border-none cursor-pointer text-gray-400 dark:text-gray-500 hover:text-[#f5a820] p-1 z-[2] transition-colors"
                    onClick={() => setShowConf(!showConf)}
                    type="button"
                    aria-label={showConf ? "Hide password" : "Show password"}
                  >
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm && (
                  <div className="font-mono text-[10px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                    {"\u26A0"} {errors.confirm}
                  </div>
                )}
              </div>
            )}

            {/* Remember / Terms + Forgot */}
            <div className="flex justify-between items-center mb-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setRemember(!remember)}
              >
                <div
                  className={`w-[18px] h-[18px] rounded-[5px] shrink-0 border flex items-center justify-center text-xs transition-all ${
                    remember
                      ? "bg-[#d97706] border-[#d97706] text-black font-black"
                      : "bg-gray-50 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333]"
                  }`}
                >
                  {remember ? "\u2714" : ""}
                </div>
                <span className="font-mono text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                  {mode === "login" ? "REMEMBER ME" : "AGREE TO TERMS"}
                </span>
              </div>
              {errors.terms && (
                <div className="font-mono text-[10px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                  {"\u26A0"} {errors.terms}
                </div>
              )}
              {mode === "login" && (
                <span
                  className="font-mono text-[11px] font-bold text-[#f5a820] cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                  onClick={async () => {
                    if (!email.includes("@")) {
                      setErrors({ email: "Enter your email first" });
                      return;
                    }
                    const { error } =
                      await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo:
                          window.location.origin + "/reset-password",
                      });
                    if (error) {
                      toast.error(error.message);
                    } else {
                      toast.success(
                        `Password reset link sent to ${email}`
                      );
                    }
                  }}
                >
                  FORGOT?
                </span>
              )}
            </div>

            {/* Auth error */}
            {authError && (
              <div className="font-mono text-[10px] text-red-500 text-center mb-2 flex items-center justify-center gap-1">
                {"\u26A0"} {authError}
              </div>
            )}

            {/* Email confirmation box */}
            {pendingConfirmation && (
              <div className="text-center mb-3 p-3 bg-[#f5a820]/[0.08] rounded-xl border border-[#f5a820]/20">
                <div className="text-2xl mb-1.5">{"\u{1F4E7}"}</div>
                <div className="text-[13px] font-semibold text-[#f5a820] mb-1">
                  Check your email
                </div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500">
                  We sent a confirmation link to{" "}
                  <strong className="text-gray-300 dark:text-gray-300">
                    {email}
                  </strong>
                  . Click the link to activate your account, then come back
                  and sign in.
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              className={`w-full py-3 rounded-xl border-none font-semibold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black font-mono text-sm tracking-[2px] cursor-pointer shadow-lg shadow-[#f5a820]/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#f5a820]/40 active:translate-y-0 transition-all flex items-center justify-center gap-2 ${
                loading ? "pointer-events-none opacity-80" : ""
              }`}
              onClick={submit}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-[2.5px] border-black/25 border-t-black rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : mode === "login" ? (
                "\u26A1  SIGN INTO LOADHAWK"
              ) : (
                "\u{1F680}  CREATE MY ACCOUNT"
              )}
            </button>

            {/* Bottom switch text */}
            <div className="text-center pt-3 pb-1">
              <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                {mode === "login" ? (
                  <>
                    <span>New here? </span>
                    <span
                      className="text-[#f5a820] cursor-pointer opacity-85 hover:opacity-100 transition-opacity"
                      onClick={() => setMode("signup")}
                    >
                      Create a free account
                    </span>
                  </>
                ) : (
                  <>
                    <span>Already have an account? </span>
                    <span
                      className="text-[#f5a820] cursor-pointer opacity-85 hover:opacity-100 transition-opacity"
                      onClick={() => setMode("login")}
                    >
                      Sign in
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
