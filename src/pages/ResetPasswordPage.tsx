import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTheme } from "next-themes";
import { Sun, Moon, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";

const LOGO = "/loadhawk-logo.png";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
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
      setTimeout(() => navigate("/", { replace: true }), 3000);
    }
  }

  const inputBase =
    "w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1f1f1f] rounded-lg pl-10 pr-10 py-3 text-sm font-medium text-foreground focus:border-[#f5a820] focus:outline-none focus:ring-1 focus:ring-[#f5a820]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:outline-2 focus-visible:outline-[#f5a820] focus-visible:outline-offset-1";
  const inputError = "border-red-500 focus:ring-red-500/20";
  const labelClass =
    "block font-mono text-[9.5px] font-bold tracking-[2.5px] text-gray-400 dark:text-gray-500 mb-1.5";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <PageMeta title="Reset Password" />
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full border border-gray-200 dark:border-[#1f1f1f] bg-white dark:bg-[#141414] text-gray-400 dark:text-gray-500 hover:border-[#f5a820] hover:text-[#f5a820] cursor-pointer flex items-center justify-center transition-all shadow-sm hover:scale-110"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Card */}
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={LOGO} alt="LoadHawk" className="h-12 object-contain" />
        </div>

        <h1 className="font-display text-2xl font-bold text-center mb-2">
          Set New Password
        </h1>
        <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500 text-center mb-6 leading-relaxed">
          Choose a strong password for your LoadHawk account.
        </p>

        {success ? (
          <div className="text-center p-5 bg-[#f5a820]/[0.08] rounded-xl border border-[#f5a820]/20 mb-4">
            <CheckCircle className="h-7 w-7 text-[#f5a820] mx-auto mb-2" />
            <div className="text-sm font-bold text-[#f5a820] font-mono mb-1.5">
              Password updated
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              Your password has been changed successfully. Redirecting you to
              sign in...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label className={labelClass}>NEW PASSWORD</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                  <Lock size={16} />
                </span>
                <input
                  className={`${inputBase} ${errors.password ? inputError : ""}`}
                  placeholder="Min 6 characters"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  className="absolute right-3 bg-transparent border-none cursor-pointer text-gray-400 dark:text-gray-500 hover:text-[#f5a820] p-1 z-[2] transition-colors"
                  onClick={() => setShowPass(!showPass)}
                  type="button"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div className="font-mono text-[10px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                  {"\u26A0"} {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className={labelClass}>CONFIRM PASSWORD</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                  <Lock size={16} />
                </span>
                <input
                  className={`${inputBase} ${errors.confirm ? inputError : ""}`}
                  placeholder="Repeat password"
                  type={showConf ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  className="absolute right-3 bg-transparent border-none cursor-pointer text-gray-400 dark:text-gray-500 hover:text-[#f5a820] p-1 z-[2] transition-colors"
                  onClick={() => setShowConf(!showConf)}
                  type="button"
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

            {/* API error */}
            {apiError && (
              <div className="font-mono text-[10px] text-red-500 text-center mb-2 flex items-center justify-center gap-1">
                {"\u26A0"} {apiError}
              </div>
            )}

            <button
              className={`w-full py-3 rounded-xl border-none font-extrabold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black font-mono text-sm tracking-[2px] cursor-pointer shadow-lg shadow-[#f5a820]/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#f5a820]/40 active:translate-y-0 transition-all flex items-center justify-center gap-2 ${
                loading ? "pointer-events-none opacity-80" : ""
              }`}
              type="submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-[2.5px] border-black/25 border-t-black rounded-full animate-spin" />
                  <span>UPDATING...</span>
                </>
              ) : (
                "UPDATE PASSWORD"
              )}
            </button>
          </form>
        )}

        <button
          className="block w-full text-center mt-5 font-mono text-xs font-semibold text-[#f5a820] cursor-pointer opacity-85 hover:opacity-100 tracking-wide transition-opacity bg-transparent border-none"
          onClick={() => navigate("/")}
        >
          {"\u2190"} BACK TO HOME
        </button>
      </div>
    </div>
  );
}
