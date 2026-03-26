/*
  Warnings:

  - A unique constraint covering the columns `[userId,weekStartDate]` on the table `WeeklyPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPlan_userId_weekStartDate_key" ON "WeeklyPlan"("userId", "weekStartDate");
