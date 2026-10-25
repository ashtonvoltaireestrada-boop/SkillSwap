import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Repeat } from "lucide-react";
import { useEffect } from "react";

export default function PreviewPage() {
  const navigate = useNavigate();


  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* SUBTLE ARCHITECTURAL GRID & AMBIENT GLOW */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* 1. FLOATING GLASS NAVIGATION */}
      <div className="sticky top-4 z-50 px-4 sm:px-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-sm">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="size-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/25">
              K
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Knoxite
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection("ecosystem")}
              className="hover:text-blue-600 transition-colors"
            >
              Ecosystem
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-blue-600 transition-colors"
            >
              How It Works
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-slate-700 hover:text-blue-600 font-semibold rounded-xl "
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              //className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 shadow-md shadow-blue-600/20"
              className="h-9 px-4 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
              Join Now
            </Button>
          </div>
        </nav>
      </div>

      {/* 2. ASYMMETRIC SPLIT HERO SECTION */}
      <header className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-7 text-left">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-slate-950 leading-[1.03] tracking-tight">
              Don't just learn. <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Exchange.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed font-normal">
              A peer-to-peer skill exchange site where students swap knowledge 1-on-1. 
              Teach what you're good at, learn what you need — zero fees, 
              pure collaboration.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="h-14 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 transition-all"
              >
                Start Swapping Skills
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                //className="h-14 px-7 text-base font-semibold bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-2xl"
                className="h-14 px-7 text-base font-semibold bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md text-slate-700 border-slate-200 rounded-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Explore KnoxHub
              </Button>
            </div>

            {/* Trust / Quick Metrics Bar */}
            <div className="pt-6 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="text-2xl font-black text-slate-900">1-on-1</p>
                <p className="text-xs font-medium text-slate-500">
                  Bilateral Sessions
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-blue-600">100% Free</p>
                <p className="text-xs font-medium text-slate-500">
                  Student & Peer Driven
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Active Capstone Team Bilateral Swaps */}
          <div className="lg:col-span-5 relative space-y-4">
            {/* Decorative Ambient Backplate */}
            <div className="absolute -inset-3 bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-emerald-400/15 rounded-3xl blur-2xl -z-10" />

            {/* ==================== SWAP CARD 1: CHADWICK <-> ASHTON ==================== */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-900/5 p-5 space-y-3 relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Matched Swap #KX-01
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                  In Progress
                </span>
              </div>

              {/* Chadwick */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    CB
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 text-sm">Chadwick Jan Bulawan</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                        4.9
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="text-slate-400 font-medium">Teaches:</span>
                      <span className="text-blue-600 font-bold">React & UI/UX</span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Wants to Learn
                  </span>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg mt-0.5 border border-emerald-200/60">
                    SQL & Prisma
                  </span>
                </div>
              </div>

              {/* Connector */}
              <div className="relative flex items-center justify-center my-0.5">
                <div className="w-full border-t border-dashed border-slate-200" />
                <div className="absolute bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-600/20">
                  <Repeat className="size-3.5" />
                </div>
              </div>

              {/* Ashton */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    AE
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 text-sm">Ashton Voltaire Estrada</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                        4.8
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="text-slate-400 font-medium">Teaches:</span>
                      <span className="text-blue-600 font-bold">SQL & Prisma</span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Wants to Learn
                  </span>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg mt-0.5 border border-emerald-200/60">
                    React & UI/UX
                  </span>
                </div>
              </div>
            </div>

            {/* ==================== SWAP CARD 2: JUSTINE <-> NEIL ==================== */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-900/5 p-5 space-y-3 relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Matched Swap #KX-02
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Connected
                </span>
              </div>

              {/* Justine */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    JL
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 text-sm">Justine Josh Larona</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                        4.9
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="text-slate-400 font-medium">Teaches:</span>
                      <span className="text-blue-600 font-bold">Data Analytics</span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Wants to Learn
                  </span>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg mt-0.5 border border-emerald-200/60">
                    Cybersecurity
                  </span>
                </div>
              </div>

              {/* Connector */}
              <div className="relative flex items-center justify-center my-0.5">
                <div className="w-full border-t border-dashed border-slate-200" />
                <div className="absolute bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-600/20">
                  <Repeat className="size-3.5" />
                </div>
              </div>

              {/* Neil */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                    NP
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 text-sm">Neil Patrick Palma</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                        4.8
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="text-slate-400 font-medium">Teaches:</span>
                      <span className="text-blue-600 font-bold">Cybersecurity</span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Wants to Learn
                  </span>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg mt-0.5 border border-emerald-200/60">
                    Data Analytics
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Footnote */}
            <div className="text-center px-4 pt-1">
              <p className="text-[11px] leading-relaxed text-slate-400 mx-auto max-w-sm">
                Preview only. Swap sessions, chats, and bilateral matching data are strictly confidential to matched peers.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 4. BENTO GRID: CORE PLATFORM ECOSYSTEM */}
      <section id="ecosystem" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed for real accountability, not passive video courses.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Every feature inside Knoxite is engineered to connect learners,
            validate peer mentorship, and build a verifiable academic portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: KnoxHub */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs flex flex-col justify-between space-y-6 hover:border-blue-300 transition-colors">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 inline-block">
                Discovery Engine
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                KnoxHub Matchmaking Board
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Post the skill you need help with and what you can teach in return.
                Filter by department, topic, or proficiency level to find a compatible peer in seconds.
              </p>
            </div>

            {/* Mini Board Snippet */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    Offering: Java OOP
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Active</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Looking for a partner in Cisco Packet Tracer VLAN routing
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    Offering: Blender 3D
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Active</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Looking for a mentor in MySQL query optimization
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Bilateral Session Tracking */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2.5 py-1 rounded-md border border-blue-800 inline-block">
                Accountability
              </span>
              <h3 className="text-2xl font-black">
                Bilateral Session Verification
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Points and ratings are only awarded when both the mentor and apprentice
                confirm session completion inside the dedicated workspace.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Session Sign-off</span>
                <span className="text-emerald-400 font-bold">2 / 2 Confirmed</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-full rounded-full" />
              </div>
              <p className="text-[11px] text-slate-400">
                Unlocks peer rating & +150 Reputation Points upon mutual sign-off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3-STEP WORKFLOW) */}
      <section id="how-it-works" className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              The Exchange Loop
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Three steps from question to mastery.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Define Your Skill Profile",
                desc: "List the technical or academic skills you can confidently teach, alongside the topics you currently want to learn.",
              },
              {
                step: "02",
                title: "Match & Open a Swap",
                desc: "Browse KnoxHub for active requests or accept an incoming swap proposal. Coordinate directly in your dedicated session chat.",
              },
              {
                step: "03",
                title: "Verify & Rank Up",
                desc: "Complete your peer mentoring session, sign off bilaterally, leave a review, and climb the campus leaderboard.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200/80 space-y-4"
              >
                <span className="text-4xl font-black text-blue-600/20 block">
                  {item.step}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-slate-900 text-white p-10 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block">
              Ready to trade knowledge?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Join Knoxite's peer learning network today.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Create your free profile, post your first skill swap on KnoxHub,
              and start building your mentor reputation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="h-14 w-full sm:w-64 justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-base shadow-lg shadow-blue-600/30"
            >
              Create Your Knoxite Account
            </Button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="pb-12 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-200/70 pt-8">
        <div className="flex items-center gap-2">
          <div className="size-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            K
          </div>
          <span className="font-bold text-slate-800">Knoxite</span>
          <span>Knowledge Exchange Site</span>
        </div>
        <p>© {new Date().getFullYear()} Knoxite.</p>
      </footer>
    </div>
  );
}