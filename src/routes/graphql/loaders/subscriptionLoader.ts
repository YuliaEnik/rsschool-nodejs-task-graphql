import DataLoader from 'dataloader';
import { PrismaClient, User } from '@prisma/client';

const createSubscribedToLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, User[]>(async (subscriberIds: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: subscriberIds as string[] } },
      include: { author: true },
    });
    
    const subscribedToMap = new Map<string, User[]>();
    
    subscriberIds.forEach(id => {
      subscribedToMap.set(id, []);
    });
    
    subscriptions.forEach(sub => {
      const userSubscriptions = subscribedToMap.get(sub.subscriberId);
      if (userSubscriptions) {
        userSubscriptions.push(sub.author);
      }
    });
    
    return subscriberIds.map(id => subscribedToMap.get(id) || []);
  });
};

const createSubscribersLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, User[]>(async (authorIds: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: authorIds as string[] } },
      include: { subscriber: true },
    });
    
    const subscribersMap = new Map<string, User[]>();
    
    authorIds.forEach(id => {
      subscribersMap.set(id, []);
    });
    
    subscriptions.forEach(sub => {
      const userSubscribers = subscribersMap.get(sub.authorId);
      if (userSubscribers) {
        userSubscribers.push(sub.subscriber);
      }
    });
    
    return authorIds.map(id => subscribersMap.get(id) || []);
  });
};

export { createSubscribedToLoader, createSubscribersLoader };
