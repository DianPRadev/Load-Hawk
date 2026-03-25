import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Mail, CheckCircle } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";

const LOGO = "/loadhawk-logo.png";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <PageMeta title="Forgot Password" />
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
          Reset Password
        </h1>
        <p className="font-mono text-[13px] text-gray-400 dark:text-gray-500 text-center mb-6 leading-relaxed">
          Enter the email address associated with your account and we will send
          you a link to reset your password.
        </p>

        {sent ? (
          <div className="text-center p-5 bg-[#f5a820]/[0.08] rounded-xl border border-[#f5a820]/20 mb-4">
            <CheckCircle className="h-7 w-7 text-[#f5a820] mx-auto mb-2" />
            <div className="text-sm font-bold text-[#f5a820] font-mono mb-1.5">
              Reset link sent
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              We sent a password reset link to{" "}
              <strong className="text-foreground">{email}</strong>. Check your
              inbox and follow the instructions to reset your password.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-mono text-[12px] font-bold tracking-[2px] text-gray-400 dark:text-gray-500 mb-1.5">
                EMAIL
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 pointer-events-none z-[2] opacity-45 flex items-center">
                  <Mail size={16} />
                </span>
                <input
                  className={`w-full bg-gray-50 dark:bg-[#0a0a0a] border rounded-lg pl-10 pr-3 py-3 text-sm font-medium text-foreground focus:border-[#f5a820] focus:outline-none focus:ring-1 focus:ring-[#f5a820]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:outline-2 focus-visible:outline-[#f5a820] focus-visible:outline-offset-1 ${
                    error
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-[#1f1f1f]"
                  }`}
                  placeholder="driver@loadhawk.io"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              {error && (
                <div className="font-mono text-[11px] text-red-500 mt-1 pl-0.5 flex items-center gap-1">
                  {"\u26A0"} {error}
                </div>
              )}
            </div>

            <button
              className={`w-full py-3 rounded-xl border-none font-extrabold bg-gradient-to-r from-[#f5a820] to-[#d97706] text-black font-mono text-sm tracking-[2px] cursor-pointer shadow-lg shadow-[#f5a820]/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#f5a820]/40 active:translate-y-0 transition-all flex items-center justify-center gap-2 ${
                loading ? "pointer-events-none opacity-80" : ""
              }`}
              type="submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-[2.5px] border-black/25 border-t-black rounded-full animate-spin" />
                  <span>SENDING...</span>
                </>
              ) : (
                "SEND RESET LINK"
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
