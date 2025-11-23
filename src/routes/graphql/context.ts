import { PrismaClient } from '@prisma/client';
import { 
  createUserLoader, 
  createPostLoader, 
  createProfileLoader,
  createMemberTypeLoader,
  createSubscribedToLoader,
  createSubscribersLoader
} from './loaders.js';

export interface Context {
  prisma: PrismaClient;
  userLoader: ReturnType<typeof createUserLoader>;
  postLoader: ReturnType<typeof createPostLoader>;
  profileLoader: ReturnType<typeof createProfileLoader>;
  memberTypeLoader: ReturnType<typeof createMemberTypeLoader>;
  subscribedToLoader: ReturnType<typeof createSubscribedToLoader>;
  subscribersLoader: ReturnType<typeof createSubscribersLoader>;
}

export function createContext(prisma: PrismaClient): Context {
  return {
    prisma,
    userLoader: createUserLoader(prisma),
    postLoader: createPostLoader(prisma),
    profileLoader: createProfileLoader(prisma),
    memberTypeLoader: createMemberTypeLoader(prisma),
    subscribedToLoader: createSubscribedToLoader(prisma),
    subscribersLoader: createSubscribersLoader(prisma),
  };
}
