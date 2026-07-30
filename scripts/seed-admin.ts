import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding admin account...");

  const email = "admin@jijipoll.com";
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin account already exists.");
  } else {
    const admin = await prisma.user.create({
      data: {
        email,
        name: "Jijipoll Admin",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`Created admin account: ${admin.email}`);
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
