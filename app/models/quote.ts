import { rating } from "openskill";

import { prisma } from "~/db.server";
import { singleton } from "~/singleton.server";

const quoteFetchTimer = singleton("quoteFetchTimer", () => ({
  lastFetched: 0,
}));

export async function fetchQuotesIfStale(): Promise<void> {
  console.log("Checking if quotes are stale...");
  const fetchEvery = 1000 * 60 * 5; // 5 minutes
  const now = Date.now();
  const timeSinceLastFetch = now - quoteFetchTimer.lastFetched;
  console.log(`Time since last fetch: ${timeSinceLastFetch / 1000} seconds`);
  if (timeSinceLastFetch > fetchEvery) {
    console.log("Fetching quotes...");
    // Fetch the quotes
    quoteFetchTimer.lastFetched = now;

    // Fetch the quotes
    const data: {
      quotes: {
        messageId: string;
        message: string;
        quotee: string;
        timestamp: string;
      }[];
    } = await fetch("http://localhost:8080/quotes").then((res) => res.json());

    // Upsert the quotes
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
      });
    }
  }
}
