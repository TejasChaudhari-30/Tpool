import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prisma, Role, UserStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; status?: string };
}) {
  const search = searchParams.search || "";
  const role = searchParams.role || "";
  const status = searchParams.status || "";

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role) where.role = role as Role;
  if (status) where.status = status as UserStatus;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { rides: true, bookings: true, verifications: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user roles, account statuses, and verification records.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters &amp; Search</CardTitle>
          <form method="GET" className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name or email..."
              className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
            />
            <select
              name="role"
              defaultValue={role}
              className="px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Filter
            </button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Student Status</th>
                  <th className="p-3">Driver Status</th>
                  <th className="p-3">Activity</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No users found matching query filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={u.role === "ADMIN" ? "default" : "outline"} className="text-[10px]">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={u.status === "ACTIVE" ? "default" : "destructive"} className="text-[10px]">
                          {u.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-medium">{u.studentVerificationStatus}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-medium">{u.driverVerificationStatus}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {u._count.rides} rides • {u._count.bookings} bookings
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/users/${u.id}`} className="text-xs font-semibold text-primary hover:underline">
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
