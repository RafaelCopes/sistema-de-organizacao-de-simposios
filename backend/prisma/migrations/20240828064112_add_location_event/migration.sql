/*
  Warnings:

  - Added the required column `location` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "symposiumId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    CONSTRAINT "Event_symposiumId_fkey" FOREIGN KEY ("symposiumId") REFERENCES "Symposium" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("capacity", "date", "description", "endTime", "id", "level", "name", "organizerId", "startTime", "symposiumId") SELECT "capacity", "date", "description", "endTime", "id", "level", "name", "organizerId", "startTime", "symposiumId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
