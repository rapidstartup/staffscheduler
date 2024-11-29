import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.shift.delete({
      where: {
        id: params.id,
      },
    })
    return NextResponse.json({ message: 'Recurring shift deleted successfully' })
  } catch (error) {
    console.error('Failed to delete recurring shift:', error)
    return NextResponse.json({ error: 'Failed to delete recurring shift' }, { status: 500 })
  }
}

