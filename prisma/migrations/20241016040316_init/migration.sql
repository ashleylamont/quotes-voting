-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstQuoteMessageId" TEXT NOT NULL,
    "secondQuoteMessageId" TEXT NOT NULL,
    "quoteAWon" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Match_firstQuoteMessageId_fkey" FOREIGN KEY ("firstQuoteMessageId") REFERENCES "Quote" ("messageId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_secondQuoteMessageId_fkey" FOREIGN KEY ("secondQuoteMessageId") REFERENCES "Quote" ("messageId") ON DELETE RESTRICT ON UPDATE CASCADE
);
