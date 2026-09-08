"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"PASSENGER" | "DRIVER">("PASSENGER");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY">("PREFER_NOT_TO_SAY");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactEmail, setEmergencyContactEmail] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (emergencyContactEmail.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emergencyContactEmail.trim())) {
        setError("Please enter a valid emergency contact email address.");
        return;
      }
    }

    if (emergencyContactPhone.trim() !== "") {
      const phoneRegex = /^[0-9+\s\-()]{7,20}$/;
      if (!phoneRegex.test(emergencyContactPhone.trim())) {
        setError("Please enter a valid emergency contact phone number.");
        return;
      }
    }

    setIsLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        userType,
        gender,
        emergencyContactName,
        emergencyContactEmail,
        emergencyContactPhone
      }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center items-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to register for Tpool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-500 font-medium text-center bg-red-50 dark:bg-red-950/40 p-2.5 rounded-md border border-red-200 dark:border-red-900">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">I want to use TPool as *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label 
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    userType === "PASSENGER"
                      ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                      : "bg-background border-input hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <input
                      type="radio"
                      name="userRole"
                      value="PASSENGER"
                      checked={userType === "PASSENGER"}
                      onChange={() => setUserType("PASSENGER")}
                      className="accent-primary"
                    />
                    <span>Passenger / Student</span>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 pl-5 list-disc">
                    <li>Search for available rides</li>
                    <li>Request &amp; book a seat</li>
                    <li>Pool rides with commuters</li>
                    <li>Manage your bookings</li>
                  </ul>
                </label>

                <label 
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    userType === "DRIVER"
                      ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                      : "bg-background border-input hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <input
                      type="radio"
                      name="userRole"
                      value="DRIVER"
                      checked={userType === "DRIVER"}
                      onChange={() => setUserType("DRIVER")}
                      className="accent-primary"
                    />
                    <span>Driver</span>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 pl-5 list-disc">
                    <li>Publish your rides</li>
                    <li>Manage your published routes</li>
                    <li>Manage booking requests</li>
                    <li>Set seat availability</li>
                  </ul>
                </label>
              </div>
            </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY")}
                  className="w-full h-10 px-3 text-sm rounded-md border bg-background"
                >
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@college.edu" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {userType === "PASSENGER" && (
              <div className="pt-3 border-t space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    🛡️ Safety &amp; Emergency Contact
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your emergency contact will be used for safety notifications and emergency assistance during rides. It is never displayed publicly to other passengers or drivers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName" className="text-xs font-medium">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    type="text"
                    placeholder="Parent / Guardian / Friend Name"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactEmail" className="text-xs font-medium">Emergency Contact Email</Label>
                    <Input
                      id="emergencyContactEmail"
                      type="email"
                      placeholder="contact@example.com"
                      value={emergencyContactEmail}
                      onChange={(e) => setEmergencyContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone" className="text-xs font-medium">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      placeholder="+1 555-0199"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full pt-2 mt-4" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
