-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('BULK', 'CUT', 'MAINTAIN');

-- CreateEnum
CREATE TYPE "DietaryType" AS ENUM ('NONE', 'VEGAN', 'VEGETARIAN', 'KETO', 'HALAL', 'GLUTEN_FREE', 'KOSHER', 'PESCATARIAN');

-- CreateEnum
CREATE TYPE "Allergy" AS ENUM ('NONE', 'PEANUTS', 'TREE_NUTS', 'MILK', 'EGGS', 'WHEAT', 'SOY', 'FISH', 'SHELLFISH', 'SESAME', 'GLUTEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "currentWeight" DOUBLE PRECISION NOT NULL,
    "targetWeight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION NOT NULL,
    "activityLevel" "ActivityLevel",
    "goal" "Goal",
    "dietaryType" "DietaryType"[] DEFAULT ARRAY[]::"DietaryType"[],
    "allergies" "Allergy"[] DEFAULT ARRAY[]::"Allergy"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" INTEGER,
    "carbs" INTEGER,
    "fats" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
