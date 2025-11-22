import type { Context } from './context.js';

export const resolvers = {
  Query: {
    users: (_parent: unknown, _args: unknown, ctx: Context) => {
      return ctx.prisma.user.findMany();
    },
    posts: (_parent: unknown, _args: unknown, ctx: Context) => {
      return ctx.prisma.post.findMany();
    },
    profiles: (_parent: unknown, _args: unknown, ctx: Context) => {
      return ctx.prisma.profile.findMany();
    },
    memberTypes: (_parent: unknown, _args: unknown, ctx: Context) => {
      return ctx.prisma.memberType.findMany();
    },
  },

  User: {
    profile: (parent: { id: string }, _args: unknown, ctx: Context) => {
      return ctx.prisma.profile.findUnique({ 
        where: { userId: parent.id } 
      });
    },
    posts: (parent: { id: string }, _args: unknown, ctx: Context) => {
      return ctx.prisma.post.findMany({ 
        where: { authorId: parent.id } 
      });
    },
    userSubscribedTo: (parent: { id: string }, _args: unknown, ctx: Context) => {
     
      return [];
    },
    subscribedToUser: (parent: { id: string }, _args: unknown, ctx: Context) => {
     
      return [];
    },
  },

  Post: {
    author: (parent: { authorId: string }, _args: unknown, ctx: Context) => {
      return ctx.prisma.user.findUnique({ 
        where: { id: parent.authorId } 
      });
    },
  },

  Profile: {
    user: (parent: { userId: string }, _args: unknown, ctx: Context) => {
      return ctx.prisma.user.findUnique({ 
        where: { id: parent.userId } 
      });
    },
    memberType: (parent: { memberTypeId: string }, _args: unknown, ctx: Context) => {
      return ctx.prisma.memberType.findUnique({ 
        where: { id: parent.memberTypeId } 
      });
    },
  },
};
