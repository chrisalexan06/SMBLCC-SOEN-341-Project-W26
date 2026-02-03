import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    //we first check for authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // we receive the data
    const body = await req.json();

    //we need to convert the data
    //so we use parse functions to convert strings to numbers where necessary
    const ageInt = parseInt(body.age);
    const weightFloat = parseFloat(body.currentWeight);
    const heightFloat = parseFloat(body.height);

    //in case clerk doesnrt have a name, to follow our schema rules and to prevent db from breaking
    const firstName = user.firstName || "New";
    const lastName = user.lastName || "User";
    const email = user.emailAddresses[0]?.emailAddress || "no-email@example.com";

    //to avoid mandatory field issues, if a user excists we update them, if not we just create one
    const savedUser = await prisma.user.upsert({
      where: { 
        id: user.id 
      },
      //for a new user
      create: {
        id: user.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        age: ageInt,                  // this field is mandatory
        currentWeight: weightFloat,   // this field is mandatory
        height: heightFloat,          // this field is mandatory
        activityLevel: body.activityLevel,
        goal: body.goal,
        dietaryType: body.dietaryType,
        allergies: body.allergies,
      },
      // if we alrdy had an existing user, then we can just update the fields
      update: {
        age: ageInt,
        currentWeight: weightFloat,
        height: heightFloat,
        activityLevel: body.activityLevel,
        goal: body.goal,
        dietaryType: body.dietaryType,
        allergies: body.allergies,
      }
    });

    //DONE

    return NextResponse.json({ success: true, user: savedUser });

  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
  }
}