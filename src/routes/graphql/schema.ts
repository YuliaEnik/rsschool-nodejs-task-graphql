import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import type { Context } from './context.js';
import { MemberTypeIdScalar } from './scalars.js';

interface UserParent {
  id: string;
  name: string;
  balance: number;
}

interface PostParent {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

interface ProfileParent {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

interface MemberTypeParent {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}

const MemberType = new GraphQLObjectType<MemberTypeParent, Context>({
  name: 'MemberType',
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});

// Создаем геттеры для ленивой инициализации
const getUserType = (): GraphQLObjectType<UserParent, Context> => {
  if (!getUserType.instance) {
    getUserType.instance = new GraphQLObjectType<UserParent, Context>({
      name: 'User',
      fields: () => ({
        id: { type: UUIDType },
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
        profile: {
          type: getProfileType(),
          resolve: (parent, _args, ctx: Context) => {
            return ctx.prisma.profile.findUnique({ 
              where: { userId: parent.id } 
            });
          },
        },
        posts: {
          type: new GraphQLList(getPostType()),
          resolve: (parent, _args, ctx: Context) => {
            return ctx.prisma.post.findMany({ 
              where: { authorId: parent.id } 
            });
          },
        },
        userSubscribedTo: {
          type: new GraphQLList(getUserType()),
          resolve: async (parent, _args, ctx: Context) => {
            const subscriptions = await ctx.prisma.subscribersOnAuthors.findMany({
              where: { subscriberId: parent.id },
              include: { author: true },
            });
            return subscriptions.map(sub => sub.author);
          },
        },
        subscribedToUser: {
          type: new GraphQLList(getUserType()),
          resolve: async (parent, _args, ctx: Context) => {
            const subscriptions = await ctx.prisma.subscribersOnAuthors.findMany({
              where: { authorId: parent.id },
              include: { subscriber: true },
            });
            return subscriptions.map(sub => sub.subscriber);
          },
        },
      }),
    });
  }
  return getUserType.instance;
};
getUserType.instance = null as GraphQLObjectType<UserParent, Context> | null;

const getPostType = (): GraphQLObjectType<PostParent, Context> => {
  if (!getPostType.instance) {
    getPostType.instance = new GraphQLObjectType<PostParent, Context>({
      name: 'Post',
      fields: () => ({
        id: { type: UUIDType },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        author: {
          type: getUserType(),
          resolve: (parent, _args, ctx: Context) => {
            return ctx.prisma.user.findUnique({ 
              where: { id: parent.authorId } 
            });
          },
        },
      }),
    });
  }
  return getPostType.instance;
};
getPostType.instance = null as GraphQLObjectType<PostParent, Context> | null;

const getProfileType = (): GraphQLObjectType<ProfileParent, Context> => {
  if (!getProfileType.instance) {
    getProfileType.instance = new GraphQLObjectType<ProfileParent, Context>({
      name: 'Profile',
      fields: () => ({
        id: { type: UUIDType },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        user: {
          type: getUserType(),
          resolve: (parent, _args, ctx: Context) => {
            return ctx.prisma.user.findUnique({ 
              where: { id: parent.userId } 
            });
          },
        },
        memberType: {
          type: MemberType,
          resolve: async (parent, _args, ctx: Context) => {
            if (!parent.memberTypeId) {
              return null;
            }
            
            return ctx.prisma.memberType.findUnique({ 
              where: { id: parent.memberTypeId } 
            });
          },
        },
      }),
    });
  }
  return getProfileType.instance;
};
getProfileType.instance = null as GraphQLObjectType<ProfileParent, Context> | null;

// Создаем константы
const User = getUserType();
const Post = getPostType();
const Profile = getProfileType();

const Query = new GraphQLObjectType<unknown, Context>({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(User),
      resolve: (_parent, _args, ctx: Context) => {
        return ctx.prisma.user.findMany();
      },
    },
    user: {
      type: User,
      args: {
        id: { type: UUIDType },
      },
      resolve: (_parent, args: { id: string }, ctx: Context) => {
        return ctx.prisma.user.findUnique({
          where: { id: args.id },
        });
      },
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: (_parent, _args, ctx: Context) => {
        return ctx.prisma.post.findMany();
      },
    },
    post: {
      type: Post,
      args: {
        id: { type: UUIDType },
      },
      resolve: (_parent, args: { id: string }, ctx: Context) => {
        return ctx.prisma.post.findUnique({
          where: { id: args.id },
        });
      },
    },
    profiles: {
      type: new GraphQLList(Profile),
      resolve: (_parent, _args, ctx: Context) => {
        return ctx.prisma.profile.findMany();
      },
    },
    profile: {
      type: Profile,
      args: {
        id: { type: UUIDType },
      },
      resolve: (_parent, args: { id: string }, ctx: Context) => {
        return ctx.prisma.profile.findUnique({
          where: { id: args.id },
        });
      },
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: (_parent, _args, ctx: Context) => {
        return ctx.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: MemberTypeIdScalar },
      },
      resolve: async (_parent, args: { id: string }, ctx: Context) => {
        return ctx.prisma.memberType.findUnique({
          where: { id: args.id },
        });
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: Query,
});
