import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

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
      
      // Recent activity
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

    return NextResponse.json({
      stats: {
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
      },
      recentActivity: {
        recentUsers,
        recentRides,
        recentBookings,
        recentVerifications,
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
