import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.userType !== "DRIVER" && user.userType !== "BOTH") {
      return NextResponse.json({ message: "Forbidden: Only drivers can delete rides" }, { status: 403 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: params.id }
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    if (ride.driverId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete all bookings for this ride first
      await tx.booking.deleteMany({
        where: { rideId: ride.id }
      });
      // Delete the ride
      await tx.ride.delete({
        where: { id: ride.id }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Failed to delete ride:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
