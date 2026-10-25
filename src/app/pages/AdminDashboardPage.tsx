import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { 
  Users, 
  ArrowLeftRight, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Search, 
  Ban, 
  Loader2, 
  ShieldAlert,
  ChevronDown,
  Settings,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [currentUserName, setCurrentUserName] = useState("Admin");
  const [currentUserEmail, setCurrentUserEmail] = useState("admin@knoxite.org");
  const [currentUserAvatar, setCurrentUserAvatar] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const user = JSON.parse(localStorage.getItem("knoxite_user") || "{}");
    return user.id ? localStorage.getItem(`theme_${user.id}`) === "dark" : false;
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSwaps: 0,
    completedSwaps: 0,
    reportedIssues: 0,
    completionRate: 0,
    totalReviews: 0,
  });

  const [skillTrends, setSkillTrends] = useState<{
    topWanted: { name: string; count: number }[];
    topOffered: { name: string; count: number }[];
  }>({ topWanted: [], topOffered: [] });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("knoxite_user") || "{}");
    
    // Security check: Only admins can view this page
    if (user.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }

    setCurrentUserName(user.name || "Admin");
    setCurrentUserEmail(user.email || "admin@knoxite.org");
    setCurrentUserAvatar(
      user.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || "Admin"}`
    );

    fetchAdminData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("knoxite_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "bypass-tunnel-reminder": "true",
      };

      const [adminDashRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard-data`, { headers }),
        fetch(`${API_BASE_URL}/analytics`, { headers }),
      ]);

      if (adminDashRes.ok) {
        const dData = await adminDashRes.json();
        setRecentUsers(dData.recentUsers || []);
      }

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setStats({
          totalUsers: aData.systemHealth?.totalUsers || 0,
          activeSwaps: aData.swapMetrics?.activeSwaps || 0,
          completedSwaps: aData.swapMetrics?.completedSwaps || 0,
          reportedIssues: 0,
          completionRate: aData.swapMetrics?.completionRate || 0,
          totalReviews: aData.systemHealth?.totalReviews || 0,
        });
        setSkillTrends(aData.skillTrends || { topWanted: [], topOffered: [] });
      }
    } catch (error) {
      console.error("Network error while fetching admin command center:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to ban ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("knoxite_token");
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchAdminData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to ban user.");
      }
    } catch (error) {
      console.error("Error banning user:", error);
      alert("A network error occurred.");
    }
  };

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("knoxite_token");
      localStorage.removeItem("knoxite_user");
      document.documentElement.classList.remove("dark");
      navigate("/");
    }
  };

  const toggleDarkMode = () => {
    const user = JSON.parse(localStorage.getItem("knoxite_user") || "{}");
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      if (user.id) localStorage.setItem(`theme_${user.id}`, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      if (user.id) localStorage.setItem(`theme_${user.id}`, "light");
    }
  };

  const filteredUsers = recentUsers.filter((u) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 size-10 mb-4" />
        <p className="text-slate-900 dark:text-slate-200 font-bold text-xs tracking-widest uppercase">
          Aggregating Admin Control Panel...
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
        <header className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/25">
              K
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Knoxite
              </span>
            </div>
          </div>

         <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Admin
            </span>

            {/* Profile Dropdown */}
            <div ref={profileMenuRef} className="relative pl-1">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="relative flex items-center justify-center rounded-full transition-transform active:scale-95 focus:outline-none"
                title="Account Menu"
              >
                <Avatar className="size-9 rounded-full ring-2 ring-slate-200/80 dark:ring-slate-700 hover:ring-blue-500 transition-all">
                  <AvatarImage src={currentUserAvatar} className="object-cover" />
                  <AvatarFallback className="bg-rose-600 text-white text-xs font-bold">
                    {currentUserName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-4 bg-slate-800 dark:bg-slate-700 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <ChevronDown className="size-2.5 stroke-[3]" />
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl p-2.5 space-y-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="p-3 rounded-xl flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                    <Avatar className="size-11 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                      <AvatarImage src={currentUserAvatar} className="object-cover" />
                      <AvatarFallback className="bg-rose-600 text-white font-bold">
                        {currentUserName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {currentUserName}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {currentUserEmail}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                    >
                      <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-transparent group-hover:text-blue-600 flex items-center justify-center transition-colors">
                        <Settings className="size-4" />
                      </div>
                      <span>Account Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleDarkMode}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-transparent group-hover:text-blue-600 flex items-center justify-center transition-colors">
                          {isDarkMode ? (
                            <Sun className="size-4 text-amber-500" />
                          ) : (
                            <Moon className="size-4 text-slate-400" />
                          )}
                        </div>
                        <span>Dark Mode</span>
                      </div>
                      <div
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          isDarkMode ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        <div
                          className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                            isDarkMode ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-red-500/25 rounded-xl transition-colors text-left border-t border-slate-100/80 dark:border-slate-800 pt-2.5 group"
                    >
                      <div className="size-7 rounded-lg bg-rose-50 dark:bg-red-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-transparent flex items-center justify-center shrink-0 transition-colors">
                        <LogOut className="size-4" />
                      </div>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* 2. ADMIN MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-24 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => navigate("/community-forum")}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/70 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Community Forum
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/70 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Leaderboard
              </button>
            </nav>
          </div>
        </aside>

        {/* MAIN FEED: ANALYTICS & DIRECTORY */}
        <main className="md:col-span-9 space-y-8">
          {/* SECTION 1: METRIC KPIS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Total Users
                  </span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Active Swaps
                  </span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats.activeSwaps}
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Completion Rate
                  </span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats.completionRate}%
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Peer Evaluations
                  </span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats.totalReviews}
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="size-5" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 2: SUPPLY & DEMAND ANALYSIS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demand */}
            <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  High Demand Skills (Wanted)
                </h3>
              </div>
              <CardContent className="p-5 space-y-3.5">
                {skillTrends.topWanted.length > 0 ? (
                  skillTrends.topWanted.map((skill, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                          {skill.name}
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                          {skill.count} Requests
                        </span>
                      </div>
                      <Progress
                        value={Math.min((skill.count / Math.max(stats.totalUsers, 1)) * 100, 100)}
                        className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-600"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                    Insufficient data for demand analysis.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Supply */}
            <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  High Supply Skills (Offered)
                </h3>
              </div>
              <CardContent className="p-5 space-y-3.5">
                {skillTrends.topOffered.length > 0 ? (
                  skillTrends.topOffered.map((skill, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                          {skill.name}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {skill.count} Offerings
                        </span>
                      </div>
                      <Progress
                        value={Math.min((skill.count / Math.max(stats.totalUsers, 1)) * 100, 100)}
                        className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                    Insufficient data for supply analysis.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3: USER DIRECTORY & MODERATION */}
          <section className="space-y-4">
            <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    User Directory
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Moderate registered Knoxite accounts and handle access control
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 size-4" />
                  <Input
                    type="search"
                    placeholder="Filter by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus-visible:ring-blue-600 w-full"
                  />
                </div>
              </div>

              <CardContent className="p-0">
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center rounded-b-3xl space-y-2">
                    <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <ShieldAlert className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No matching users found
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredUsers.map((user) => {
                      const isUserAdmin = user.role === "ADMIN";
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 md:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Avatar className="size-11 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                              <AvatarImage
                                src={
                                  user.avatarUrl ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                                }
                              />
                              <AvatarFallback className="bg-blue-600 text-white font-black text-xs rounded-xl">
                                {user.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {user.name}
                              </h3>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Badge
                              className={`text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                                isUserAdmin
                                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/60"
                                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/60"
                              }`}
                            >
                              {isUserAdmin && (
                                <span className="size-1.5 rounded-full bg-rose-500 inline-block mr-1.5" />
                              )}
                              {user.role || "USER"}
                            </Badge>

                            {!isUserAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBanUser(user.id, user.name)}
                                className="size-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors shrink-0"
                                title={`Ban ${user.name}`}
                              >
                                <Ban className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}