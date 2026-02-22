import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [
    { username: "alice", displayName: "Alice" },
    { username: "bob", displayName: "Bob" },
    { username: "charlie", displayName: "Charlie" },
    { username: "diana", displayName: "Diana" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        displayName: user.displayName,
        passwordHash,
      },
    });
  }

  console.log("Seeded 4 users: alice, bob, charlie, diana (password: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
