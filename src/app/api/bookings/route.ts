import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.userType !== "PASSENGER" && user.userType !== "BOTH") {
      return NextResponse.json({ message: "Forbidden: Drivers cannot book seats as passengers" }, { status: 403 });
    }

    const userId = user.id;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, gender: true, userType: true }
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { rideId, fare, preferredPassengerGender } = body;

    if (!rideId) {
      return NextResponse.json({ message: "Ride ID is required" }, { status: 400 });
    }

    const requestedGenderPref = (preferredPassengerGender === "FEMALE") ? "FEMALE" : "ANY";

    // Enforce that ONLY female passengers can select FEMALE preference
    if (requestedGenderPref === "FEMALE" && dbUser.gender !== "FEMALE") {
      return NextResponse.json(
        { message: "Female co-passenger preference is only available to female passengers." },
        { status: 403 }
      );
    }

    const validGenderPref = requestedGenderPref;

    // 1. Fetch the ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bookings: true }
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    // 2. Validate rules
    if (ride.driverId === userId) {
      return NextResponse.json({ message: "You cannot book your own ride" }, { status: 400 });
    }

    if (ride.seats < 1) {
      return NextResponse.json({ message: "No seats available" }, { status: 400 });
    }

    const hasBooked = ride.bookings.some(b => b.userId === userId);
    if (hasBooked) {
      return NextResponse.json({ message: "You have already booked this ride" }, { status: 400 });
    }

    // 3. Check female co-passenger preference enforcement on active bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        rideId,
        status: { in: ["PENDING", "CONFIRMED"] }
      },
      include: {
        user: { select: { gender: true } }
      }
    });

    // Scenario A/B: If active female preference exists on ride, non-female users are rejected
    const activeFemalePref = activeBookings.some(b => b.preferredPassengerGender === "FEMALE");
    if (activeFemalePref && dbUser.gender !== "FEMALE") {
      return NextResponse.json(
        { message: "This ride currently has a female co-passenger preference and is restricted to female passengers." },
        { status: 400 }
      );
    }

    // Scenario D: If female passenger selects FEMALE preference on ride with non-female active passenger
    if (validGenderPref === "FEMALE") {
      const hasNonFemalePassenger = activeBookings.some(b => b.user.gender !== "FEMALE");
      if (hasNonFemalePassenger) {
        return NextResponse.json(
          { message: "This ride already contains a passenger who does not match your selected co-passenger preference." },
          { status: 400 }
        );
      }
    }

    // 3. Transaction to book and decrement seats
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking as PENDING for the driver to review
      const newBooking = await tx.booking.create({
        data: {
          rideId,
          userId,
          seats: 1,
          fare: fare ? parseFloat(fare) : 0,
          status: "PENDING",
          preferredPassengerGender: validGenderPref,
        }
      });

      // Decrement seats
      await tx.ride.update({
        where: { id: rideId },
        data: {
          seats: {
            decrement: 1
          }
        }
      });

      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
