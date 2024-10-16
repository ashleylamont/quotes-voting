import { Prisma, Quote } from "@prisma/client";
import { createCookieSessionStorage, Session } from "@remix-run/node";
import { ActionFunction, json, redirect } from "@remix-run/router";
import { predictDraw, rate, rating } from "openskill";

import { prisma } from "~/db.server";

import MatchGetPayload = Prisma.MatchGetPayload;

export const sessionStore = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [process.env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});

async function getRandomPairAndDrawPrediction(): Promise<
  [Quote, Quote, number]
> {
  const quotes = await prisma.quote.findMany();
  const quoteA = quotes[Math.floor(Math.random() * quotes.length)];
  quotes.splice(quotes.indexOf(quoteA), 1);
  const quoteB = quotes[Math.floor(Math.random() * quotes.length)];

  const prediction = predictDraw([
    [
      rating({
        mu: quoteA.mu,
        sigma: quoteA.sigma,
      }),
    ],
    [
      rating({
        mu: quoteB.mu,
        sigma: quoteB.sigma,
      }),
    ],
  ]);

  return [quoteA, quoteB, prediction];
}

export async function getOrCreateMatch(request: Request): Promise<
  [
    MatchGetPayload<{
      include: { firstQuote: true; secondQuote: true };
    }>,
    Session,
  ]
> {
  const session = await sessionStore.getSession(request.headers.get("Cookie"));

  const existingMatchId = session.get("matchId");
  let existingMatch: MatchGetPayload<{
    include: { firstQuote: true; secondQuote: true };
  }> | null = null;
  if (existingMatchId) {
    existingMatch = await prisma.match.findUnique({
      where: { id: existingMatchId },
      include: { firstQuote: true, secondQuote: true },
    });
  }
  if (existingMatch && existingMatch.completedAt === null) {
    return [existingMatch, session];
  }

  const pairOptions = await Promise.all([
    getRandomPairAndDrawPrediction(),
    getRandomPairAndDrawPrediction(),
    getRandomPairAndDrawPrediction(),
    getRandomPairAndDrawPrediction(),
    getRandomPairAndDrawPrediction(),
  ]);

  let bestPair = pairOptions[0];
  for (const pair of pairOptions) {
    if (pair[2] > bestPair[2]) {
      bestPair = pair;
    }
  }

  const newMatch = await prisma.match.create({
    data: {
      firstQuoteMessageId: bestPair[0].messageId,
      secondQuoteMessageId: bestPair[1].messageId,
    },
    include: { firstQuote: true, secondQuote: true },
  });

  session.set("matchId", newMatch.id);

  return [newMatch, session];
}

export async function resolveMatch(
  request: Request,
  winner: string,
): Promise<ReturnType<ActionFunction>> {
  const [match, session] = await getOrCreateMatch(request);

  // Check if the match has already been resolved
  if (match.completedAt) {
    session.unset("matchId");
    await sessionStore.commitSession(session);
    return json(
      { error: "Match has already been resolved" },
      {
        headers: {
          "Set-Cookie": await sessionStore.commitSession(session),
        },
      },
    );
  }

  // Check if the winner is a valid quote
  if (
    winner !== match.firstQuoteMessageId &&
    winner !== match.secondQuoteMessageId
  ) {
    return json(
      { error: "Invalid match winner" },
      {
        headers: {
          "Set-Cookie": await sessionStore.commitSession(session),
        },
      },
    );
  }

  // Update the match with the winner
  await prisma.match.update({
    where: { id: match.id },
    data: {
      winnerMessageId: winner,
      completedAt: new Date(),
    },
  });
  session.unset("matchId");

  // Update the ratings
  const winningQuote = await prisma.quote.findUniqueOrThrow({
    where: { messageId: winner },
  });
  const losingQuote = await prisma.quote.findUniqueOrThrow({
    where: {
      messageId:
        winner === match.firstQuoteMessageId
          ? match.secondQuoteMessageId
          : match.firstQuoteMessageId,
    },
  });
  const [[winningRating], [losingRating]] = rate([
    [
      rating({
        mu: winningQuote.mu,
        sigma: winningQuote.sigma,
      }),
    ],
    [
      rating({
        mu: losingQuote.mu,
        sigma: losingQuote.sigma,
      }),
    ],
  ]);
  await prisma.quote.update({
    where: { messageId: winningQuote.messageId },
    data: {
      mu: winningRating.mu,
      sigma: winningRating.sigma,
    },
  });
  await prisma.quote.update({
    where: { messageId: losingQuote.messageId },
    data: {
      mu: losingRating.mu,
      sigma: losingRating.sigma,
    },
  });
  return redirect("/vote", {
    headers: {
      "Set-Cookie": await sessionStore.commitSession(session),
    },
  });
}