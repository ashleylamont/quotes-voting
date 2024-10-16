import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ordinal } from "openskill";

import LeaderboardEntry from "~/components/leaderboard-entry";
import { prisma } from "~/db.server";

export async function loader() {
  const quotes = await prisma.quote.findMany();
  quotes.sort((a, b) => ordinal(b) - ordinal(a));
  const voteCount = await prisma.match.count({
    where: {
      winnerMessageId: {
        not: null,
      },
    },
  });
  return json({ quotes, voteCount });
}

export default function Leaderboard() {
  const { quotes: _quotes, voteCount } = useLoaderData<typeof loader>();
  const quotes = _quotes.map((quote) => ({
    ...quote,
    timestamp: new Date(quote.timestamp),
  }));
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl text-white">
        Leaderboard (based on {voteCount} votes)
      </h1>
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
