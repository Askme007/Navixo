import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
  // 1. Get any user from your DB to test
  const user = await prisma.profiles.findFirst();
  
  if (!user) {
    console.log("No profiles found in the database!");
    process.exit();
  }

  console.log("Testing profile:", user.email);
  
  // 2. Check if the field exists in the data returned by Prisma
  console.log("LeetCode Username field:", user.cfUsername);
  
  process.exit();
}

verify();