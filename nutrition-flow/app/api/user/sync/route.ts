import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

// GET function to retrieve user data for the Profile page
export async function GET() {
  try {
	// Check user authentication via Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

	// Fetch the user details from the database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

	// Return the user data to be displayed in Profile.tsx
    return NextResponse.json(dbUser);
  } catch (error) {
	console.error("Profile Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
//checks whether user exists in database, creates if not
export async function POST() {
	try {
		//check user authentication
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		//look up user in DB using Clerk ID
		const existingUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		//if user exists, return success
		if (existingUser) {
			return NextResponse.json({ synced: true, user: existingUser });
		}

		//if user is authenticated but not found in DB, create account
		const newUser = await prisma.user.create({
			data: {
				id: user.id,
				email: user.emailAddresses[0]?.emailAddress || "",
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				age: 0,
				height: 0,
				currentWeight: 0,
			},
		});

		return NextResponse.json(
			{
				synced: true,
				user: newUser,
				message: "Account created successfully.",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("User Sync Error:", error);
		return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
	}
}