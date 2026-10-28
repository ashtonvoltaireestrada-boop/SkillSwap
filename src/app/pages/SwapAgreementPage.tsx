import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ArrowLeft, Check, Loader2, Repeat } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { socket } from "@/utils/socket"; // ⚡ Import Socket Client

export default function SwapAgreementPage() {
  const navigate = useNavigate();
  const { swapId } = useParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any>({
    me: { name: "You", headline: "Student/Teacher", avatarUrl: "" },
    partner: { name: "Partner", headline: "Student/Teacher", avatarUrl: "" },
  });
  const [agreement, setAgreement] = useState({
    skillA: "",
    skillB: "",
    duration: "1",
    sessions: "4",
    agreedToTerms: false,
  });

  useEffect(() => {
    if (swapId) fetchSwapDetails();
  }, [swapId]);

  // ⚡ REAL-TIME AGREEMENT & STATUS LISTENER
  useEffect(() => {
    if (!swapId) return;
    // Connect to Socket.IO and join the swap room
    socket.connect();
    socket.emit("join_swap_room", swapId);
    // Re-fetch details when partner updates or confirms the agreement
    const handleSwapUpdate = (data: any) => {
      fetchSwapDetails();
      if (data?.type === "AGREEMENT_CONFIRMED") {
        navigate(`/swap-details/${swapId}`);
      }
    };
    socket.on("swap_updated", handleSwapUpdate);
    return () => {
      socket.off("swap_updated", handleSwapUpdate);
    };
  }, [swapId, navigate]);

  const fetchSwapDetails = async () => {
    setIsLoading(true);
    setDebugError(null);
    const token =
      localStorage.getItem("knoxite_token") || localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${swapId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setDebugError(
          `Server Error: ${errorData.message || response.statusText}`
        );
        return;
      }

      const data = await response.json();

      // 🔒 SECURITY & ACCESS CONTROL CHECKS
      const currentUserStr =
        localStorage.getItem("knoxite_user") || localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};

      // 1. Prevent requester from filling terms meant for receiver
      if (data.receiverId && data.receiverId !== currentUser.id) {
        alert(
          "Only the user who received this swap request can finalize the agreement terms."
        );
        navigate("/dashboard", { replace: true });
        return;
      }

      // 2. If agreement is already finalized, redirect to workspace details
      if (data.status && data.status !== "PENDING_AGREEMENT") {
        navigate(`/swap-details/${swapId}`, { replace: true });
        return;
      }

      setParticipants({
        me: {
          name: data.me?.name || "You",
          headline: data.me?.bio || "Student / Peer Mentor",
          avatarUrl: data.me?.avatarUrl || "",
        },
        partner: {
          name: data.partner?.name || "Partner",
          headline: data.partner?.bio || "Student / Peer Mentor",
          avatarUrl: data.partner?.avatarUrl || "",
        },
      });

      setAgreement((prev) => ({
        ...prev,
        skillA:
          typeof data.offeredSkill === "object"
            ? data.offeredSkill.name
            : data.offeredSkill || "Skill A",
        skillB:
          typeof data.wantedSkill === "object"
            ? data.wantedSkill.name
            : data.wantedSkill || "Skill B",
        sessions: data.sessions ? String(data.sessions) : prev.sessions,
      }));
    } catch (err: any) {
      setDebugError(`Network Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!agreement.agreedToTerms) {
      alert("Please agree to the Knoxite Oath first.");
      return;
    }
    try {
      const token =
        localStorage.getItem("knoxite_token") || localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/swaps/${swapId}/agreement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "bypass-tunnel-reminder": "true",
          },
          body: JSON.stringify({
            duration: agreement.duration,
            sessions: agreement.sessions,
            agreedToTerms: true,
          }),
        }
      );
      if (response.ok) {
        navigate(`/swap-details/${swapId}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to sign: ${errorData.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Submit Error:", error);
      alert(`Network Error: ${error.message}. Check your server connection.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 size-8 mb-3" />
        <span className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">
          Loading Swap Agreement...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20 flex flex-col relative overflow-x-hidden transition-colors duration-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* FLOATING GLASS HEADER */}
      <div className="sticky top-4 z-30 px-4 sm:px-6">
        <header className="max-w-xl mx-auto flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="size-9 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 transition-colors shrink-0"
              title="Return"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5" />
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="size-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/25">
                K
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Finalize Swap
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Step {step} of 3
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-xl mx-auto w-full px-4 pt-8 space-y-6 relative z-10">
        {debugError && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 p-3.5 rounded-2xl text-xs space-y-1">
            <strong className="font-bold">Sync Error:</strong> {debugError}
          </div>
        )}

        {/* STEPPER PROGRESS BAR */}
        <div className="relative flex items-center justify-between px-6 py-2">
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
          <div
            className="absolute left-10 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-300 z-0"
            style={{ width: `${((step - 1) / 2) * 80}%` }}
          />
          {[
            { num: 1, label: "Parties" },
            { num: 2, label: "Logistics" },
            { num: 3, label: "Oath" },
          ].map((s) => {
            const isCompleted = s.num < step;
            const isActive = s.num === step;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`size-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50"
                      : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {isCompleted ? <Check className="size-4" /> : s.num}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: PARTICIPANTS */}
        {step === 1 && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base font-bold">
                Exchange Participants
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify the bilateral counterparties involved in this swap agreement.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* YOU */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <Avatar className="size-12 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                  <AvatarImage
                    src={
                      participants.me.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${participants.me.name}`
                    }
                  />
                  <AvatarFallback className="bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl text-xs">
                    {participants.me.name?.[0] || "Y"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
                    You (Receiver/Finalizer)
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate mt-0.5">
                    {participants.me.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {participants.me.headline}
                  </p>
                </div>
              </div>

              {/* Bilateral Trade Connector */}
              <div className="flex items-center justify-center">
                <div className="size-8 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                  <Repeat className="size-3.5" />
                </div>
              </div>

              {/* PARTNER */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                <Avatar className="size-12 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                  <AvatarImage
                    src={
                      participants.partner.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${participants.partner.name}`
                    }
                  />
                  <AvatarFallback className="bg-blue-600 text-white font-bold rounded-xl text-xs">
                    {participants.partner.name?.[0] || "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                    Peer Partner (Initiator)
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate mt-0.5">
                    {participants.partner.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {participants.partner.headline}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: SWAP LOGISTICS */}
        {step === 2 && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-xs rounded-3xl bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base font-bold">
                Swap Logistics & Curriculum
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirm session duration and target swap commitments.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                    You Teach
                  </Label>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 block">
                    {agreement.skillA}
                  </span>
                </div>
                <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                    You Learn
                  </Label>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 block">
                    {agreement.skillB}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Hrs Per Session
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={agreement.duration}
                    onChange={(e) =>
                      setAgreement({ ...agreement, duration: e.target.value })
                    }
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Total Sessions
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={agreement.sessions}
                    onChange={(e) =>
                      setAgreement({ ...agreement, sessions: e.target.value })
                    }
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl mt-4 text-center space-y-0.5 border border-transparent dark:border-slate-700">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Mutual Time Commitment
                </p>
                <p className="text-2xl font-black">
                  {Number(agreement.sessions) * Number(agreement.duration)} Hours Total
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: OATH */}
        {step === 3 && (
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-xs rounded-3xl bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base font-bold">
                The Knoxite Academic Oath
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Honor-code commitment to uphold mutual accountability and fairness.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 max-h-48 overflow-y-auto leading-relaxed">
                <p>
                  1. <strong>Reliability:</strong> I will arrive at scheduled peer sessions promptly and prepared.
                </p>
                <p>
                  <strong>2. Reciprocity:</strong> I will provide authentic, high-quality instruction in exchange for learning.
                </p>
                <p>
                  <strong>3. Respect:</strong> I will foster a constructive, safe, and professional academic environment.
                </p>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreement.agreedToTerms}
                  onCheckedChange={(c) =>
                    setAgreement({ ...agreement, agreedToTerms: !!c })
                  }
                  className="rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-0.5"
                />
                <Label
                  htmlFor="terms"
                  className="text-xs text-slate-700 dark:text-slate-300 leading-snug cursor-pointer select-none font-medium"
                >
                  I commit to this bilateral skill exchange and agree to uphold all community accountability guidelines.
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Previous Step
            </Button>
          )}
          <Button
            onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
            disabled={step === 3 && !agreement.agreedToTerms}
            className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
          >
            {step === 3 ? "Sign Bilateral Agreement" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}