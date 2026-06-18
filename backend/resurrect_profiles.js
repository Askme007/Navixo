import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resurrect() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const existingProfile = await prisma.profiles.findUnique({ where: { id: user.id } });
    
    if (!existingProfile) {
      console.log(`Creating missing profile for: ${user.email}`);
      await prisma.profiles.create({
        data: {
          id: user.id,
          email: user.email,
          full_name: user.name || "New User",
          onboarding_completed: false
        }
      });
    }
  }
  console.log("✅ All users now have profiles!");
  process.exit();
}

resurrect();