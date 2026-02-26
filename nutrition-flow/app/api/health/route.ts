import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    // Try to execute a simple query
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json(
      { status: 'connected', message: 'Database connection successful' },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json(
      { status: 'disconnected', error: errorMessage },
      { status: 500 }
    )
  }
}
