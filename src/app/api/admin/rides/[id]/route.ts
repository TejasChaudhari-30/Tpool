import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
      include: {
        driver: { select: { id: true, name: true, email: true, driverVerificationStatus: true } },
        bookings: { include: { user: { select: { id: true, name: true, email: true } } } },
        messages: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json(ride);
  } catch (error) {
    console.error("Failed to fetch admin ride detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.deleteMany({ where: { rideId: params.id } });
      await tx.message.deleteMany({ where: { rideId: params.id } });
      await tx.ride.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete ride:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
