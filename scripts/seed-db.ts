import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const allianceName = "The Architects";
  const existingAlliance = await prisma.alliance.findUnique({ where: { name: allianceName } });
  if (!existingAlliance) {
    await prisma.alliance.create({ data: { name: allianceName, description: "The founding members.", totalMembers: 0, totalNp: BigInt(0) } });
    console.log(`✅ Created Alliance: ${allianceName}`);
  }
  const devId = BigInt(111111); 
  const existingUser = await prisma.user.findUnique({ where: { telegramId: devId } });
  if (!existingUser) {
    await prisma.user.create({ data: { telegramId: devId, username: "dev_admin", isPremium: true, lifetimeNp: BigInt(1000000000) } });
    console.log(`✅ Created Dev User: 111111`);
  }
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
