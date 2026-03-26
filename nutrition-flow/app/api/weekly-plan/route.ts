import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET: Fetch weekly plan for a user and week
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
    const plan = await prisma.weeklyPlan.findFirst({
      where: { userId, weekStartDate: new Date(weekStartDate) },
      include: {
        entries: {
          include: { recipe: true }
        }
      }
    });
    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create or update weekly plan
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();
    const { weekStartDate, entries } = data;
    if (!weekStartDate || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Missing weekStartDate or entries" }, { status: 400 });
    }
    // Upsert the weekly plan
    const plan = await prisma.weeklyPlan.upsert({
      where: { userId_weekStartDate: { userId, weekStartDate: new Date(weekStartDate) } },
      update: {},
      create: { userId, weekStartDate: new Date(weekStartDate) }
    });
    // Remove existing entries for this plan
    await prisma.weeklyPlanEntry.deleteMany({ where: { weeklyPlanId: plan.id } });
    // Add new entries
    const createdEntries = await prisma.weeklyPlanEntry.createMany({
      data: entries.map((e: any) => ({
        weeklyPlanId: plan.id,
        dayOfWeek: e.dayOfWeek,
        mealType: e.mealType,
        recipeId: e.recipeId
      }))
    });
    return NextResponse.json({ planId: plan.id, entries: createdEntries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
