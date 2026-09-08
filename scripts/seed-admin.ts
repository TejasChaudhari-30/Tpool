import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const targetEmail = process.argv[2] || "admin@tpool.com";
  const defaultPassword = process.argv[3] || "admin123";

  console.log(`Setting up Admin user for: ${targetEmail}...`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN", status: "ACTIVE" },
    });
    console.log(`Successfully promoted existing user ${targetEmail} to ADMIN.`);
  } else {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: targetEmail,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`Created new Admin account for ${targetEmail} with password: ${defaultPassword}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
