import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { ArrowLeft, Star, Loader2, Save, Repeat, Camera, FileText, X } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("Prefer not to say");
  const [avatarUrl, setAvatarUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("knoxite_token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setGender(data.gender || "Prefer not to say");
        setAvatarUrl(
          data.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(
              /\s+/g,
              ""
            )}`
        );
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Smart Image Upload & Compression Logic ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setAvatarUrl(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("knoxite_token");
      const url = `${API_BASE_URL}/profile/update`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify({
          name,
          bio,
          gender,
          avatarUrl,
        }),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        fetchUserProfile();
      } else {
        alert("Failed to update profile. Please check connection.");
      }
    } catch (error) {
      console.error("Save failed", error);
      alert("A system error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        <Loader2 className="animate-spin size-8 text-blue-600 mb-3" />
        <span className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">
          Synchronizing Profile Data...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col relative overflow-x-hidden transition-colors duration-200">
      {/* SUBTLE ARCHITECTURAL GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* 1. FLOATING GLASS HEADER */}
      <div className="sticky top-3 z-30 px-4 sm:px-6">
        <header className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="size-8 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="size-4" />
            </Button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="size-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-600/25">
                K
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Account Settings
              </span>
            </div>
          </div>
        </header>
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-5 pb-12 space-y-4 relative z-10">
        <div className="space-y-0.5 text-center sm:text-left">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Profile Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your campus identity, avatar, and academic biography.
          </p>
        </div>

        <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="pt-6 px-5 sm:px-8 pb-6">
            {/* Identity & Avatar Section */}
            <div className="flex flex-col items-center text-center mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="relative group mb-3">
                <Avatar className="size-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-2xl font-black rounded-2xl">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Trigger Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl shadow-md border-2 border-white dark:border-slate-900 hover:bg-blue-700 transition-colors"
                  title="Change Avatar"
                >
                  <Camera className="size-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {profile?.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-0.5">
                {profile?.email}
              </p>

              {/* Performance Stats */}
              <div className="flex justify-center gap-8 mt-4 py-2 px-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 w-full max-w-xs">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block mb-0.5">
                    Peer Rating
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {profile?.rating > 0 ? profile.rating : "0.0"}
                    </span>
                  </div>
                </div>
                <div className="text-center border-l border-slate-200/80 dark:border-slate-700 pl-8">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block mb-0.5">
                    Swaps
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <Repeat className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {profile?.swapsCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Update Form */}
            <form onSubmit={handleSave} className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-1">
                <Label
                  htmlFor="name"
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                >
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-600 h-10 font-semibold rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="gender"
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                >
                  Gender Identity
                </Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="bio"
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                >
                  Academic Biography
                </Label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your academic strengths and learning goals..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[75px] resize-none"
                />
              </div>

              <div className="pt-1 space-y-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-bold text-xs shadow-sm shadow-blue-600/20 active:scale-[0.99] transition-all"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin mr-2 size-3.5" />
                  ) : (
                    <Save className="mr-2 size-3.5" />
                  )}
                  Save Profile Configuration
                </Button>

                {/* Accessible Legal Documents Link */}
                <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <FileText className="size-3.5 text-blue-500" />
                    <span>View Terms of Service & Privacy Policy</span>
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Accessible Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Terms of Service & Privacy Policy
              </h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <section>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  1. Platform Purpose & Campus Exclusivity
                </h4>
                <p>
                  Knoxite is a campus-exclusive peer-to-peer knowledge and skill exchange platform.
                  Its purpose is to connect student mentors and apprentices for collaborative,
                  academic, and skill-building pursuits.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  2. User Conduct & Safe Exchanges
                </h4>
                <p>
                  All members must treat each other with respect. Harassment, dishonest skill
                  representation, hate speech, unauthorized commercial solicitations, and academic
                  integrity breaches are strictly prohibited.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  3. Privacy & Data Handling
                </h4>
                <p>
                  We collect your registered name, email address, and declared skills to facilitate
                  matching, community forum participation, and the leaderboard. Your information is
                  never sold or shared with outside commercial entities.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  4. Account Suspension
                </h4>
                <p>
                  Platform administrators reserve the right to review flagged accounts and suspend
                  or terminate access for violations of these community guidelines.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs px-4 py-2 font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Website Version */}
      <div className="fixed bottom-3 right-4 z-40 pointer-events-none select-none text-[11px] font-mono tracking-wider text-slate-400 dark:text-slate-500"> 
        Knoxite v1.0 
      </div> 
    </div>
  );
}