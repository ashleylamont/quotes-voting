import { Quote } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import QuotesEmbed from "~/components/quotes-embed";
import { getOrCreateMatch, resolveMatch, sessionStore } from "~/models/match";

export async function loader({ request }: LoaderFunctionArgs) {
  const [match, session] = await getOrCreateMatch(request);
  return json(match, {
    headers: {
      "Set-Cookie": await sessionStore.commitSession(session),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const winningQuote = formData.get("winningQuote");
  if (typeof winningQuote !== "string") {
    throw new Error("Invalid winning quote");
  }
  return resolveMatch(request, winningQuote);
}

export default function Vote() {
  const match = useLoaderData<typeof loader>();
  const firstQuote: Quote = {
    ...match.firstQuote,
    timestamp: new Date(match.firstQuote.timestamp),
  };
  const secondQuote: Quote = {
    ...match.secondQuote,
    timestamp: new Date(match.secondQuote.timestamp),
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-4">
      <h1 className="text-2xl text-white">Vote for your favourite quote</h1>
      <Form
        className="container grid grid-cols-1 gap-6 lg:grid-cols-2"
        action="/vote"
        method="post"
      >
        <QuotesEmbed quote={firstQuote} />
        <QuotesEmbed quote={secondQuote} />
      </Form>
    </div>
  );
}
