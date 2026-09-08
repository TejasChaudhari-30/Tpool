import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body; // "CONFIRM", "REJECT", "CANCEL"

    if (!["CONFIRM", "REJECT", "CANCEL"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { ride: true }
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED" || booking.status === "REJECTED") {
      return NextResponse.json({ message: "Booking already cancelled/rejected" }, { status: 400 });
    }

    const isDriver = booking.ride.driverId === user.id && (user.userType === "DRIVER" || user.userType === "BOTH");
    const isPassenger = booking.userId === user.id && (user.userType === "PASSENGER" || user.userType === "BOTH");

    if (action === "CONFIRM" || action === "REJECT") {
      if (!isDriver) {
        return NextResponse.json({ message: "Only the authorized driver can confirm or reject" }, { status: 403 });
      }

      if (action === "CONFIRM") {
        const updated = await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED" }
        });
        return NextResponse.json(updated);
      }

      if (action === "REJECT") {
        const updated = await prisma.$transaction(async (tx) => {
          const b = await tx.booking.update({
            where: { id: booking.id },
            data: { status: "REJECTED" }
          });
          await tx.ride.update({
            where: { id: booking.rideId },
            data: { seats: { increment: 1 } }
          });
          return b;
        });
        return NextResponse.json(updated);
      }
    }

    if (action === "CANCEL") {
      if (!isPassenger) {
        return NextResponse.json({ message: "Only the passenger can cancel" }, { status: 403 });
      }
      
      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" }
        });
        await tx.ride.update({
          where: { id: booking.rideId },
          data: { seats: { increment: 1 } }
        });
        return b;
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: "Bad request" }, { status: 400 });

  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
