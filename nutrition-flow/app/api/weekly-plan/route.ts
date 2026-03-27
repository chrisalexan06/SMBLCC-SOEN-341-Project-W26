import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET: Fetch weekly plan and water logs for a user and week
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const weekStartDate = searchParams.get("weekStartDate");
    
    if (!weekStartDate) {
      return NextResponse.json({ error: "Missing weekStartDate" }, { status: 400 });
    }

    // 1. Fetch the meal plan
    const plan = await prisma.weeklyPlan.findFirst({
      where: { userId, weekStartDate: new Date(weekStartDate) },
      include: {
        entries: {
          include: { recipe: true }
        }
      }
    });

    // 2. Fetch the water logs for this 7-day window
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const waterLogs = await prisma.waterLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString().split('T')[0],
          lte: endDate.toISOString().split('T')[0],
        }
      }
    });

    // Combine them into one response
    return NextResponse.json(plan ? { ...plan, waterLogs } : { entries: [], waterLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create or update weekly plan and water logs
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();
    const { weekStartDate, entries, waterLevels } = data;
    
    if (!weekStartDate || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Missing weekStartDate or entries" }, { status: 400 });
    }

    // 1. Upsert the weekly planning entry for the user and week
    const plan = await prisma.weeklyPlan.upsert({
      where: { userId_weekStartDate: { userId, weekStartDate: new Date(weekStartDate) } },
      update: {},
      create: { userId, weekStartDate: new Date(weekStartDate) }
    });

    // 2. Remove existing meal entries for this plan and add new ones
    await prisma.weeklyPlanEntry.deleteMany({ where: { weeklyPlanId: plan.id } });
    
    const createdEntries = await prisma.weeklyPlanEntry.createMany({
      data: entries.map((e: any) => ({
        weeklyPlanId: plan.id,
        dayOfWeek: e.dayOfWeek,
        mealType: e.mealType,
        recipeId: e.recipeId
      }))
    });

    // 3. Upsert the water logs
    if (waterLevels) {
      for (const [dateKey, amount] of Object.entries(waterLevels)) {
        await prisma.waterLog.upsert({
          where: { userId_date: { userId, date: dateKey } },
          update: { amount: amount as number },
          create: { userId, date: dateKey, amount: amount as number }
        });
      }
    }

    return NextResponse.json({ planId: plan.id, entries: createdEntries, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}