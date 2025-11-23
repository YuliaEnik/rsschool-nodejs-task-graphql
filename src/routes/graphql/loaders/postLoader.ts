import DataLoader from 'dataloader';
import { PrismaClient, Post } from '@prisma/client';

const createPostLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, Post[]>(async (userIds: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: userIds as string[] } },
    });
    
    const postsByUserId = new Map<string, Post[]>();
    
    userIds.forEach(userId => {
      postsByUserId.set(userId, []);
    });
    
    posts.forEach(post => {
      const userPosts = postsByUserId.get(post.authorId);
      if (userPosts) {
        userPosts.push(post);
      }
    });
    
    return userIds.map(userId => postsByUserId.get(userId) || []);
  });
};

export default createPostLoader;
