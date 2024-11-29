import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function backupDatabase() {
  const data = {
    users: await prisma.user.findMany(),
    shifts: await prisma.shift.findMany(),
    leaveRequests: await prisma.leaveRequest.findMany(),
    // ... other models
  }

  fs.writeFileSync(
    `./backups/backup-${new Date().toISOString()}.json`,
    JSON.stringify(data, null, 2)
  )

  console.log('Backup completed successfully')
}

backupDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

