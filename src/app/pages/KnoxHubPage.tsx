import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Loader2, Repeat, BarChart3 } from "lucide-react";
import { API_BASE_URL } from "@/config";

// Seed data for pre-deployment UI visualization (automatically replaced once live hub listings exist)
const SAMPLE_CAMPUS_SKILLS = [
  { name: "React & TypeScript", offered: 14, wanted: 22, total: 36 },
  { name: "SQL & Prisma", offered: 18, wanted: 12, total: 30 },
  { name: "UI/UX & Figma", offered: 9, wanted: 24, total: 33 },
  { name: "Python & Algorithms", offered: 16, wanted: 15, total: 31 },
  { name: "Data Analytics", offered: 11, wanted: 19, total: 30 },
  { name: "Cybersecurity", offered: 8, wanted: 17, total: 25 },
];

export default function KnoxHubPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State for the Hub
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSkillFilter, setActiveSkillFilter] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Modal State
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [swapMessage, setSwapMessage] = useState(
    "Hi! I saw your listing on KnoxHub. Would you be interested in a bilateral skill swap?"
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("knoxite_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch hub listings.");
      }

      setMatches(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // DATA ANALYTICS ENGINE: Aggregates Supply (Teaches) vs Demand (Wants)
  const skillAnalytics = useMemo(() => {
    const counts: Record<
      string,
      { name: string; offered: number; wanted: number; total: number }
    > = {};

    matches.forEach((peer) => {
      peer.offeredSkills?.forEach((s: any) => {
        const key = s.name.trim();
        if (!counts[key]) counts[key] = { name: key, offered: 0, wanted: 0, total: 0 };
        counts[key].offered += 1;
        counts[key].total += 1;
      });

      peer.wantedSkills?.forEach((s: any) => {
        const key = s.name.trim();
        if (!counts[key]) counts[key] = { name: key, offered: 0, wanted: 0, total: 0 };
        counts[key].wanted += 1;
        counts[key].total += 1;
      });
    });

    const realSkills = Object.values(counts)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const isSampleData = realSkills.length === 0;
    const activeSkills = isSampleData ? SAMPLE_CAMPUS_SKILLS : realSkills;

    const maxCount = Math.max(
      ...activeSkills.map((s) => Math.max(s.offered, s.wanted)),
      1
    );

    return { skills: activeSkills, maxCount, isSampleData };
  }, [matches]);

  // Filter hub cards by search query or clicked analytics bar
  const filteredMatches = useMemo(() => {
    return matches.filter((peer) => {
      const q = (activeSkillFilter || searchQuery).toLowerCase().trim();
      if (!q) return true;

      const nameMatch = peer.name?.toLowerCase().includes(q);
      const offeredMatch = peer.offeredSkills?.some((s: any) =>
        s.name.toLowerCase().includes(q)
      );
      const wantedMatch = peer.wantedSkills?.some((s: any) =>
        s.name.toLowerCase().includes(q)
      );

      return nameMatch || offeredMatch || wantedMatch;
    });
  }, [matches, searchQuery, activeSkillFilter]);

  const handleSubmitSwapRequest = async () => {
    if (!selectedMatch) return;
    setIsRequesting(true);

    try {
      const token = localStorage.getItem("knoxite_token");
      const targetWantedSkillId = selectedMatch.wantedSkills?.[0]?.id;
      const targetOfferedSkillId = selectedMatch.offeredSkills?.[0]?.id;

      const response = await fetch(`${API_BASE_URL}/swaps/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify({
          receiverId: selectedMatch.id,
          offeredSkillId: targetWantedSkillId,
          wantedSkillId: targetOfferedSkillId,
          message: swapMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send request.");
      }

      setSuccessMessage(`Swap request sent to ${selectedMatch.name}!`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setSelectedMatch(null);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950">
        <Loader2 className="animate-spin size-8 text-blue-600 mb-3" />
        <p className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">
          Loading KnoxHub Directory...
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
        <header className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Left: Clean Return Arrow + KnoxHub Brand */}
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
                  KnoxHub
                </span>
              </div>
            </div>
          </div>

          {/* Right: Success Notification if sent */}
          <div className="flex items-center gap-2.5">
            {successMessage && (
              <Badge className="bg-emerald-600 text-white font-semibold px-3 py-1 rounded-lg">
                {successMessage}
              </Badge>
            )}
          </div>
        </header>
      </div>

      {/* 2. MAIN HUB CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-20 space-y-8 relative z-10">
        {/* TOP INTRO & SEARCH / FILTER TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Available Skill Swaps
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Browse all active student listings across campus or click a bar in the supply & demand distribution chart to filter by skill.
            </p>
          </div>

          {/* Unified Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Input
                placeholder="Filter by skill or student name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveSkillFilter(null);
                }}
                className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm shadow-2xs focus-visible:ring-blue-600"
              />
              {(searchQuery || activeSkillFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveSkillFilter(null);
                  }}
                  className="absolute right-1 top-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-2 h-9 rounded-lg"
                >
                  Reset
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="h-11 px-4 gap-2 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98] transition-all text-xs font-bold shrink-0 shadow-2xs"
            >
              <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
              {showAnalytics ? "Hide Supply & Demand" : "Show Supply & Demand"}
            </Button>
          </div>
        </div>

        {/* DATA ANALYTICS VISUALIZATION */}
        {showAnalytics && !error && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {skillAnalytics.isSampleData
                      ? "Preview Telemetry"
                      : "Live Hub Telemetry"}
                  </span>
                  {skillAnalytics.isSampleData && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      Sample Data (Pre-Deployment)
                    </span>
                  )}
                  {activeSkillFilter && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                      Filtered by: {activeSkillFilter}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                  Skill Supply vs. Demand Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {skillAnalytics.isSampleData
                    ? "Visual preview of campus skill supply (Teaches) vs. demand (Wants to Learn). Automatically switches to live user metrics upon deployment."
                    : `Real-time comparison of skills being taught versus skills requested across ${matches.length} active hub profiles.`}
                </p>
              </div>

              {/* Graph Legend */}
              <div className="flex items-center gap-5 text-xs font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-xs bg-blue-600 inline-block" />
                  <span className="text-slate-700 dark:text-slate-300">Teaches (Supply)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-xs bg-emerald-500 inline-block" />
                  <span className="text-slate-700 dark:text-slate-300">Wants to Learn (Demand)</span>
                </div>
              </div>
            </div>

            {/* Bar Chart Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
              {skillAnalytics.skills.map((item) => {
                const offeredWidth = Math.max(
                  Math.round((item.offered / skillAnalytics.maxCount) * 100),
                  item.offered > 0 ? 8 : 0
                );
                const wantedWidth = Math.max(
                  Math.round((item.wanted / skillAnalytics.maxCount) * 100),
                  item.wanted > 0 ? 8 : 0
                );
                const isSelected = activeSkillFilter === item.name;

                return (
                  <div
                    key={item.name}
                    onClick={() =>
                      setActiveSkillFilter(isSelected ? null : item.name)
                    }
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/50 shadow-2xs"
                        : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {item.name}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.offered} Mentors • {item.wanted} Learners
                      </span>
                    </div>

                    {/* Dual Horizontal Bars */}
                    <div className="space-y-1.5">
                      {/* Supply Bar (Blue) */}
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 text-right shrink-0">
                          Teaches
                        </span>
                        <div className="flex-1 h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-700"
                            style={{ width: `${offeredWidth}%` }}
                          />
                        </div>
                        <span className="w-5 text-[11px] font-bold text-slate-700 dark:text-slate-300 text-right">
                          {item.offered}
                        </span>
                      </div>

                      {/* Demand Bar (Emerald) */}
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 text-right shrink-0">
                          Wants
                        </span>
                        <div className="flex-1 h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                            style={{ width: `${wantedWidth}%` }}
                          />
                        </div>
                        <span className="w-5 text-[11px] font-bold text-slate-700 dark:text-slate-300 text-right">
                          {item.wanted}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* DIRECTORY LISTINGS GRID */}
        {error ? (
          <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/50 p-8 text-center space-y-4 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 inline-block">
              Profile Action Required
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Complete Your Skill Profile First
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{error}</p>
            <Button
              onClick={() => navigate("/my-skills")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-11 px-6 shadow-sm shadow-blue-600/20"
            >
              Configure My Skills
            </Button>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              No hub listings match your filter
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              Try clearing your search filter or adding more skills to your profile.
            </p>
            {(searchQuery || activeSkillFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveSkillFilter(null);
                }}
                className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Show All Listings
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((match, index) => (
              <div
                key={match.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-5"
              >
                {/* Top Card Header: User Info + Rating/Score */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-11 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                        <AvatarImage
                          src={
                            match.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.name}`
                          }
                        />
                        <AvatarFallback className="bg-blue-600 text-white font-black rounded-xl text-xs">
                          {match.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {match.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded">
                            {match.rating || "4.8"}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            Verified Peer
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                      {match.matchScore || Math.max(100 - index * 4, 72)}% Fit
                    </span>
                  </div>

                  {/* Skill Exchange Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
                    {/* Teaches (Blue) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                        Teaches (Available to Learn)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {match.offeredSkills?.length > 0 ? (
                          match.offeredSkills.map((skill: any) => (
                            <span
                              key={skill.id}
                              className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800/60 capitalize"
                            >
                              {skill.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                            None listed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Divider with curved arrows */}
                    <div className="relative flex items-center justify-center py-0.5">
                      <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
                      <div className="absolute bg-blue-600 text-white p-1 rounded-md shadow-2xs">
                        <Repeat className="size-3" />
                      </div>
                    </div>

                    {/* Wants to Learn (Emerald) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                        Wants to Learn (In Return)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {match.wantedSkills?.length > 0 ? (
                          match.wantedSkills.map((skill: any) => (
                            <span
                              key={skill.id}
                              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 capitalize"
                            >
                              {skill.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                            None listed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <Button
                  onClick={() => setSelectedMatch(match)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                >
                  Propose Bilateral Swap
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 3. REQUEST SWAP MODAL */}
        <Dialog
          open={!!selectedMatch}
          onOpenChange={(open) => !open && setSelectedMatch(null)}
        >
          <DialogContent className="max-w-[90vw] md:max-w-md rounded-3xl p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                Propose Bilateral Swap
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Sending a skill exchange request to{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedMatch?.name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            {selectedMatch && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs my-1">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 block">
                    They Teach
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">
                    {selectedMatch.offeredSkills?.[0]?.name || "Listed Skill"}
                  </span>
                </div>
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <Repeat className="size-3.5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 block">
                    They Want
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                    {selectedMatch.wantedSkills?.[0]?.name || "Peer Skill"}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 py-1">
              <Label
                htmlFor="message"
                className="text-[11px] text-slate-600 dark:text-slate-300 uppercase font-bold tracking-wider"
              >
                Introductory Message
              </Label>
              <Input
                id="message"
                value={swapMessage}
                onChange={(e) => setSwapMessage(e.target.value)}
                className="text-sm h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-600"
              />
            </div>

            <DialogFooter className="flex-row gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedMatch(null)}
                className="flex-1 text-xs font-semibold rounded-xl h-11 border-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSwapRequest}
                disabled={isRequesting}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-11 shadow-md shadow-blue-600/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                {isRequesting ? "Sending Request..." : "Send Swap Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}