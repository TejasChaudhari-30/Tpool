import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Gender } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { 
      name, 
      email, 
      password, 
      userType, 
      gender, 
      emergencyContactName, 
      emergencyContactEmail, 
      emergencyContactPhone 
    } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    // Validate gender if provided
    const validGenders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];
    const userGender = (gender && validGenders.includes(gender)) ? gender : "PREFER_NOT_TO_SAY";

    // Validate emergency contact email if provided
    if (emergencyContactEmail && emergencyContactEmail.trim() !== "") {
      if (!emailRegex.test(emergencyContactEmail.trim())) {
        return NextResponse.json({ message: "Invalid emergency contact email format" }, { status: 400 });
      }
    }

    // Validate emergency contact phone if provided
    if (emergencyContactPhone && emergencyContactPhone.trim() !== "") {
      const phoneRegex = /^[0-9+\s\-()]{7,20}$/;
      if (!phoneRegex.test(emergencyContactPhone.trim())) {
        return NextResponse.json({ message: "Invalid emergency contact phone number" }, { status: 400 });
      }
    }

    const validUserType = userType === "DRIVER" ? "DRIVER" : "PASSENGER";

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        userType: validUserType,
        gender: userGender as Gender,
        emergencyContactName: validUserType === "PASSENGER" ? (emergencyContactName?.trim() || null) : null,
        emergencyContactEmail: validUserType === "PASSENGER" ? (emergencyContactEmail?.trim()?.toLowerCase() || null) : null,
        emergencyContactPhone: validUserType === "PASSENGER" ? (emergencyContactPhone?.trim() || null) : null,
      }
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
