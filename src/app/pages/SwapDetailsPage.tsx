import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { 
  ArrowLeft, CheckCircle2, MessageSquare, 
  Star, Award, Loader2, Send 
} from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function SwapDetailsPage() {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const [swap, setSwap] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => { 
    const user = JSON.parse(localStorage.getItem("knoxite_user") || "{}");
    setCurrentUser(user);
    fetchDetails(); 
  }, [swapId]);

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("knoxite_token");
      const res = await fetch(`${API_BASE_URL}/swaps/${swapId}`, { 
        headers: { 
          "Authorization": `Bearer ${token}`,
          "bypass-tunnel-reminder": "true"
        } 
      });
      if (res.ok) {
        const data = await res.json();
        setSwap(data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const logSession = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("knoxite_token");
      const res = await fetch(`${API_BASE_URL}/swaps/${swapId}/log-session`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "bypass-tunnel-reminder": "true"
        }
      });
      if (res.ok) {
        fetchDetails();
      }
    } catch (err) {
      console.error("Log Session Error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!swap || !currentUser) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="size-8 text-blue-600 animate-spin mb-3" />
        <span className="text-slate-900 font-bold text-xs uppercase tracking-widest">
          Synchronizing Rotation Data...
        </span>
      </div>
    );
  }

  // Bilateral Logic Assessment
  const isRequester = swap.requesterId === currentUser.id;
  const mySessions = isRequester ? swap.requesterSessions : swap.receiverSessions;
  const partnerSessions = isRequester ? swap.receiverSessions : swap.requesterSessions;
  const isCompleted = swap.status === "COMPLETED";
  
  const iAmDone = mySessions >= swap.sessions;
  const partnerIsDone = partnerSessions >= swap.sessions;
  const readyToReview = iAmDone && partnerIsDone && !isCompleted;

  return (
   <div className="min-h-screen bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950   text-slate-900 dark:text-slate-100 font-sans flex flex-col relative overflow-x-hidden transition-colors duration-200">

      {/* SUBTLE ARCHITECTURAL GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* 1. FLOATING GLASS HEADER */}
      <div className="sticky top-4 z-30 px-4 sm:px-6">
        <header className="max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard")} 
              className="size-9 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="size-5" />
            </Button>

            <div className="h-5 w-[1px] bg-slate-200 mx-0.5 hidden sm:block" />

            <div 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="size-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/25">
                K
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Swap Tracking
                </span>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold h-9 px-3.5 shadow-2xs"
            onClick={() => navigate(`/chat?partnerId=${swap?.partner?.id}`)}
          >
            <MessageSquare className="mr-1.5 size-3.5 text-blue-600" /> Message
          </Button>
        </header>
      </div>

      {/* 2. MAIN TRACKING CONTAINER */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 space-y-6 relative z-10">
        <Card className="border-slate-200/90 shadow-xs bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 p-6 sm:p-7">
            <div className="flex justify-between items-center gap-3">
              <div>
                <CardTitle className="text-slate-900 font-black text-2xl tracking-tight">
                  Skill Swap Progress
                </CardTitle>
              </div>
              <span className="bg-blue-50 text-blue-700 border border-blue-200/60 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg">
                {swap.status.replace("_", " ")}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 space-y-7">
            {/* BILATERAL PROGRESS METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* My Progress */}
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200/70 bg-slate-50/70">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Your Validation
                </p>
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-blue-600">
                      {mySessions}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      / {swap.sessions}
                    </span>
                  </div>
                  {iAmDone && <CheckCircle2 className="size-5 text-emerald-600" />}
                </div>
                <Progress 
                  value={(mySessions / swap.sessions) * 100} 
                  className="h-2 bg-blue-100 [&>div]:bg-blue-600 rounded-full" 
                />
              </div>

              {/* Partner Progress */}
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200/70 bg-slate-50/70">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {swap.partner?.name || "Partner"}'s Validation
                </p>
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800">
                      {partnerSessions}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      / {swap.sessions}
                    </span>
                  </div>
                  {partnerIsDone && <CheckCircle2 className="size-5 text-emerald-600" />}
                </div>
                <Progress 
                  value={(partnerSessions / swap.sessions) * 100} 
                  className="h-2 bg-slate-200 [&>div]:bg-emerald-600 rounded-full" 
                />
              </div>
            </div>

            {/* ACTION & STATUS STATES */}
            <div className="pt-2 border-t border-slate-100">
              {isCompleted ? (
                <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200/70 space-y-3">
                  <Award className="size-10 text-emerald-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-emerald-950 text-base">Rotation Finalized & Verified</h3>
                    <p className="text-xs text-emerald-700">Both counterparties have completed and validated all agreed swap hours.</p>
                  </div>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 text-xs shadow-sm shadow-emerald-600/20" 
                    onClick={() => navigate("/dashboard")}
                  >
                    Return Home
                  </Button>
                </div>
              ) : readyToReview ? (
                <div className="text-center p-6 bg-amber-50 rounded-2xl border border-amber-200/70 space-y-3">
                  <Star className="size-10 text-amber-500 mx-auto fill-amber-500" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-amber-950 text-base">Mutual Validation Complete</h3>
                    <p className="text-xs text-amber-700 font-medium">Both peers have confirmed the sessions. Proceed to peer evaluation to conclude the swap.</p>
                  </div>
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-11 rounded-xl text-xs shadow-sm shadow-amber-500/20" 
                    onClick={() => navigate(`/reputation?partnerId=${swap?.partner?.id}&swapId=${swap.id}`)}
                  >
                    Evaluate Peer <Award className="ml-1.5 size-4" />
                  </Button>
                </div>
              ) : iAmDone ? (
                <div className="text-center p-6 bg-blue-50/70 rounded-2xl border border-blue-200/70 space-y-2">
                  <Loader2 className="size-7 text-blue-600 animate-spin mx-auto mb-1" />
                  <h3 className="font-bold text-blue-950 text-base">Awaiting Partner Validation</h3>
                  <p className="text-xs text-blue-700 font-medium max-w-sm mx-auto">
                    You have logged all sessions. Waiting for {swap.partner?.name || "your partner"} to confirm their side of the exchange.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-600/20" 
                    onClick={logSession} 
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="animate-spin size-4" /> : "Log Completed Session"}
                  </Button>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-2xs border border-slate-100 text-blue-600">
                        <MessageSquare className="size-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Coordination
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          Need to schedule a meeting?
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-blue-600 font-bold text-xs uppercase hover:bg-blue-50 rounded-xl"
                      onClick={() => navigate(`/chat?partnerId=${swap?.partner?.id}`)}
                    >
                      Chat Now <Send className="ml-1.5 size-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 3. FOOTER */}
      <footer className="mt-auto py-4 text-center relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Knoxite.org
        </p>
      </footer>
    </div>
  );
}