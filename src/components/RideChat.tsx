"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; id: string };
}

export default function RideChat({ rideId, currentUserId }: { rideId: string, currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/rides/${rideId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        const err = await res.json();
        setError(err.message || "Failed to load messages");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/rides/${rideId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setContent("");
      }
    } finally {
      setIsSending(false);
    }
  };

  if (error) {
    return <div className="text-destructive text-sm p-4 border rounded-md">{error}</div>;
  }

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden h-[400px] bg-card text-card-foreground">
      <div className="bg-muted px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Ride Discussion</h3>
        <p className="text-xs text-muted-foreground">Only the driver and approved passengers can see this.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">No messages yet. Say hello!</p>
        ) : (
          messages.map(msg => {
            const isMe = msg.user.id === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted-foreground mb-1 ml-1">{msg.user.name}</span>
                <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t bg-background flex gap-2">
        <Input 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="Type a message..." 
          className="flex-1"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
