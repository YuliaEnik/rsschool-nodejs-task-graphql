import { GraphQLScalarType, GraphQLError, Kind } from 'graphql';

export const MemberTypeIdScalar = new GraphQLScalarType({
  name: 'MemberTypeId',
  description: 'MemberType ID scalar type (BASIC or BUSINESS)',
  
  serialize(value: unknown): string {
    if (typeof value !== 'string') {
      throw new GraphQLError(`MemberTypeId must be a string, got: ${typeof value}`);
    }
    if (value !== 'BASIC' && value !== 'BUSINESS') {
      throw new GraphQLError(`MemberTypeId must be either 'BASIC' or 'BUSINESS', got: ${value}`);
    }
    return value;
  },
  
  parseValue(value: unknown): string {
    if (typeof value !== 'string') {
      throw new GraphQLError(`MemberTypeId must be a string, got: ${typeof value}`);
    }
    if (value !== 'BASIC' && value !== 'BUSINESS') {
      throw new GraphQLError(`MemberTypeId must be either 'BASIC' or 'BUSINESS', got: ${value}`);
    }
    return value;
  },
  
  parseLiteral(ast): string {
    if (ast.kind === Kind.STRING) {
      if (ast.value === 'BASIC' || ast.value === 'BUSINESS') {
        return ast.value;
      }
      throw new GraphQLError(`MemberTypeId must be either 'BASIC' or 'BUSINESS', got: ${ast.value}`);
    }
    throw new GraphQLError(`MemberTypeId must be a string, got: ${ast.kind}`);
  },
});
