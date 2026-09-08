import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDriverDetailPage({ params }: { params: { id: string } }) {
  const driver = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      rides: {
        orderBy: { departure: "desc" },
        include: { bookings: true },
      },
      verifications: {
        where: { documentType: { in: ["DRIVING_LICENCE", "VEHICLE_RC"] } },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!driver) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/drivers" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Drivers
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{driver.name}</h1>
            <p className="text-muted-foreground mt-1">{driver.email}</p>
          </div>
          <Badge variant={driver.driverVerificationStatus === "APPROVED" ? "default" : "outline"} className="text-sm py-1 px-3">
            {driver.driverVerificationStatus === "APPROVED" ? "Verified Driver" : driver.driverVerificationStatus}
          </Badge>
        </div>
      </div>

      {/* Driver Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Driver Verification Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {driver.verifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Driving Licence or Vehicle RC uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {driver.verifications.map((v) => (
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

      {/* Driver Rides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Published Rides ({driver.rides.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {driver.rides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rides published yet.</p>
          ) : (
            <div className="space-y-3">
              {driver.rides.map((r) => (
                <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                  <div>
                    <span className="font-semibold block">{r.origin} → {r.destination}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.departure).toLocaleString()} • {r.vehicleName || "Car"} ({r.seats} seats)
                    </span>
                  </div>
                  <Link href={`/admin/rides/${r.id}`} className="text-xs text-primary font-semibold hover:underline">
                    View Ride →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
