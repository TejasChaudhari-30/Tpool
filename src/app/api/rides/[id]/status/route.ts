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
      select: { id: true, status: true },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json({ status: ride.status }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch ride status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.userType !== "DRIVER" && user.userType !== "BOTH") {
      return NextResponse.json(
        { message: "Forbidden: Only drivers can update ride status" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!["ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ message: "Invalid ride status" }, { status: 400 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
    });

    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    if (ride.driverId !== user.id) {
      return NextResponse.json(
        { message: "Forbidden: You are not the driver of this ride" },
        { status: 403 }
      );
    }

    const updatedRide = await prisma.ride.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedRide, { status: 200 });
  } catch (error) {
    console.error("Failed to update ride status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
