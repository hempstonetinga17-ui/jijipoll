const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const agentId = "test"; // Just need to see if queries throw due to missing fields
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Testing Audio count");
    await prisma.audioSubmission.count({
      where: { agentId, createdAt: { gte: startOfDay, lte: endOfDay } },
    });

    console.log("Testing Data findMany");
    await prisma.dataSubmission.findMany({
        where: { agentId },
        select: { status: true, grade: true }
    });
    
    console.log("Testing Audio findMany");
    await prisma.audioSubmission.findMany({
        where: { agentId },
        select: { status: true, grade: true }
    });

    console.log("Testing Video findMany");
    await prisma.videoSubmission.findMany({
        where: { agentId },
        select: { status: true, grade: true }
    });

    console.log("Testing Eval findMany");
    await prisma.evalSubmission.findMany({
        where: { agentId },
        select: { status: true } 
    });

    console.log("All queries parsed successfully by Prisma client!");
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
