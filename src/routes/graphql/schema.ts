import { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLFloat, GraphQLBoolean, GraphQLInt } from 'graphql';
import { UUIDType } from './types/uuid.js';
import type { Context } from './context.js';

interface ProfileParent {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

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

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});

const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: Profile,
      resolve: (parent: UserParent, _args, ctx: Context) => {
        return ctx.prisma.profile.findUnique({ 
          where: { userId: parent.id } 
        });
      },
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: (parent: UserParent, _args, ctx: Context) => {
        return ctx.prisma.post.findMany({ 
          where: { authorId: parent.id } 
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(User),
      resolve: () => [],
    },
    subscribedToUser: {
      type: new GraphQLList(User),
      resolve: () => [],
    },
  }),
});

const Post = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    author: {
      type: User,
      resolve: (parent: PostParent, _args, ctx: Context) => {
        return ctx.prisma.user.findUnique({ 
          where: { id: parent.authorId } 
        });
      },
    },
  },
});

const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: {
      type: User,
      resolve: (parent: ProfileParent, _args, ctx: Context) => {
        return ctx.prisma.user.findUnique({ 
          where: { id: parent.userId } 
        });
      },
    },
    memberType: {
      type: MemberType,
      resolve: (parent: ProfileParent, _args, ctx: Context) => {
        if (!parent.memberTypeId) return null;
        return ctx.prisma.memberType.findUnique({ 
          where: { id: parent.memberTypeId } 
        });
      },
    },
  },
});

const Query = new GraphQLObjectType({
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
      resolve: (_parent, args, ctx: Context) => {
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
      resolve: (_parent, args, ctx: Context) => {
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
      resolve: (_parent, args, ctx: Context) => {
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
        id: { type: GraphQLString },
      },
      resolve: (_parent, args, ctx: Context) => {
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
