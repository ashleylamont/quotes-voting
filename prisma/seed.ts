import {PrismaClient} from "@prisma/client";
import {rating} from "openskill";

const prisma = new PrismaClient();

async function seed() {
  const data: {
    quotes: { messageId: string; message: string; quotee: string; timestamp: string; }[]
  } = await fetch("http://localhost:8080/quotes").then((res) => res.json());

  for (const quote of data.quotes) {
    await prisma.quote.upsert({
      where: { messageId: quote.messageId },
      update: {
        message: quote.message,
        quotee: quote.quotee,
        timestamp: new Date(quote.timestamp),
      },
      create: {
        messageId: quote.messageId,
        message: quote.message,
        quotee: quote.quotee,
        timestamp: new Date(quote.timestamp),
        ...rating(),
      },
    })
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
