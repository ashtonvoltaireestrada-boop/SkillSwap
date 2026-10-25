import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Loader2, 
  BookOpen, 
  Clock, 
  ArrowLeftRight,
  LayoutDashboard
} from "lucide-react";
import { API_BASE_URL } from "@/config";

// --- Type Definitions for Data Integrity ---
interface AnalyticsData {
  systemHealth: {
    totalUsers: number;
    totalSwaps: number;
    totalReviews: number;
  };
  swapMetrics: {
    completedSwaps: number;
    activeSwaps: number;
    pendingSwaps: number;
    completionRate: number;
  };
  skillTrends: {
    topWanted: { name: string; count: number }[];
    topOffered: { name: string; count: number }[];
  };
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("knoxite_token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/analytics`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "bypass-tunnel-reminder": "true" 
          }
        });

        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 size-10 mb-4" />
        <p className="text-slate-900 dark:text-slate-200 font-bold text-xs tracking-widest uppercase">
          Aggregating System Metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-200 pb-20">
      {/* SUBTLE ARCHITECTURAL GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* 1. FLOATING GLASS HEADER */}
      <div className="sticky top-4 z-30 px-4 sm:px-6">
        <header className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="size-9 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 transition-colors shrink-0"
              title="Return to Student Dashboard"
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
                  System Analytics
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[10px] font-bold uppercase tracking-wider rounded-xl px-2.5 py-1 flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              Live Data
            </Badge>

            <Button
              variant="outline"
              onClick={() => navigate("/admin-dashboard")}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl text-xs h-9 px-3.5"
            >
              <LayoutDashboard className="size-3.5 mr-1.5 hidden sm:inline" />
              Admin Panel
            </Button>
          </div>
        </header>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 space-y-8 relative z-10">
        
        {/* KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Network Users */}
          <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Total Network Users
                </span>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.systemHealth.totalUsers}
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="size-5" />
              </div>
            </CardContent>
          </Card>

          {/* Total Rotations */}
          <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Total Rotations
                </span>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.systemHealth.totalSwaps}
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="size-5" />
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Completion Rate
                </span>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.swapMetrics.completionRate}%
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
            </CardContent>
          </Card>

          {/* Peer Evaluations */}
          <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Peer Evaluations
                </span>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.systemHealth.totalReviews}
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <TrendingUp className="size-5" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* DETAILED DATA VISUALIZATION SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Skill Demographics (Marketplace Supply & Demand) */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Skill Distribution Trends
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Comparative analysis of academic supply (offered) versus demand (wanted)
              </p>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Demand (Wanted) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      High Demand Skills
                    </h3>
                  </div>

                  {data.skillTrends.topWanted.length > 0 ? (
                    <div className="space-y-3.5">
                      {data.skillTrends.topWanted.map((skill, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                              {skill.name}
                            </span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                              {skill.count} {skill.count === 1 ? "Request" : "Requests"}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((skill.count / Math.max(data.systemHealth.totalUsers, 1)) * 100, 100)} 
                            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-600" 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4">
                      Insufficient demand data for trend analysis.
                    </p>
                  )}
                </div>

                {/* Supply (Offered) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      High Supply Skills
                    </h3>
                  </div>

                  {data.skillTrends.topOffered.length > 0 ? (
                    <div className="space-y-3.5">
                      {data.skillTrends.topOffered.map((skill, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                              {skill.name}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              {skill.count} {skill.count === 1 ? "Offering" : "Offerings"}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((skill.count / Math.max(data.systemHealth.totalUsers, 1)) * 100, 100)} 
                            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500" 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4">
                      Insufficient supply data for trend analysis.
                    </p>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Column 3: Rotation Status Overview */}
          <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Rotation Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current state of initiated skill exchanges
              </p>
            </div>

            <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-around">
              {/* Status 1: Pending */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="size-10 rounded-xl bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <Clock className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      Pending
                    </span>
                    <span className="font-black text-base text-slate-900 dark:text-white">
                      {data.swapMetrics.pendingSwaps}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    Awaiting peer agreement
                  </p>
                </div>
              </div>

              {/* Status 2: Active */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/60 dark:border-blue-900/40">
                <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Activity className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-blue-900 dark:text-blue-200 truncate">
                      Active Rotations
                    </span>
                    <span className="font-black text-base text-blue-700 dark:text-blue-300">
                      {data.swapMetrics.activeSwaps}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-500/80 dark:text-blue-400/70 font-medium truncate">
                    Sessions in progress
                  </p>
                </div>
              </div>

              {/* Status 3: Completed */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/60 dark:border-emerald-900/40">
                <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200 truncate">
                      Completed & Verified
                    </span>
                    <span className="font-black text-base text-emerald-700 dark:text-emerald-300">
                      {data.swapMetrics.completedSwaps}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 font-medium truncate">
                    Concluded skill exchanges
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

        </section>
      </main>
    </div>
  );
}