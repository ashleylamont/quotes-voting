import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen flex-col bg-gray-800">
        <nav className="flex flex-row items-center justify-center gap-8 bg-gray-800 p-4 text-2xl text-white">
          <strong>CSSA Quotes</strong>
          <Link to="/leaderboard" className="hover:underline">
            Leaderboard
          </Link>
          <Link to="/vote" className="hover:underline">
            Vote
          </Link>
        </nav>
        <div className="mx-10 h-full overflow-y-auto p-4">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
