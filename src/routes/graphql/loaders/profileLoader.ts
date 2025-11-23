import DataLoader from 'dataloader';
import { PrismaClient, Profile } from '@prisma/client';

const createProfileLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, Profile | null>(async (userIds: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: userIds as string[] } },
    });
    
    const profileMap = new Map<string, Profile>();
    profiles.forEach(profile => {
      profileMap.set(profile.userId, profile);
    });
    
    return userIds.map(userId => profileMap.get(userId) || null);
  });
};

export default createProfileLoader;
