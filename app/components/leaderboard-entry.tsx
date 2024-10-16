import { Prisma } from "@prisma/client";
import ReactMarkdown from "react-markdown";

import QuoteGetPayload = Prisma.QuoteGetPayload;

export default function LeaderboardEntry({
  quote,
  rank,
}: {
  quote: QuoteGetPayload<{
    include: {
      _count: {
        select: {
          wonMatches: true;
          firstQuoteMatches: true;
          secondQuoteMatches: true;
        };
      };
    };
  }>;
  rank: number;
}) {
  return (
    <div className="flex items-start rounded-md border-l-4 bg-gray-700 p-4 shadow-lg transition-shadow duration-300 hover:shadow-xl">
      {/* Rank */}
      <div className="mr-4 flex-shrink-0">
        <span className="text-xl font-bold text-white">{rank}</span>
      </div>
      {/* Quote Content */}
      <div className="flex-1 overflow-x-auto">
        <ReactMarkdown className="text-white">{quote.message}</ReactMarkdown>
        <div className="flex items-center">
          <div>
            <p className="text-sm text-gray-300">Quote of {quote.quotee}</p>
            <p className="text-xs text-gray-500">
              {new Date(quote.timestamp).toDateString()}
            </p>
            <p className="text-xs text-gray-500">
              This quote has been picked in {quote._count.wonMatches} out of{" "}
              {quote._count.firstQuoteMatches + quote._count.secondQuoteMatches}{" "}
              matches
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
