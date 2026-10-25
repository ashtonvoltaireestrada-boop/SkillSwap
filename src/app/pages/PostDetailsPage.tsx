import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  MessageCircle,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function PostDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    fetchPostDetails();
  }, [id]);

  const getCurrentUser = () => {
    try {
      const stored = localStorage.getItem("knoxite_user") || localStorage.getItem("user");
      if (stored) return JSON.parse(stored);

      const token = localStorage.getItem("knoxite_token");
      if (token) {
        return JSON.parse(atob(token.split(".")[1]));
      }
    } catch (e) {
      console.error("Failed to parse user session:", e);
    }
    return null;
  };

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/forum/posts/${id}`, {
        headers: { "bypass-tunnel-reminder": "true" },
      });
      if (response.ok) {
        setPost(await response.json());
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("knoxite_token");
      const response = await fetch(`${API_BASE_URL}/forum/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchPostDetails();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this discussion thread? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("knoxite_token");
      const response = await fetch(`${API_BASE_URL}/forum/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate("/community-forum");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("An unexpected error occurred while deleting the post.");
    } finally {
      setIsDeleting(false);
    }
  };


  // Check if current authenticated user is the author
  const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub;
  const currentUserName = currentUser?.name || currentUser?.username;

  const isAuthor =
    Boolean(currentUser) &&
    Boolean(post?.author) &&
    (
      currentUserId === post.author.id ||
      currentUserId === post.authorId ||
      currentUserName?.toLowerCase() === post.author.name?.toLowerCase()
    );
    
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 size-10 mb-4" />
        <p className="text-slate-900 dark:text-slate-200 font-bold text-xs tracking-widest uppercase">
          Loading Thread...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950 space-y-3">
        <p className="text-slate-900 dark:text-white font-black text-xl">
          Post not found.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/community-forum")}
          className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Return to Forum
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F2FA] via-[#E5F2FA] via-70% to-[#F8FAFC] dark:bg-none dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-200 pb-20">
      {/* SUBTLE ARCHITECTURAL GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* 1. FLOATING GLASS HEADER */}
      <div className="sticky top-4 z-30 px-4 sm:px-6">
        <header className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/community-forum")}
              className="size-9 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 transition-colors shrink-0"
              title="Return to Community Forum"
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
                  Thread Details
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* 2. MAIN THREAD CONTENT */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 space-y-6 relative z-10">
        {/* Main Post (Original Poster) */}
        <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 shadow-xs border-t-4 border-t-blue-600 space-y-6">
          <CardContent className="p-0 space-y-5">
            {/* Author Row + Delete Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar className="size-12 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                  <AvatarImage
                    src={
                      post.author.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`
                    }
                  />
                  <AvatarFallback className="bg-blue-600 text-white font-black text-xs rounded-xl">
                    {post.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {post.author.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="size-3" />
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button (Owner Only) */}
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting}
                  onClick={handleDeletePost}
                  className="size-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors shrink-0"
                  title="Delete Thread"
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin text-rose-600" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {post.title}
              </h1>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {post.content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 text-xs ml-2">
            <MessageCircle className="size-4 text-blue-600 dark:text-blue-400" />
            {post.comments?.length || 0} Replies
          </h3>

          {/* Comment Input */}
          <Card className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <CardContent className="p-4 flex gap-3 items-end">
              <Textarea
                placeholder="Drop a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white text-sm min-h-[60px] rounded-2xl focus-visible:ring-blue-600"
              />
              <Button
                onClick={handleAddComment}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-5 shadow-sm shadow-blue-600/20 shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Comment List */}
          <div className="space-y-3">
            {post.comments?.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No replies yet. Start the discussion!
                </p>
              </div>
            ) : (
              post.comments?.map((comment: any) => (
                <Card
                  key={comment.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs"
                >
                  <CardContent className="p-0 flex gap-3.5">
                    <Avatar className="size-9 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 mt-0.5">
                      <AvatarImage
                        src={
                          comment.author?.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name}`
                        }
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-bold rounded-xl">
                        {comment.author?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {comment.author?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}