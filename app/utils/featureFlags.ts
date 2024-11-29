import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function isFeatureEnabled(featureName: string, userId: string): Promise<boolean> {
  const feature = await prisma.featureFlag.findUnique({
    where: { name: featureName },
  })

  if (!feature) return false

  if (feature.enabledForAll) return true

  const userHasFeature = await prisma.userFeature.findUnique({
    where: {
      userId_featureName: {
        userId,
        featureName,
      },
    },
  })

  return !!userHasFeature
}

