import { Quote } from "@prisma/client";
import ReactMarkdown from "react-markdown";

export default function QuotesEmbed({ quote }: { quote: Quote }) {
  return (
    <button
      className="flex max-w-2xl flex-1 flex-col justify-between gap-4 overflow-x-auto rounded-md border-l-4 bg-gray-700 p-4 text-left shadow-lg"
      name="winningQuote"
      type="submit"
      value={quote.messageId}
    >
      <ReactMarkdown className="text-white">{quote.message}</ReactMarkdown>
      <div className="flex items-start">
        <div>
          <p className="text-sm text-gray-300">Quote of {quote.quotee}</p>
          <p className="text-xs text-gray-500">
            {new Date(quote.timestamp).toDateString()}
          </p>
        </div>
      </div>
    </button>
  );
}
