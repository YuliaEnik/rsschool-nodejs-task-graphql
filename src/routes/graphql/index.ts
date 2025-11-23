import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './schema.js';
import { createContext } from './context.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const document = parse(query);

      const validationErrors = validate(schema, document, [depthLimit(5)]);

      if (validationErrors.length > 0) {
        return {
          errors: validationErrors.map((error) => ({
            message: error.message,
            locations: error.locations,
            path: error.path,
          })),
        };
      }

      return graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: createContext(prisma),
      });
    },
  });
};

export default plugin;
