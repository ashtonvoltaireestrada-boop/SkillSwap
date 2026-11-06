import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, Eye, EyeOff, UserPlus, X } from "lucide-react";

// 1. IMPORT YOUR CONFIG
import { API_BASE_URL } from "@/config";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Terms and UI States
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) { 
      setError("To continue, you must agree to the Terms of Service & Privacy Policy."); const termsEl = document.getElementById("terms") as HTMLInputElement | null; termsEl?.reportValidity(); return; 
      
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. USE API_BASE_URL AND BYPASS TUNNEL
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      alert("Welcome to the community! Please log in.");
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 relative">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <UserPlus className="text-white size-8" />
          </div>
        </div>

        <Card className="shadow-2xl border-blue-50 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-blue-900">
              Join Knoxite
            </CardTitle>
            <CardDescription className="text-center text-blue-500 font-medium">
              Start swapping skills today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-[11px] uppercase tracking-wider font-bold text-blue-400 ml-1"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Steven Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 border-blue-100 bg-blue-50/30 focus:ring-blue-600 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[11px] uppercase tracking-wider font-bold text-blue-400 ml-1"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-blue-100 bg-blue-50/30 focus:ring-blue-600 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-[11px] uppercase tracking-wider font-bold text-blue-400 ml-1"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-blue-100 bg-blue-50/30 focus:ring-blue-600 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[11px] uppercase tracking-wider font-bold text-blue-400 ml-1"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 border-blue-100 bg-blue-50/30 focus:ring-blue-600 rounded-xl"
                />
              </div>

              {/* Terms of Service & Privacy Policy Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => { 
                    const isChecked = e.target.checked; 
                    setAgreedToTerms(isChecked); 
                    if (isChecked) setError("")
                  }}
                  required
                  className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-blue-900/80 leading-snug cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 font-semibold underline hover:text-blue-700"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 font-semibold underline hover:text-blue-700"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-lg shadow-blue-100 mt-2 text-base font-bold transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin size-5" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-blue-400">
                Already part of the community?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>

              <p className="text-xs">
                <button
                  onClick={() => navigate("/")}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Back to Home
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                Terms of Service & Privacy Policy
              </h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <section>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  1. Platform Purpose & Campus Exclusivity
                </h4>
                <p>
                  Knoxite is a campus-exclusive peer-to-peer knowledge and skill exchange platform.
                  Its purpose is to connect student mentors and apprentices for collaborative,
                  academic, and skill-building pursuits.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  2. User Conduct & Safe Exchanges
                </h4>
                <p>
                  All members must treat each other with respect. Harassment, dishonest skill
                  representation, hate speech, unauthorized commercial solicitations, and academic
                  integrity breaches are strictly prohibited.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  3. Privacy & Data Handling
                </h4>
                <p>
                  We collect your registered name, email address, and declared skills to facilitate
                  matching, community forum participation, and the leaderboard. Your information is
                  never sold or shared with outside commercial entities.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  4. Account Suspension
                </h4>
                <p>
                  Platform administrators reserve the right to review flagged accounts and suspend
                  or terminate access for violations of these community guidelines.
                </p>
              </section>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                  setError("");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs px-4 py-2 font-semibold"
              >
                I Understand & Agree
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Website Version Display */}
      <div className="fixed bottom-3 right-4 z-40 pointer-events-none select-none text-[11px] font-mono tracking-wider text-slate-400   dark:text-slate-500"> 
        Knoxite v1.0 
      </div> 
    </div>
  );
}