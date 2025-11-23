import DataLoader from 'dataloader';
import { PrismaClient, User } from '@prisma/client';

const createUserLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, User | null>(async (userIds: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
    });
    
    const userMap = new Map<string, User>();
    users.forEach(user => {
      userMap.set(user.id, user);
    });
    
    return userIds.map(id => userMap.get(id) || null);
  });
};

export default createUserLoader;
