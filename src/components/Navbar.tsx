"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary">
              Tpool
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {session.user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/profile/verification"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Verification
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Profile
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Login
                </Link>
                <Link href="/register" className={cn(buttonVariants())}>
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
