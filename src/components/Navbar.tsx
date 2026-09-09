"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-90 py-1">
              <Image
                src="/logo.png"
                alt="TPool"
                width={200}
                height={76}
                className="h-9 sm:h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                {session.user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                ) : (
                  <Link
                    href="/profile/verification"
                    className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 px-2 py-1.5"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="hidden xs:inline sm:inline">Verification</span>
                  </Link>
                )}
                <Link 
                  href="/dashboard" 
                  className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1.5"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1.5"
                >
                  Profile
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5"
                >
                  Login
                </Link>
                <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "text-xs sm:text-sm font-semibold")}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
