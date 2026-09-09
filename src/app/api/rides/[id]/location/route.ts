import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        driverId: true,
        status: true,
        currentLat: true,
        currentLon: true,
        isLiveSharing: true,
        locationUpdatedAt: true,
        bookings: {
          select: { userId: true, status: true },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    const isDriver = session.user.id === ride.driverId;
    const isPassenger = ride.bookings.some(
      (b) => b.userId === session.user.id && (b.status === "PENDING" || b.status === "CONFIRMED")
    );

    if (!isDriver && !isPassenger) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      isLiveSharing: ride.isLiveSharing && ride.status === "ACTIVE",
      currentLat: ride.isLiveSharing && ride.status === "ACTIVE" ? ride.currentLat : null,
      currentLon: ride.isLiveSharing && ride.status === "ACTIVE" ? ride.currentLon : null,
      locationUpdatedAt: ride.isLiveSharing && ride.status === "ACTIVE" ? ride.locationUpdatedAt : null,
    });
  } catch (error) {
    console.error("Failed to fetch live location:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        driverId: true,
        status: true,
        bookings: { select: { userId: true, status: true } },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    const isDriver = session.user.id === ride.driverId;
    const isPassenger = ride.bookings.some(
      (b) => b.userId === session.user.id && (b.status === "PENDING" || b.status === "CONFIRMED")
    );

    if (!isDriver && !isPassenger) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (ride.status !== "ACTIVE") {
      return NextResponse.json({ message: "Live location sharing is only allowed during active rides" }, { status: 400 });
    }

    const body = await req.json();
    const { latitude, longitude, isSharing } = body;

    if (isSharing === false) {
      const updated = await prisma.ride.update({
        where: { id: params.id },
        data: {
          isLiveSharing: false,
          currentLat: null,
          currentLon: null,
          locationUpdatedAt: null,
        },
      });
      return NextResponse.json({ success: true, isLiveSharing: updated.isLiveSharing });
    }

    // Validate coordinates
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return NextResponse.json({ message: "Invalid latitude or longitude coordinates" }, { status: 400 });
    }

    const updated = await prisma.ride.update({
      where: { id: params.id },
      data: {
        currentLat: latNum,
        currentLon: lonNum,
        isLiveSharing: true,
        locationUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      isLiveSharing: updated.isLiveSharing,
      currentLat: updated.currentLat,
      currentLon: updated.currentLon,
      locationUpdatedAt: updated.locationUpdatedAt,
    });
  } catch (error) {
    console.error("Failed to update live location:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
