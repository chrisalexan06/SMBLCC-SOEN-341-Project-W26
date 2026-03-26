-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('BULK');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "DietaryType" AS ENUM ('NONE', 'VEGAN', 'VEGETARIAN', 'KETO', 'HALAL', 'GLUTEN_FREE', 'KOSHER', 'PESCATARIAN');

-- CreateEnum
CREATE TYPE "Allergy" AS ENUM ('DAIRY', 'EGGS', 'PEANUTS', 'TREE_NUTS', 'SHELLFISH', 'GLUTEN', 'SOY', 'OTHER', 'MILK', 'FISH', 'WHEAT', 'SESAME');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('G', 'ML', 'L', 'OZ', 'CUP', 'TBSP', 'TSP', 'COUNT');

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

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "prepTimeMinutes" INTEGER NOT NULL,
    "prepSteps" TEXT[],
    "difficulty" "Difficulty" NOT NULL,
    "estimatedCalories" INTEGER,
    "estimatedCost" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dietaryTags" "DietaryType"[] DEFAULT ARRAY[]::"DietaryType"[],

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlanEntry" (
    "id" TEXT NOT NULL,
    "weeklyPlanId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "mealType" "MealType" NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyPlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlan" ADD CONSTRAINT "WeeklyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlanEntry" ADD CONSTRAINT "WeeklyPlanEntry_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "WeeklyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlanEntry" ADD CONSTRAINT "WeeklyPlanEntry_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
