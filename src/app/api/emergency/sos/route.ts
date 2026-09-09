import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmergencyEmail, sendEmergencySms } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        emergencyContactName: true,
        emergencyContactEmail: true,
        emergencyContactPhone: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (dbUser.userType !== "PASSENGER" && dbUser.userType !== "BOTH") {
      return NextResponse.json(
        { message: "Forbidden: Drivers cannot trigger passenger emergency SOS" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rideId, latitude, longitude } = body;

    if (!rideId) {
      return NextResponse.json({ message: "Ride ID is required" }, { status: 400 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: { select: { name: true, email: true } },
        bookings: {
          where: {
            userId: dbUser.id,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // Verify ride is ACTIVE / IN_PROGRESS
    if (ride.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "SOS can only be activated when a ride is currently ACTIVE / in progress." },
        { status: 400 }
      );
    }

    // Verify passenger has an active/confirmed booking for this ride
    if (!ride.bookings || ride.bookings.length === 0) {
      return NextResponse.json(
        { message: "Forbidden: You do not have an active booking for this ride." },
        { status: 403 }
      );
    }

    const booking = ride.bookings[0];

    let parsedLat = typeof latitude === "number" && !isNaN(latitude) && latitude >= -90 && latitude <= 90 ? latitude : null;
    let parsedLon = typeof longitude === "number" && !isNaN(longitude) && longitude >= -180 && longitude <= 180 ? longitude : null;

    // Fall back to active watchPosition() coordinates stored on active ride if payload coordinates are null
    if ((parsedLat === null || parsedLon === null) && ride.isLiveSharing && ride.currentLat !== null && ride.currentLon !== null) {
      parsedLat = ride.currentLat;
      parsedLon = ride.currentLon;
    }

    console.log(`[BACKEND RECEIVED GPS] latitude = ${parsedLat}, longitude = ${parsedLon}`);

    // Create EmergencyAlert record
    const emergencyAlert = await prisma.emergencyAlert.create({
      data: {
        userId: dbUser.id,
        rideId: ride.id,
        bookingId: booking.id,
        status: "ACTIVE",
        latitude: parsedLat,
        longitude: parsedLon,
      },
    });

    // Attempt emergency email notification
    const emailResult = await sendEmergencyEmail({
      passengerName: dbUser.name,
      passengerEmail: dbUser.email,
      emergencyContactEmail: dbUser.emergencyContactEmail,
      emergencyContactName: dbUser.emergencyContactName,
      emergencyContactPhone: dbUser.emergencyContactPhone,
      rideId: ride.id,
      origin: ride.origin,
      destination: ride.destination,
      driverName: ride.driver.name,
      departure: ride.departure,
      alertCreatedAt: emergencyAlert.createdAt,
      latitude: emergencyAlert.latitude,
      longitude: emergencyAlert.longitude,
    });

    // Attempt emergency SMS notification structure
    await sendEmergencySms({
      passengerName: dbUser.name,
      passengerEmail: dbUser.email,
      emergencyContactEmail: dbUser.emergencyContactEmail,
      emergencyContactName: dbUser.emergencyContactName,
      emergencyContactPhone: dbUser.emergencyContactPhone,
      rideId: ride.id,
      origin: ride.origin,
      destination: ride.destination,
      driverName: ride.driver.name,
      departure: ride.departure,
      alertCreatedAt: emergencyAlert.createdAt,
      latitude: emergencyAlert.latitude,
      longitude: emergencyAlert.longitude,
    });

    const contactNotified = emailResult.success;
    const notificationError = emailResult.error || null;
    const locationUnavailable = (parsedLat == null || parsedLon == null);

    return NextResponse.json(
      {
        success: true,
        alertCreated: true,
        contactNotified,
        notificationError,
        locationUnavailable,
        alertId: emergencyAlert.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to trigger emergency SOS:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
