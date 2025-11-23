import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType, 
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
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
            return ctx.profileLoader.load(parent.id);
          },
        },
        posts: {
          type: new GraphQLList(getPostType()),
          resolve: (parent, _args, ctx: Context) => {
            return ctx.postLoader.load(parent.id);
          },
        },
        userSubscribedTo: {
          type: new GraphQLList(getUserType()),
          resolve: async (parent, _args, ctx: Context) => {
            return ctx.subscribedToLoader.load(parent.id);
          },
        },
        subscribedToUser: {
          type: new GraphQLList(getUserType()),
          resolve: async (parent, _args, ctx: Context) => {
            return ctx.subscribersLoader.load(parent.id);
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
            return ctx.userLoader.load(parent.authorId);
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
            
            return ctx.memberTypeLoader.load(parent.memberTypeId);
          },
        },
      }),
    });
  }
  return getProfileType.instance;
};
getProfileType.instance = null as GraphQLObjectType<ProfileParent, Context> | null;

export const User = getUserType();
export const Post = getPostType();
export const Profile = getProfileType();

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

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: User,
      args: {
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'CreateUserInput',
            fields: {
              name: { type: new GraphQLNonNull(GraphQLString) },
              balance: { type: new GraphQLNonNull(GraphQLFloat) },
            },
          })),
        },
      },
      resolve: async (_parent, args: { dto: { name: string; balance: number } }, ctx: Context) => {
        return ctx.prisma.user.create({
          data: args.dto,
        });
      },
    },

    createPost: {
      type: Post,
      args: {
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'CreatePostInput',
            fields: {
              title: { type: new GraphQLNonNull(GraphQLString) },
              content: { type: new GraphQLNonNull(GraphQLString) },
              authorId: { type: new GraphQLNonNull(UUIDType) },
            },
          })),
        },
      },
      resolve: async (_parent, args: { dto: { title: string; content: string; authorId: string } }, ctx: Context) => {
        return ctx.prisma.post.create({
          data: args.dto,
        });
      },
    },

    createProfile: {
      type: Profile,
      args: {
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'CreateProfileInput',
            fields: {
              isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
              yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
              userId: { type: new GraphQLNonNull(UUIDType) },
              memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
            },
          })),
        },
      },
      resolve: async (_parent, args: { dto: { isMale: boolean; yearOfBirth: number; userId: string; memberTypeId: string } }, ctx: Context) => {
        return ctx.prisma.profile.create({
          data: args.dto,
        });
      },
    },

    changeUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'ChangeUserInput',
            fields: {
              name: { type: GraphQLString },
              balance: { type: GraphQLFloat },
            },
          })),
        },
      },
      resolve: async (_parent, args: { id: string; dto: { name?: string; balance?: number } }, ctx: Context) => {
        return ctx.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },

    changePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'ChangePostInput',
            fields: {
              title: { type: GraphQLString },
              content: { type: GraphQLString },
            },
          })),
        },
      },
      resolve: async (_parent, args: { id: string; dto: { title?: string; content?: string } }, ctx: Context) => {
        return ctx.prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },

    changeProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'ChangeProfileInput',
            fields: {
              isMale: { type: GraphQLBoolean },
              yearOfBirth: { type: GraphQLInt },
              userId: { type: UUIDType },
              memberTypeId: { type: GraphQLString },
            },
          })),
        },
      },
      resolve: async (_parent, args: { id: string; dto: { isMale?: boolean; yearOfBirth?: number; userId?: string; memberTypeId?: string } }, ctx: Context) => {
        return ctx.prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },

    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, ctx: Context) => {
        await ctx.prisma.user.delete({
          where: { id: args.id },
        });
        return true;
      },
    },

    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, ctx: Context) => {
        await ctx.prisma.post.delete({
          where: { id: args.id },
        });
        return true;
      },
    },

    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, args: { id: string }, ctx: Context) => {
        await ctx.prisma.profile.delete({
          where: { id: args.id },
        });
        return true;
      },
    },

    subscribeTo: {
      type: GraphQLBoolean,
      args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_parent, args: { userId: string; authorId: string }, ctx: Context) => {
    await ctx.prisma.subscribersOnAuthors.create({
      data: {
        subscriberId: args.userId,
        authorId: args.authorId,
      },
    });
    return true; 
      },
    },

    unsubscribeFrom: {
  type: GraphQLBoolean,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_parent, args: { userId: string; authorId: string }, ctx: Context) => {
    await ctx.prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      },
    });
    return true;
  },
},
  },
});

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
