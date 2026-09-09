"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import RideChat from "@/components/RideChat";

interface RideChatModalProps {
  rideId: string;
  currentUserId: string;
  driverName?: string;
  driverId?: string;
  isDriver?: boolean;
}

export default function RideChatModal({
  rideId,
  currentUserId,
  driverName,
  driverId,
  isDriver,
}: RideChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonLabel = isDriver ? "Chat with Passengers" : "Chat with Driver";

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2 border-primary/40 text-primary hover:bg-primary/10 font-semibold text-xs sm:text-sm px-4 py-2"
      >
        <MessageSquare className="h-4 w-4 text-primary" />
        <span>💬 {buttonLabel}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-[110] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Close Chat"
            >
              <X className="h-5 w-5" />
            </button>
            <RideChat
              rideId={rideId}
              currentUserId={currentUserId}
              driverName={driverName}
              driverId={driverId}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
