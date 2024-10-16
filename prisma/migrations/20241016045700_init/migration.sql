/*
  Warnings:

  - You are about to drop the column `quoteAWon` on the `Match` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstQuoteMessageId" TEXT NOT NULL,
    "secondQuoteMessageId" TEXT NOT NULL,
    "winnerMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Match_firstQuoteMessageId_fkey" FOREIGN KEY ("firstQuoteMessageId") REFERENCES "Quote" ("messageId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_secondQuoteMessageId_fkey" FOREIGN KEY ("secondQuoteMessageId") REFERENCES "Quote" ("messageId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_winnerMessageId_fkey" FOREIGN KEY ("winnerMessageId") REFERENCES "Quote" ("messageId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("completedAt", "createdAt", "firstQuoteMessageId", "id", "secondQuoteMessageId") SELECT "completedAt", "createdAt", "firstQuoteMessageId", "id", "secondQuoteMessageId" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
