import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useOnboardingTour } from '../utils/useOnboardingTour';
import {
  Bell, User, Trophy, LayoutGrid, Loader2,
  X, BookOpen, Star, ArrowRight, Zap, Search, CheckCircle2,
  MessageSquare, Activity, ShieldCheck
} from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(false); 
  const { startTour } = useOnboardingTour();

  // Modal State
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [swapMessage, setSwapMessage] = useState("Hi! I saw we have matching skills. Would you be interested in swapping?");
  const [isRequesting, setIsRequesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("knoxite_user") || "{}");
    setCurrentUserId(user.id);
    setUserRole(user.role);
    fetchDashboardData();
  }, []);



  useEffect(() => {
  const timer = setTimeout(() => {
    startTour();
  }, 500);

  return () => clearTimeout(timer);
}, []);


  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("knoxite_token");
      const headers = { 
        "Authorization": `Bearer ${token}`, 
        "bypass-tunnel-reminder": "true" 
      };
      
      // 🚀 UPDATED: Fetch requests at the same time to check for notifications
      const [sRes, mRes, reqRes] = await Promise.all([
        fetch(`${API_BASE_URL}/swaps`, { headers }),
        fetch(`${API_BASE_URL}/matches`, { headers }),
        fetch(`${API_BASE_URL}/swap-requests`, { headers })
      ]);

      if (sRes.ok) setSwaps(await sRes.json());
      if (mRes.ok) setMatches(await mRes.json());
      
      // 🚀 ADDED: Logic to toggle the red dot
      if (reqRes.ok) {
        const requests = await reqRes.json();
        const user = JSON.parse(localStorage.getItem("knoxite_user") || "{}");
        const hasPending = requests.some((req: any) => req.receiverId === user.id && req.status === "PENDING");
        setHasNewNotifications(hasPending);
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSwapRequest = async () => {
    if (!selectedMatch) return;
    setIsRequesting(true);
    try {
      const token = localStorage.getItem("knoxite_token");
      const response = await fetch(`${API_BASE_URL}/swaps/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "bypass-tunnel-reminder": "true"
        },
        body: JSON.stringify({
          receiverId: selectedMatch.id,
          offeredSkillId: selectedMatch.wantedSkills[0]?.id,
          wantedSkillId: selectedMatch.offeredSkills[0]?.id,
          message: swapMessage
        })
      });

      if (response.ok) {
        setSuccessMessage(`Request sent to ${selectedMatch.name}!`);
        setTimeout(() => setSuccessMessage(""), 4000);
        setSelectedMatch(null);
        fetchDashboardData();
      }
    } catch (error: any) {
      alert("Failed to send request.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancel = async (id: string, type: string) => {
    if (!window.confirm("Cancel this rotation?")) return;
    try {
      const token = localStorage.getItem("knoxite_token");
      const res = await fetch(`${API_BASE_URL}/swaps/cancel/${type}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      alert("Failed to cancel.");
    }
  };

  const activeRotations = swaps.filter(s =>
    s.status === "CONFIRMED" || s.status === "PENDING_AGREEMENT" || s.status === "ACCEPTED"
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin text-blue-600 size-10 mb-4" />
        <p className="text-blue-900 font-black italic tracking-tighter uppercase">Syncing Knoxite Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30 flex flex-col font-sans">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-black text-blue-900 italic tracking-tighter cursor-pointer" onClick={() => navigate("/dashboard")}>
          KNOXITE
        </h1>
        <div className="flex gap-2 items-center">
          {successMessage && <Badge className="bg-green-500 text-white animate-pulse mr-2">{successMessage}</Badge>}
          
          {userRole === "ADMIN" && (
            <Button
              variant="outline"
              onClick={() => navigate("/analytics")}
              className="border-blue-200 text-blue-600 font-bold hidden md:flex items-center gap-2 hover:bg-blue-50 transition-colors mr-2 rounded-xl text-xs uppercase"
            >
              <Activity className="size-4" />
              Analytics
            </Button>
          )}

          <div id="tour-nav-messages">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => 
              navigate("/chat")} 
              className="text-blue-600">
              <MessageSquare className="size-5" />
            </Button>
          </div>
          
          <div id="tour-nav-notifications">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => 
              navigate("/requests")} 
              className="relative">
              <Bell className="text-blue-600" />
              {/*  CONDITIONAL RED DOT */}
              {hasNewNotifications && (
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Button>
          </div>

          <div id="tour-nav-profile">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => 
              navigate("/profile")}>
              <User className="text-blue-600" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
        {/* Sidebar */}
        <aside className="md:col-span-3 space-y-4">
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
            <CardContent className="p-4 flex flex-col gap-2">
              {userRole === "ADMIN" && (
                <Button variant="ghost" className="justify-start text-red-600 font-bold hover:bg-red-50" onClick={() => navigate("/admin-dashboard")}>
                  <ShieldCheck className="mr-3 size-5 text-red-500" /> Admin Dashboard
                </Button>
              )}

              <div id="tour-community-forum" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-blue-700 hover:bg-blue-50 hover:text-blue-900"
                  onClick={() => navigate("/community-forum")}
                >
                  <MessageSquare className="size-5" />
                  Community Forum
                </Button>
              </div>

              <div id="tour-knoxhub" className="w-full">
                <Button 
                  id="tour-knoxhub"
                  variant="ghost" 
                  className="w-full justify-start text-blue-900 font-bold hover:bg-blue-50" 
                  onClick={() => navigate("/knox-hub")}
                >
                  <LayoutGrid className="mr-3 size-5 text-blue-500" /> 
                  KnoxHub

                </Button>
              </div>

              <div id="tour-leaderboard" className="w-full">
                <Button 
                  id="tour-leaderboard"
                  variant="ghost" 
                  className="w-full justify-start text-blue-900 font-bold hover:bg-blue-50" 
                  onClick={() => navigate("/leaderboard")}
                >
                  <Trophy className="mr-3 size-5 text-yellow-500" /> 
                  Leaderboard
                </Button>
              </div>
              
              <div id="tour-my-skills" className="w-full">
                <Button 
                  id="tour-my-skills"
                  variant="ghost" 
                  className="w-full justify-start text-blue-900 font-bold hover:bg-blue-50" 
                  onClick={() => navigate("/my-skills")}
                >
                  <BookOpen className="mr-3 size-5 text-emerald-500" /> 
                  My Skills
                </Button>
              </div>

            </CardContent>
          </Card>
        </aside>

        {/* Main Feed */}
        <main className="md:col-span-9 space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
              <Zap className="size-4 fill-blue-600 text-blue-600" /> Active Rotations
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeRotations.length === 0 ? (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-2xl border-blue-100 bg-white/50">
                  <p className="text-blue-300 font-medium italic">No active rotations.</p>
                </div>
              ) : (
                activeRotations.map(swap => (
                  <ActiveSwapCard key={swap.id} swap={swap} currentUserId={currentUserId} onCancel={handleCancel} />
                ))
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
              <Search className="size-4 text-blue-600" /> Skill Radar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((peer) => (
                <Card key={peer.id} className="border-none shadow-md hover:shadow-xl transition-all group bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 ring-2 ring-blue-50">
                        <AvatarImage src={peer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.name}`} />
                        <AvatarFallback className="bg-blue-600 text-white font-black">{peer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-blue-900">{peer.name}</h4>
                        <p className="text-[10px] text-blue-400 font-bold uppercase">Matches your profile</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedMatch(peer)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 group-hover:translate-y-[-2px] transition-all"
                    >
                      Quick Connect <ArrowRight className="ml-2 size-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 p-3 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-400">
          <p>© 2026 Knoxite Hub OLFU Computer Science</p>
          <div className="flex gap-4 items-center">
            <span className="text-blue-900 italic">Knoxite.org</span>
            <span className="h-3 w-[1px] bg-blue-100"></span>
            <p>Developed by: Bulawan, Estrada, Larona, Palma</p>
          </div>
        </div>
      </footer>

      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Request Swap</DialogTitle>
            <DialogDescription className="text-xs">
              Sending handshake to <span className="font-bold text-blue-600">{selectedMatch?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="message" className="text-xs text-blue-900 uppercase font-black">Message</Label>
            <Input id="message" value={swapMessage} onChange={(e) => setSwapMessage(e.target.value)} className="text-sm h-12 rounded-xl" />
          </div>
          <DialogFooter className="flex-row gap-2 mt-2">
            <Button variant="ghost" onClick={() => setSelectedMatch(null)} className="flex-1 text-xs">Cancel</Button>
            <Button onClick={handleSubmitSwapRequest} disabled={isRequesting} className="flex-[2] bg-blue-600 text-white text-xs font-bold rounded-xl">
              {isRequesting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActiveSwapCard({ swap, currentUserId, onCancel }: any) {
  const navigate = useNavigate();
  const isReq = swap.requesterId === currentUserId;
  const partner = isReq ? swap.receiver : swap.requester;
  const mySessions = isReq ? swap.requesterSessions : swap.receiverSessions;
  const progress = (Math.min(mySessions, swap.sessions) / swap.sessions) * 100;

  return (
    <Card
      className="border-none shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all bg-white rounded-2xl group border-l-4 border-l-blue-600"
      onClick={() => navigate(swap.status === "PENDING_AGREEMENT" ? `/swap-agreement/${swap.id}` : `/swap-details/${swap.id}`)}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 ring-2 ring-blue-50 shadow-sm">
            <AvatarImage src={partner?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.name}`} />
            <AvatarFallback className="bg-blue-900 text-white font-black">{partner?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-black text-blue-900 text-base tracking-tight">{partner?.name}</h4>
            <p className="text-[10px] text-blue-600 font-black uppercase">{swap.status}</p>
          </div>
        </div>
        <Button
          variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-500 text-gray-200"
          onClick={(e) => { e.stopPropagation(); onCancel(swap.id, "agreement"); }}
        >
          <X className="size-5" />
        </Button>
      </div>
      <div className="h-1 w-full bg-blue-50">
        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
      </div>
    </Card>
  );
}