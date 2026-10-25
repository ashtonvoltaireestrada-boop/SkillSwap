import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swappers, setSwappers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("mentors");

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem("knoxite_token");
        if (!token) {
          navigate("/");
          return;
        }

        const [leaderboardRes, swapsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/leaderboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "bypass-tunnel-reminder": "true",
            },
          }),
          fetch(`${API_BASE_URL}/leaderboard/swaps`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "bypass-tunnel-reminder": "true",
            },
          }),
        ]);

        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          const sortedMentors = [...(data.topMentors || [])].sort(
            (a, b) => b.rating - a.rating
          );
          setMentors(sortedMentors);
          setMyStats(data.currentUserStats || null);
        }

        if (swapsRes.ok) {
          setSwappers(await swapsRes.json());
        }
      } catch (error) {
        console.error("System synchronization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, [navigate]);

  const getRankStyles = (rank: number) => {
    if (rank === 1)
      return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60";
    if (rank === 2)
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700";
    if (rank === 3)
      return "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60";
    return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40";
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <Loader2 className="animate-spin size-8 text-blue-600 mb-3" />
        <p className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">
          Synchronizing Leaderboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col relative overflow-x-hidden transition-colors duration-200">
      {/* SUBTLE ARCHITECTURAL GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* 1. FLOATING GLASS HEADER */}
      <div className="sticky top-4 z-30 px-4 sm:px-6">
        <header className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="size-9 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="size-5" />
            </Button>

            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="size-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/25">
                K
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Leaderboard
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-8 space-y-6 relative z-10">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
            Merit & Reputation
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Knoxite Leaderboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recognize top-rated peer mentors and the most active bilateral swappers on campus.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val: any) => setActiveTab(val)}
          className="space-y-6"
        >

          <TabsList className="grid grid-cols-2 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 h-12 p-1= rounded-2xl shadow-xs">
            <TabsTrigger
              value="mentors"
              style={{
                backgroundColor: activeTab === "mentors" ? "#2563EB" : "transparent",
                color: activeTab === "mentors" ? "#ffffff" : undefined,
              }}
              className={`rounded-xl font-bold text-xs sm:text-sm transition-all border-0 ring-0 outline-none shadow-none ${
                activeTab === "mentors"
                  ? "text-white shadow-sm"
                  : "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Top Mentors
            </TabsTrigger>
            <TabsTrigger
              value="swaps"
              style={{
                backgroundColor: activeTab === "swaps" ? "#059669" : "transparent",
                color: activeTab === "swaps" ? "#ffffff" : undefined,
              }}
              className={`rounded-xl font-bold text-xs sm:text-sm transition-all border-0 ring-0 outline-none shadow-none ${
                activeTab === "swaps"
                  ? "text-white shadow-sm"
                  : "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Most Active
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TOP MENTORS */}
          <TabsContent value="mentors" className="mt-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Top Mentors
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ranked by average 5-star quality rating and verified student reviews.
                </p>
              </div>

              <div className="space-y-3">
                {mentors.length === 0 ? (
                  <p className="text-center text-slate-400 dark:text-slate-500 py-10 text-xs font-medium">
                    No mentors ranked yet.
                  </p>
                ) : (
                  mentors.map((mentor, index) => (
                    <div
                      key={mentor.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`flex items-center justify-center size-10 shrink-0 rounded-xl font-black text-xs border ${getRankStyles(
                            index + 1
                          )}`}
                        >
                          {index + 1}
                        </div>

                        <Avatar className="size-11 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                          <AvatarImage
                            src={
                              mentor.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`
                            }
                          />
                          <AvatarFallback className="bg-blue-600 text-white font-black rounded-xl text-xs">
                            {mentor.name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                            {mentor.name}
                          </h3>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60 mt-0.5">
                            Verified Mentor
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 w-full sm:w-auto border-t border-slate-200/60 dark:border-slate-800 sm:border-none pt-2.5 sm:pt-0 shrink-0">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {mentor.rating
                              ? Number(mentor.rating).toFixed(1)
                              : "0.0"}
                          </span>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                            / 5.0
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {mentor.reviews || 0} Verified Reviews
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: MOST ACTIVE SWAPPERS */}
          <TabsContent value="swaps" className="mt-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Most Active Swappers
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ranked strictly by the total number of completed bilateral skill swaps.
                </p>
              </div>

              <div className="space-y-3">
                {swappers.length === 0 ? (
                  <p className="text-center text-slate-400 dark:text-slate-500 py-10 text-xs font-medium">
                    No completed swaps recorded yet.
                  </p>
                ) : (
                  swappers.map((swapper, index) => (
                    <div
                      key={swapper.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`flex items-center justify-center size-10 shrink-0 rounded-xl font-black text-xs border ${getRankStyles(
                            index + 1
                          )}`}
                        >
                          {index + 1}
                        </div>

                        <Avatar className="size-11 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                          <AvatarImage
                            src={
                              swapper.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${swapper.name}`
                            }
                          />
                          <AvatarFallback className="bg-emerald-600 text-white font-black rounded-xl text-xs">
                            {swapper.name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                            {swapper.name}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            Verified Participant
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto border-t border-slate-200/60 dark:border-slate-800 sm:border-none pt-2.5 sm:pt-0 shrink-0">
                        <span className="inline-block text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                          {swapper.totalSwaps || 0} Total Swaps
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 3. PERSISTENT USER PERFORMANCE BAR */}
      {myStats && (
        <div className="fixed bottom-4 left-0 right-0 px-4 sm:px-6 z-30 pointer-events-none">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/95 dark:bg-slate-900 backdrop-blur p-4 sm:px-6 rounded-2xl text-white gap-4 shadow-xl border border-slate-800 pointer-events-auto">
            <div className="flex items-center gap-3.5">
              <div className="bg-blue-600 text-white size-10 shrink-0 rounded-xl flex items-center justify-center font-black text-xs shadow-sm">
                #{mentors.findIndex((u) => u.id === myStats.id) + 1 || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Your Standing
                </p>
                <p className="font-bold text-sm sm:text-base truncate">
                  {myStats.name}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="inline-block text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                Verified Account
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}