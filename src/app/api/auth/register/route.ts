import { NextResponse } from "next/server"
import { prisma } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, accountType, companyName, latitude, longitude } = body

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 })
    }



    if (accountType === "Company" && !companyName) {
      return NextResponse.json({ message: "Company name is required for company accounts." }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 })
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    const lat = latitude ? parseFloat(latitude) : undefined
    const lng = longitude ? parseFloat(longitude) : undefined

    // Determine role based on account type
    const role = accountType === "Company" ? "BUSINESS_OWNER" : "USER"

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(accountType === "Company"
          ? {
              business: {
                create: {
                  companyName,
                  latitude: lat,
                  longitude: lng,
                },
              },
            }
          : {}),
      },
    })

    // Remove passwordHash from response
    const { passwordHash: _hash, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: "User registered successfully.", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "An error occurred during registration." },
      { status: 500 }
    )
  }
}
