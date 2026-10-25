import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Star, Send, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function ReputationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const swapId = searchParams.get("swapId");
  const partnerId = searchParams.get("partnerId");

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating!");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("knoxite_token");
      const res = await fetch(`${API_BASE_URL}/reputation/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ swapId, partnerId, rating, comment })
      });

      if (res.ok) {
        alert("Evaluation Submitted! Points added to peer.");
        navigate("/leaderboard"); // Redirect to see the live update
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-b-8 border-blue-600">
        <h2 className="text-3xl font-black text-blue-900 italic uppercase tracking-tighter mb-2">Final Evaluation</h2>
        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-8">Close the rotation loop</p>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <Star
              key={num}
              className={`size-10 cursor-pointer transition-all ${rating >= num ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-200"}`}
              onClick={() => setRating(num)}
            />
          ))}
        </div>

        <textarea
          className="w-full h-32 p-4 bg-blue-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 text-sm font-medium mb-6"
          placeholder="How was the exchange? (Optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Button 
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase rounded-2xl shadow-lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Swap"}
        </Button>
      </div>
    </div>
  );
}