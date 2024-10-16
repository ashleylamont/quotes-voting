-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quote" (
    "messageId" TEXT NOT NULL PRIMARY KEY,
    "quotee" TEXT,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "mu" REAL NOT NULL,
    "sigma" REAL NOT NULL
);
INSERT INTO "new_Quote" ("message", "messageId", "mu", "quotee", "sigma", "timestamp") SELECT "message", "messageId", "mu", "quotee", "sigma", "timestamp" FROM "Quote";
DROP TABLE "Quote";
ALTER TABLE "new_Quote" RENAME TO "Quote";
CREATE UNIQUE INDEX "Quote_messageId_key" ON "Quote"("messageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
