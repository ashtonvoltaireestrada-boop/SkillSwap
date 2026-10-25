import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { ArrowLeft, Star, LogOut, Loader2, Save, Repeat, Camera } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("knoxite_token");
      localStorage.removeItem("knoxite_user");
      navigate("/");
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
      <div className="sticky top-4 z-30 px-4 sm:px-6">
        <header className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
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
                  Account Settings
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-8 space-y-6 relative z-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Profile Configuration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update your campus identity, avatar, and academic biography.
          </p>
        </div>

        <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="pt-8 px-6 sm:px-10 pb-8">
            {/* Identity & Avatar Section */}
            <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="relative group mb-4">
                <Avatar className="size-32 rounded-3xl border-4 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-3xl font-black rounded-3xl">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Trigger Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-md border-2 border-white dark:border-slate-900 hover:bg-blue-700 transition-colors"
                  title="Change Avatar"
                >
                  <Camera className="size-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {profile?.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">
                {profile?.email}
              </p>

              {/* Performance Stats */}
              <div className="flex justify-center gap-12 mt-6 py-3 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 w-full max-w-sm">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-widest block mb-1">
                    Peer Rating
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {profile?.rating > 0 ? profile.rating : "0.0"}
                    </span>
                  </div>
                </div>
                <div className="text-center border-l border-slate-200/80 dark:border-slate-700 pl-12">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-widest block mb-1">
                    Rotations
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <Repeat className="size-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {profile?.swapsCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Update Form */}
            <form onSubmit={handleSave} className="space-y-6 max-w-md mx-auto">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                >
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-600 h-11 font-semibold rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                >
                  Gender Identity
                </Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                >
                  Academic Biography
                </Label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your academic strengths and learning goals..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[110px] resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold text-xs shadow-md shadow-blue-600/20"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin mr-2 size-4" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  Save Profile Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}