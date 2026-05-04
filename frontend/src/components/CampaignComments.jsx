import React, { useState, useEffect } from "react";
import { MessageCircle, ThumbsUp, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth.js";

function CampaignComments({ campaign_id }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [likedComments, setLikedComments] = useState(new Set());
    const [user, setUser] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchComments = async () => {
        try {
            const res = await fetch(`${backendUrl}/comments/get-comments/${campaign_id}`);
            const data = await res.json();

            // Normalize backend data
            const normalized = (data.comments || []).map((c) => ({
                comment_id: c.comment_id || c.id,
                username: c.username || c.user_name,
                profile_image: c.profile_image || c.user_avatar,
                content: c.content || c.message,
                likes: c.likes ?? 0,
                created_at: c.created_at,
            }));

            setComments(normalized);
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    useEffect(() => {
        const storedUser = getUser();
        if (storedUser) {
            try {
                setUser(storedUser);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                setUser(null);
            }
        }
    }, []);

    // ✅ Fetch comments when campaign_id changes
    useEffect(() => {
        if (campaign_id) fetchComments();
    }, [campaign_id]);

    // ✅ Post new comment
    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmittingComment(true);

        try {
            await fetch(`${backendUrl}/comments/post-comment/${user?.user_id}/${campaign_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({ message: newComment }),
            });

            await fetchComments();
            setNewComment("");
        } catch (err) {
            console.error("Error posting comment:", err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleLikeComment = async (id) => {
        if (!user) return;

        try {
            const res = await fetch(`${backendUrl}/comments/toggle-like/${user.user_id}/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            console.log("Updated likes:", data.likes);

            await fetchComments();

        } catch (err) {
            console.error("Error liking comment:", err);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);
        if (diffSeconds < 60) return "Just now";
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
        return `${Math.floor(diffSeconds / 86400)} days ago`;
    };

    return (
        <>
            {user ? (
                <Card className="shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm mb-6">
                    <CardHeader className="border-b border-gray-800/50">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <MessageCircle className="h-5 w-5 text-blue-400" />
                            </div>
                            Leave a Comment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts or words of encouragement..."
                            className="min-h-[120px] mb-4 resize-none bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmitComment}
                                disabled={isSubmittingComment || !newComment.trim()}
                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send className="h-4 w-4" /> 
                                {isSubmittingComment ? "Posting..." : "Post Comment"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 border border-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm text-center space-y-4 mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Lock className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Login Required</h2>
                    <p className="text-gray-400 max-w-md">
                        You need to log in to post comments. Don't worry, it's quick and easy!
                    </p>
                    <a 
                        href="/login" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105"
                    >
                        Login Now
                    </a>
                </div>
            )}

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <Card className="shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 border border-gray-700 mb-4">
                                    <MessageCircle className="h-8 w-8 text-gray-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">No Comments Yet</h3>
                                <p className="text-gray-400">Be the first to share your thoughts!</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    comments.map((comment) => (
                        <Card 
                            key={comment.comment_id} 
                            className="shadow-2xl bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-gray-700 transition-all"
                        >
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-blue-500/20">
                                        <AvatarImage src={comment.profile_image} alt={comment.username} />
                                        <AvatarFallback className="bg-blue-500/10 text-blue-400 font-bold">
                                            {(comment.username || "?").charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-white">{comment.username}</h4>
                                            <span className="text-sm text-gray-400">
                                                {formatTimeAgo(comment.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 mb-3 leading-relaxed">{comment.content}</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => user && handleLikeComment(comment.comment_id)}
                                            className={`gap-2 hover:bg-gray-800 rounded-lg transition-all ${
                                                user && likedComments.has(comment.comment_id) 
                                                    ? "text-blue-400" 
                                                    : "text-gray-400 hover:text-blue-400"
                                            }`}
                                            disabled={!user}
                                        >
                                            <ThumbsUp
                                                className={`h-4 w-4 ${
                                                    user && likedComments.has(comment.comment_id) ? "fill-current" : ""
                                                }`}
                                            />
                                            <span className="font-semibold">{comment.likes}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
    );
}

export default CampaignComments;