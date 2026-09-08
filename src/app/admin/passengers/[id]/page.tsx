import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPassengerDetailPage({ params }: { params: { id: string } }) {
  const passenger = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        include: { ride: { include: { driver: { select: { name: true } } } } },
      },
      verifications: {
        where: { documentType: "STUDENT_ID" },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!passenger) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/passengers" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Passengers
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{passenger.name}</h1>
            <p className="text-muted-foreground mt-1">{passenger.email}</p>
          </div>
          <Badge variant={passenger.studentVerificationStatus === "APPROVED" ? "default" : "outline"} className="text-sm py-1 px-3">
            {passenger.studentVerificationStatus === "APPROVED" ? "Verified Student" : passenger.studentVerificationStatus}
          </Badge>
        </div>
      </div>

      {/* Student Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student ID Verification Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {passenger.verifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Student ID uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {passenger.verifications.map((v) => (
                <div key={v.id} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                  <div>
                    <span className="font-semibold block">{v.documentType.replace("_", " ")}</span>
                    <span className="text-xs text-muted-foreground">Submitted: {new Date(v.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={v.status === "APPROVED" ? "default" : v.status === "PENDING" ? "outline" : "secondary"}>
                      {v.status}
                    </Badge>
                    <Link href={`/admin/verification/${v.id}`} className="text-xs text-primary font-semibold hover:underline">
                      Review Document →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passenger Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booked Rides ({passenger.bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {passenger.bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings made yet.</p>
          ) : (
            <div className="space-y-3">
              {passenger.bookings.map((b) => (
                <div key={b.id} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                  <div>
                    <span className="font-semibold block">{b.ride.origin} → {b.ride.destination}</span>
                    <span className="text-xs text-muted-foreground">
                      Driver: {b.ride.driver.name} • Fare: ₹{b.fare.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "PENDING" ? "outline" : "secondary"}>
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
