import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

  if (!ownerEmail) {
    throw new Error('OWNER_EMAIL is required');
  }

  const owner = await prisma.user.findUnique({
    where: { email: ownerEmail },
    select: { id: true, email: true },
  });

  if (!owner) {
    throw new Error(`No user found for ${ownerEmail}`);
  }

  const result = await prisma.movie.updateMany({
    where: { userId: null },
    data: { userId: owner.id },
  });

  console.log(
    `Assigned ${result.count} unowned movies to ${owner.email} (user ${owner.id})`,
  );
}

main()
  .finally(async () => prisma.$disconnect());