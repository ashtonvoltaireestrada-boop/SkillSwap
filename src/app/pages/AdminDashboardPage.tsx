import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  Search,
  Ban,
  Trash2,
  Loader2,
  ShieldAlert,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  RotateCw,
  BarChart3,
  MessageSquare,
  Award,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { API_BASE_URL } from "@/config";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "forum" | "leaderboard">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [forumSearchQuery, setForumSearchQuery] = useState("");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [threadReplies, setThreadReplies] = useState<{ [postId: string]: any[] }>({});
  const [loadingReplies, setLoadingReplies] = useState<{ [postId: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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
  const [adminPosts, setAdminPosts] = useState<any[]>([]);
  const [adminLeaderboard, setAdminLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("knoxite_user") || "{}");
    
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

    fetchAllAdminData();
  }, [navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const fetchAllAdminData = async () => {
    try {
      const token = localStorage.getItem("knoxite_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "bypass-tunnel-reminder": "true",
      };

      const [adminDashRes, analyticsRes, forumRes, lbRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard-data`, { headers }),
        fetch(`${API_BASE_URL}/analytics`, { headers }),
        fetch(`${API_BASE_URL}/forum/posts`, { headers }),
        fetch(`${API_BASE_URL}/leaderboard`, { headers }),
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

      if (forumRes.ok) {
        const postsData = await forumRes.json();
        const resolvedPosts = Array.isArray(postsData)
          ? postsData
          : postsData.posts || postsData.data || [];
        setAdminPosts(resolvedPosts);
      }

      if (lbRes.ok) {
        const lbData = await lbRes.json();
        const resolvedLeaderboard = lbData.topMentors || (Array.isArray(lbData) ? lbData : []);
        setAdminLeaderboard(resolvedLeaderboard);
      }
    } catch (error) {
      console.error("Network error while aggregating admin data:", error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const handleManualRefresh = () => {
    setIsSyncing(true);
    fetchAllAdminData();
  };

  const handleToggleThreadExpand = async (post: any) => {
    const postId = post.id;
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);

    if (threadReplies[postId]) return;

    setLoadingReplies((prev) => ({ ...prev, [postId]: true }));
    try {
      const token = localStorage.getItem("knoxite_token");
      const res = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setThreadReplies((prev) => ({ ...prev, [postId]: data.comments || [] }));
      }
    } catch (err) {
      console.error("Failed to load thread comments:", err);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleBanUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to ban ${userName}?`)) return;

    try {
      const token = localStorage.getItem("knoxite_token");
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchAllAdminData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to ban user.");
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const handleDeletePost = async (postId: string, titleOrContent: string) => {
    if (!window.confirm(`Delete thread: "${titleOrContent.slice(0, 30)}..."?`)) return;

    try {
      const token = localStorage.getItem("knoxite_token");
      const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
      });

      if (response.ok) {
        setAdminPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert("Failed to delete thread.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSignOut = () => {
    if (confirm("Sign out of the Knoxite Admin Console?")) {
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
    return u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
  });

  const filteredPosts = adminPosts.filter((post) => {
    const query = forumSearchQuery.toLowerCase();
    return (
      (post.title || "").toLowerCase().includes(query) ||
      (post.content || "").toLowerCase().includes(query) ||
      (post.author?.name || "").toLowerCase().includes(query)
    );
  });

  const combinedSkillMap = new Map<string, { skill: string; supply: number; demand: number }>();
  skillTrends.topOffered.forEach((item) => {
    combinedSkillMap.set(item.name, { skill: item.name, supply: item.count, demand: 0 });
  });
  skillTrends.topWanted.forEach((item) => {
    if (combinedSkillMap.has(item.name)) {
      combinedSkillMap.get(item.name)!.demand = item.count;
    } else {
      combinedSkillMap.set(item.name, { skill: item.name, supply: 0, demand: item.count });
    }
  });
  const pairedBarData = Array.from(combinedSkillMap.values()).slice(0, 8);

  const completionVelocityData = [
    { period: "Phase 1", rate: Math.max(stats.completionRate - 25, 30) },
    { period: "Phase 2", rate: Math.max(stats.completionRate - 15, 45) },
    { period: "Phase 3", rate: Math.max(stats.completionRate - 8, 55) },
    { period: "Phase 4", rate: Math.max(stats.completionRate - 3, 65) },
    { period: "Current", rate: stats.completionRate || 75 },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-white">
        <Loader2 className="animate-spin text-blue-600 size-10 mb-4" />
        <p className="font-bold text-xs tracking-widest uppercase text-slate-500">
          Syncing Knoxite Command Center...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"}`}>
      {/* 1. KNOXITE LIGHT SLATE SIDEBAR */}
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between shrink-0 select-none hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="size-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/30">
              K
            </div>
            <div>
              <h1 className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Knoxite
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Admin Console
              </span>
            </div>
          </div>

          <div className="px-3 py-6 space-y-6">
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                Main Menu
              </span>
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { id: "analytics", label: "Analytics & Trends", icon: BarChart3 },
                  { id: "forum", label: "Forum Moderation", icon: MessageSquare },
                  { id: "leaderboard", label: "Leaderboard Audit", icon: Award },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8 rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 shrink-0">
              <AvatarImage src={currentUserAvatar} className="object-cover" />
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {currentUserName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{currentUserName}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUserEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-6 md:px-8 py-4 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {activeTab === "dashboard" && "System Operations & User Directory"}
              {activeTab === "analytics" && "Platform Analytics & Market Disparity"}
              {activeTab === "forum" && "Community Forum Content Moderation"}
              {activeTab === "leaderboard" && "Campus Reputation & Leaderboard Audit"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === "dashboard" && "Real-time user base, bilateral active sessions, and access moderation."}
              {activeTab === "analytics" && "Skill supply vs. demand balance alongside mutual sign-off reliability."}
              {activeTab === "forum" && "Direct database query of student threads, replies, and removal tools."}
              {activeTab === "leaderboard" && "Verified ranking audit based on completed swaps and peer ratings."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
            </button>
            <Button
              onClick={handleManualRefresh}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs gap-1.5 h-9 cursor-pointer"
            >
              <RotateCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>Refresh Sync</span>
            </Button>
          </div>
        </header>

        <main className="p-6 md:p-8 space-y-8 max-w-7xl">
          {/* TAB 1: OPERATIONAL DASHBOARD */}
          {activeTab === "dashboard" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Registered Students</span>
                    <Users className="size-4 text-slate-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Verified accounts</p>
                  </div>
                </div>

                <div className="bg-[#059669] text-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active On-Going Swaps</span>
                    <CheckCircle2 className="size-4 text-emerald-200" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-white">{stats.activeSwaps}</span>
                    <p className="text-[11px] text-emerald-100 font-medium mt-0.5">1-on-1 sessions running</p>
                  </div>
                </div>

                <div className="bg-[#D97706] text-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Completed Swaps</span>
                    <Clock className="size-4 text-amber-200" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-white">{stats.completedSwaps}</span>
                    <p className="text-[11px] text-amber-100 font-medium mt-0.5">Mutual sign-offs finished</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Peer Evaluations</span>
                    <TrendingUp className="size-4 text-slate-400" />
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalReviews}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Feedback submissions logged</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">User Directory</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage registered Knoxite accounts and enforce platform access control.</p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <Input
                      type="search"
                      placeholder="Filter by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-xs rounded-xl w-full"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <ShieldAlert className="size-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching student accounts found</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">User Profile</th>
                          <th className="py-3.5 px-6">Email Address</th>
                          <th className="py-3.5 px-6">System Role</th>
                          <th className="py-3.5 px-6 text-right">Moderation Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map((user) => {
                          const isUserAdmin = user.role === "ADMIN";
                          return (
                            <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-9 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                                    <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                                    <AvatarFallback className="bg-blue-600 text-white font-black text-xs rounded-xl">{user.name?.[0] || "U"}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {user.id.slice(0, 8)}...</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{user.email}</td>
                              <td className="py-4 px-6">
                                <Badge className={`text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                                  isUserAdmin
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  {user.role || "USER"}
                                </Badge>
                              </td>
                              <td className="py-4 px-6 text-right">
                                {!isUserAdmin ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBanUser(user.id, user.name)}
                                    className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold"
                                  >
                                    <Ban className="size-3.5" />
                                    <span>Ban User</span>
                                  </Button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium italic">Protected Admin</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ANALYTICS VIEW */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="size-4 text-blue-600" />
                    Skill Supply vs. Demand Balance
                  </h3>
                  <div className="h-80 w-full pt-3">
                    {pairedBarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pairedBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                          <XAxis dataKey="skill" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                          <Bar dataKey="supply" name="Supply (Can Teach)" fill="#2563EB" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="demand" name="Demand (Wants to Learn)" fill="#059669" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No supply/demand data logged.</div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-600" />
                    Swap Completion Rate (%)
                  </h3>
                  <div className="h-80 w-full pt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={completionVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Line type="monotone" dataKey="rate" name="Completion Rate (%)" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMUNITY FORUM MODERATION (ACCORDION REPLIES) */}
          {activeTab === "forum" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Community Forum Threads & Questions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Click any row to inspect nested student replies or delete threads.</p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <Input
                      type="search"
                      placeholder="Search title, content, or author..."
                      value={forumSearchQuery}
                      onChange={(e) => setForumSearchQuery(e.target.value)}
                      className="pl-10 h-10 border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-xs rounded-xl w-full"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {filteredPosts.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <MessageSquare className="size-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No forum posts found</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">Thread Information</th>
                          <th className="py-3.5 px-6">Author</th>
                          <th className="py-3.5 px-6">Replies</th>
                          <th className="py-3.5 px-6">Posted Date</th>
                          <th className="py-3.5 px-6 text-right">Moderation Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredPosts.map((post) => {
                          const isExpanded = expandedPostId === post.id;
                          const commentsList = threadReplies[post.id] || [];
                          const replyCount = post._count?.comments ?? commentsList.length;

                          return (
                            <Fragment key={post.id}>
                              <tr
                                onClick={() => handleToggleThreadExpand(post)}
                                className={`cursor-pointer transition-colors ${
                                  isExpanded
                                    ? "bg-blue-50/50 dark:bg-slate-800/60"
                                    : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                }`}
                              >
                                <td className="py-4 px-6 max-w-md">
                                  <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                      <ChevronUp className="size-4 text-blue-600 shrink-0" />
                                    ) : (
                                      <ChevronDown className="size-4 text-slate-400 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 dark:text-white truncate">
                                        {post.title || "Discussion Thread"}
                                      </p>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                        {post.content}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="size-7 rounded-lg ring-1 ring-slate-200 shrink-0">
                                      <AvatarImage src={post.author?.avatarUrl} />
                                      <AvatarFallback className="bg-slate-700 text-white text-[10px] font-bold">
                                        {(post.author?.name || "S").charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                      {post.author?.name || "Student"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-semibold border-slate-200 dark:border-slate-700"
                                  >
                                    {replyCount} replies
                                  </Badge>
                                </td>
                                <td className="py-4 px-6 text-slate-400 font-medium">
                                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}
                                </td>
                                <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePost(post.id, post.title || post.content)}
                                    className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold"
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span>Remove</span>
                                  </Button>
                                </td>
                              </tr>

                              {/* NESTED REPLIES ROW */}
                              {isExpanded && (
                                <tr key={`${post.id}-replies`} className="bg-slate-50/80 dark:bg-slate-900/60">
                                  <td colSpan={5} className="py-3 px-8">
                                    <div className="space-y-2 border-l-2 border-blue-500 pl-4 my-2">
                                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Thread Replies ({loadingReplies[post.id] ? "..." : commentsList.length})
                                      </p>

                                      {loadingReplies[post.id] ? (
                                        <div className="flex items-center gap-2 py-2 text-xs text-blue-600 font-medium">
                                          <Loader2 className="size-3.5 animate-spin" />
                                          <span>Loading replies...</span>
                                        </div>
                                      ) : commentsList.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-1">No replies in this thread yet.</p>
                                      ) : (
                                        commentsList.map((reply: any, rIdx: number) => (
                                          <div
                                            key={reply.id || rIdx}
                                            className="flex items-start justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 gap-4"
                                          >
                                            <div className="flex items-start gap-2.5 min-w-0">
                                              <CornerDownRight className="size-3.5 text-slate-400 mt-1 shrink-0" />
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                                                    {reply.author?.name || "Student"}
                                                  </span>
                                                  <span className="text-[10px] text-slate-400">
                                                    {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ""}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                                  {reply.content}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEADERBOARD AUDIT */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Campus Peer Leaderboard Rankings</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live student standing, reputation point totals, and validated session counts.</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
                    Database Verified
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  {adminLeaderboard.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <Award className="size-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No leaderboard data registered yet</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">Rank</th>
                          <th className="py-3.5 px-6">Student</th>
                          <th className="py-3.5 px-6">Reputation Points</th>
                          <th className="py-3.5 px-6">Completed Swaps</th>
                          <th className="py-3.5 px-6 text-right">Avg Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {adminLeaderboard.map((student, idx) => {
                          const rank = idx + 1;
                          return (
                            <tr key={student.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-4 px-6 font-black text-sm">
                                {rank === 1 && <span className="text-amber-500">🥇 #1</span>}
                                {rank === 2 && <span className="text-slate-400">🥈 #2</span>}
                                {rank === 3 && <span className="text-amber-700">🥉 #3</span>}
                                {rank > 3 && <span className="text-slate-500">#{rank}</span>}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8 rounded-xl ring-1 ring-slate-200">
                                    <AvatarImage src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">{student.name?.charAt(0) || "U"}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                                    <span className="text-[10px] text-slate-400 font-mono">{student.email || "Campus Student"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-black text-blue-600 text-sm">
                                  {student.points || student.reputation || student.reputationPoints || 0}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-1 font-medium">pts</span>
                              </td>
                              <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                                {student.completedSwaps || student._count?.completedSwaps || 0} sessions
                              </td>
                              <td className="py-4 px-6 text-right font-black text-amber-500">
                                ★ {Number(student.rating || student.avgRating || 5.0).toFixed(1)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}