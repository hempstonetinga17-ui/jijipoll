import { NextResponse } from "next/server"
import { prisma } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validate"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = registerSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 })
    }

    const { email, password, name, phoneNumber, role: bodyRole, accountType, companyName, latitude, longitude } = result.data

    if (accountType === "Company" && !companyName) {
      return NextResponse.json({ message: "Company name is required for company accounts." }, { status: 400 })
    }

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 })
    }

    // Check phone uniqueness for agents
    if (phoneNumber) {
      const existingPhone = await prisma.user.findUnique({ where: { phoneNumber } })
      if (existingPhone) {
        return NextResponse.json({ message: "A user with this phone number already exists." }, { status: 409 })
      }
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    const lat = latitude ? parseFloat(latitude) : undefined
    const lng = longitude ? parseFloat(longitude) : undefined

    // Determine role: explicit bodyRole takes priority, then accountType mapping
    const role = bodyRole ?? (accountType === "Company" ? "BUSINESS_OWNER" : "USER")

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(name ? { name } : {}),
        ...(phoneNumber ? { phoneNumber } : {}),
        ...(accountType === "Company"
          ? {
              business: {
                create: {
                  companyName: companyName as string,
                  ...(lat !== undefined ? { latitude: lat } : {}),
                  ...(lng !== undefined ? { longitude: lng } : {}),
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
