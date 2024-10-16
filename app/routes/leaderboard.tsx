import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ordinal } from "openskill";

import LeaderboardEntry from "~/components/leaderboard-entry";
import { prisma } from "~/db.server";

export async function loader() {
  const quotes = await prisma.quote.findMany();
  quotes.sort((a, b) => ordinal(b) - ordinal(a));
  return json(quotes);
}

export default function Leaderboard() {
  const quotes = useLoaderData<typeof loader>().map((quote) => ({
    ...quote,
    timestamp: new Date(quote.timestamp),
  }));
  return (
    <div className="flex flex-col gap-2">
      {quotes.map((quote, index) => (
        <LeaderboardEntry
          key={quote.messageId}
          quote={quote}
          rank={index + 1}
        />
      ))}
    </div>
  );
}
