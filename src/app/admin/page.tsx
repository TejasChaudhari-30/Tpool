import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Car, 
  UserCheck, 
  ShieldCheck, 
  MapPin, 
  BookmarkCheck, 
  AlertTriangle, 
  UserX,
  CheckCircle2,
  Clock
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalDrivers,
    totalPassengers,
    totalRides,
    totalBookings,
    activeUsers,
    suspendedUsers,
    pendingVerifications,
    verifiedStudents,
    verifiedDrivers,
    pendingReports,
    recentUsers,
    recentRides,
    recentBookings,
    recentVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { rides: { some: {} } } }),
    prisma.user.count({ where: { bookings: { some: {} } } }),
    prisma.ride.count(),
    prisma.booking.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { studentVerificationStatus: "APPROVED" } }),
    prisma.user.count({ where: { driverVerificationStatus: "APPROVED" } }),
    prisma.report.count({ where: { status: "PENDING" } }),

    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.ride.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { driver: { select: { name: true } } },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        ride: { select: { origin: true, destination: true } },
      },
    }),
    prisma.verification.findMany({
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const STAT_CARDS = [
    { title: "Total Users", value: totalUsers, icon: Users, href: "/admin/users", sub: `${activeUsers} active` },
    { title: "Total Drivers", value: totalDrivers, icon: Car, href: "/admin/drivers", sub: `${verifiedDrivers} verified` },
    { title: "Total Passengers", value: totalPassengers, icon: UserCheck, href: "/admin/passengers", sub: `${verifiedStudents} verified` },
    { title: "Total Rides", value: totalRides, icon: MapPin, href: "/admin/rides", sub: "Published routes" },
    { title: "Total Bookings", value: totalBookings, icon: BookmarkCheck, href: "/admin/bookings", sub: "Reservations" },
    { title: "Pending Verifications", value: pendingVerifications, icon: Clock, href: "/admin/verification?status=PENDING", highlight: pendingVerifications > 0 },
    { title: "Verified Students", value: verifiedStudents, icon: CheckCircle2, href: "/admin/verification?documentType=STUDENT_ID", sub: "Student ID approved" },
    { title: "Verified Drivers", value: verifiedDrivers, icon: ShieldCheck, href: "/admin/verification?documentType=DRIVING_LICENCE", sub: "License approved" },
    { title: "Suspended Users", value: suspendedUsers, icon: UserX, href: "/admin/users?status=SUSPENDED", sub: "Blocked accounts" },
    { title: "Pending Reports", value: pendingReports, icon: AlertTriangle, href: "/admin/reports", highlight: pendingReports > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time platform metrics and activity monitoring.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="block group">
              <Card className={`transition-all hover:shadow-md ${card.highlight ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.highlight ? 'text-amber-500' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  {card.sub && <p className="text-[11px] text-muted-foreground mt-1">{card.sub}</p>}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Verifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Verification Submissions</CardTitle>
              <CardDescription>Documents requiring admin review</CardDescription>
            </div>
            <Link href="/admin/verification" className="text-xs font-semibold text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent>
            {recentVerifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No verifications submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {recentVerifications.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                    <div>
                      <span className="font-medium block">{v.user.name}</span>
                      <span className="text-xs text-muted-foreground">{v.documentType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={v.status === "APPROVED" ? "default" : v.status === "PENDING" ? "outline" : "secondary"}>
                        {v.status}
                      </Badge>
                      <Link href={`/admin/verification/${v.id}`} className="text-xs text-primary font-medium hover:underline">
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">New Users</CardTitle>
              <CardDescription>Recently registered accounts</CardDescription>
            </div>
            <Link href="/admin/users" className="text-xs font-semibold text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                  <div>
                    <span className="font-medium block">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "ADMIN" ? "default" : "outline"} className="text-[10px]">
                      {u.role}
                    </Badge>
                    <Link href={`/admin/users/${u.id}`} className="text-xs text-primary font-medium hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Rides */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Rides</CardTitle>
              <CardDescription>Newly published ride offers</CardDescription>
            </div>
            <Link href="/admin/rides" className="text-xs font-semibold text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRides.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                  <div>
                    <span className="font-medium block">{r.origin} → {r.destination}</span>
                    <span className="text-xs text-muted-foreground">Driver: {r.driver.name}</span>
                  </div>
                  <Link href={`/admin/rides/${r.id}`} className="text-xs text-primary font-medium hover:underline">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <CardDescription>Passenger seat requests</CardDescription>
            </div>
            <Link href="/admin/bookings" className="text-xs font-semibold text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                  <div>
                    <span className="font-medium block">{b.user.name}</span>
                    <span className="text-xs text-muted-foreground">{b.ride.origin} → {b.ride.destination}</span>
                  </div>
                  <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "PENDING" ? "outline" : "secondary"}>
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
