import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
}

export function createContext(prisma: PrismaClient): Context {
  return {
    prisma,
  };
}
