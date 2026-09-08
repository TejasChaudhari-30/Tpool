"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  UserCheck, 
  ShieldCheck, 
  MapPin, 
  BookmarkCheck, 
  AlertTriangle, 
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Drivers", href: "/admin/drivers", icon: Car },
  { label: "Passengers", href: "/admin/passengers", icon: UserCheck },
  { label: "Verification", href: "/admin/verification", icon: ShieldCheck },
  { label: "Rides", href: "/admin/rides", icon: MapPin },
  { label: "Bookings", href: "/admin/bookings", icon: BookmarkCheck },
  { label: "Reports", href: "/admin/reports", icon: AlertTriangle },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div className="px-3 py-2 border-b">
          <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            TPOOL ADMIN
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Management & Verification Center</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Main App
        </Link>
      </div>
    </aside>
  );
}
