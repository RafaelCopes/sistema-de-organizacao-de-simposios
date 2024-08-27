/*
  Warnings:

  - You are about to drop the `_EventToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizerId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_EventToUser_B_index";

-- DropIndex
DROP INDEX "_EventToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EventToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ParticipantSymposium" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "symposiumId" TEXT NOT NULL,
    CONSTRAINT "ParticipantSymposium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParticipantSymposium_symposiumId_fkey" FOREIGN KEY ("symposiumId") REFERENCES "Symposium" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParticipantEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "ParticipantEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParticipantEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "symposiumId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    CONSTRAINT "Event_symposiumId_fkey" FOREIGN KEY ("symposiumId") REFERENCES "Symposium" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("capacity", "date", "description", "endTime", "id", "level", "name", "startTime", "symposiumId") SELECT "capacity", "date", "description", "endTime", "id", "level", "name", "startTime", "symposiumId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantSymposium_userId_symposiumId_key" ON "ParticipantSymposium"("userId", "symposiumId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantEvent_userId_eventId_key" ON "ParticipantEvent"("userId", "eventId");
