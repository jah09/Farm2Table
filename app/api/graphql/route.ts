import { createYoga } from "graphql-yoga";
import { createSchema } from "graphql-yoga";
import { PrismaClient, Prisma } from "@prisma/client";
import { GraphQLScalarType, Kind } from "graphql";
import { createUser, authenticateUser } from "@/lib/auth";

const prisma = new PrismaClient();

// Prevent execution during build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

// Custom scalar for ObjectId
const ObjectIdScalar = new GraphQLScalarType({
  name: "ObjectId",
  description: "ObjectId custom scalar type",
  serialize(value) {
    return value?.toString();
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

const typeDefs = `
  scalar ObjectId

  enum UserRole {
    PRODUCER
    CONSUMER
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PREPARING
    READY
    DELIVERED
    CANCELLED
  }

  type User {
    id: ObjectId!
    email: String!
    name: String!
    role: UserRole!
    farmName: String
    location: String
    farmingMethod: String
    password: String
    createdAt: String!
    updatedAt: String!
    produces: [Produce!]!
    orders: [Order!]!
  }

  type Produce {
    id: ObjectId!
    name: String!
    description: String
    price: Float!
    quantity: Int!
    unit: String!
    imageUrl: String
    isActive: Boolean!
    category: String
    subCategory: String
    season: String
    farmingMethod: String
    location: String
    nutritionalHighlights: [String!]!
    storageInstructions: String
    shelfLife: String
    commonUses: [String!]!
    preparationTips: String
    aiGeneratedDescription: Boolean!
    embeddingModel: String
    embeddingText: String
    descriptionEmbedding: [Float!]!
    createdAt: String!
    updatedAt: String!
    producer: User!
    orderItems: [OrderItem!]!
  }

  type Order {
    id: ObjectId!
    orderNumber: String!
    status: OrderStatus!
    totalAmount: Float!
    customerName: String!
    customerPhone: String!
    customerAddress: String!
    specialNotes: String
    createdAt: String!
    updatedAt: String!
    customer: User!
    items: [OrderItem!]!
  }

  type OrderItem {
    id: ObjectId!
    quantity: Int!
    price: Float!
    order: Order!
    produce: Produce!
  }

  type AIConversation {
    id: ObjectId!
    question: String!
    response: String!
    userId: ObjectId
    createdAt: String!
  }

  type Query {
    users: [User!]!
    user(id: ObjectId!): User
    userByEmail(email: String!): User
    produces: [Produce!]!
    produce(id: ObjectId!): Produce
    orders: [Order!]!
    order(id: ObjectId!): Order
    ordersByCustomer(customerId: ObjectId!): [Order!]!
    producesByProducer(producerId: ObjectId!): [Produce!]!
    searchProduces(query: String!): [Produce!]!
    aiConversations: [AIConversation!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    loginUser(email: String!, password: String!): LoginResponse!
    updateUser(id: ObjectId!, input: UpdateUserInput!): User!
    deleteUser(id: ObjectId!): Boolean!

    createProduce(input: CreateProduceInput!): Produce!
    updateProduce(id: ObjectId!, input: UpdateProduceInput!): Produce!
    deleteProduce(id: ObjectId!): Boolean!

    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ObjectId!, status: OrderStatus!): Order!
    deleteOrder(id: ObjectId!): Boolean!

    createAIConversation(input: CreateAIConversationInput!): AIConversation!
  }

  type LoginResponse {
    user: User!
    token: String
  }

  input CreateUserInput {
    email: String!
    password: String!
    name: String!
    role: UserRole!
    farmName: String
    location: String
    farmingMethod: String
  }

  input UpdateUserInput {
    email: String
    name: String
    farmName: String
    location: String
    farmingMethod: String
  }

  input CreateProduceInput {
    name: String!
    description: String
    price: Float!
    quantity: Int!
    unit: String
    imageUrl: String
    category: String
    subCategory: String
    season: String
    farmingMethod: String
    location: String
    nutritionalHighlights: [String!]
    storageInstructions: String
    shelfLife: String
    commonUses: [String!]
    preparationTips: String
    aiGeneratedDescription: Boolean
    embeddingModel: String
    embeddingText: String
    descriptionEmbedding: [Float!]
    producerId: ObjectId!
  }

  input UpdateProduceInput {
    name: String
    description: String
    price: Float
    quantity: Int
    unit: String
    imageUrl: String
    isActive: Boolean
    category: String
    subCategory: String
    season: String
    farmingMethod: String
    location: String
    nutritionalHighlights: [String!]
    storageInstructions: String
    shelfLife: String
    commonUses: [String!]
    preparationTips: String
    aiGeneratedDescription: Boolean
    embeddingModel: String
    embeddingText: String
    descriptionEmbedding: [Float!]
  }

  input CreateOrderInput {
    customerId: ObjectId!
    customerName: String!
    customerPhone: String!
    customerAddress: String!
    specialNotes: String
    items: [CreateOrderItemInput!]!
  }

  input CreateOrderItemInput {
    produceId: ObjectId!
    quantity: Int!
    price: Float!
  }

  input CreateAIConversationInput {
    question: String!
    response: String!
    userId: ObjectId
  }
`;

const resolvers = {
  ObjectId: ObjectIdScalar,
  Query: {
    users: async () => {
      return await prisma.user.findMany({
        include: {
          produces: true,
        },
      })
    },
    user: (_: any, { id }: { id: string }) =>
      prisma.user.findUnique({
        where: { id },
        include: { produces: true, orders: true },
      }),
    userByEmail: (_: any, { email }: { email: string }) =>
      prisma.user.findUnique({ where: { email } }),
    produces: () =>
      prisma.produce.findMany({
        where: { isActive: true },
        include: { producer: true },
      }),
    produce: (_: any, { id }: { id: string }) =>
      prisma.produce.findUnique({ where: { id }, include: { producer: true } }),
    orders: () =>
      prisma.order.findMany({
        include: {
          customer: true,
          items: { include: { produce: true } },
        },
      }),
    order: (_: any, { id }: { id: string }) =>
      prisma.order.findUnique({
        where: { id },
        include: { customer: true, items: { include: { produce: true } } },
      }),
    ordersByCustomer: (_: any, { customerId }: { customerId: string }) =>
      prisma.order.findMany({
        where: { customerId },
        include: { items: { include: { produce: true } } },
      }),
    producesByProducer: (_: any, { producerId }: { producerId: string }) =>
      prisma.produce.findMany({
        where: { producerId },
        include: { producer: true },
      }),
    searchProduces: (_: any, { query }: { query: string }) =>
      prisma.produce.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        include: { producer: true },
      }),
    aiConversations: () => prisma.aIConversation.findMany(),
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: any }) => {
      const { password, ...userData } = input;
      const user = await createUser(input.email, password, input.name, input.role);
      
      // Return the full user data from database
      return prisma.user.findUnique({
        where: { id: user.id },
        include: { produces: true, orders: true }
      });
    },
    loginUser: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await authenticateUser(email, password);
      if (user) {
        // Return the full user data from database
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { produces: true, orders: true }
        });
        return { user: fullUser, token: null };
      }
      throw new Error("Invalid email or password");
    },
    updateUser: (_: any, { id, input }: { id: string; input: any }) =>
      prisma.user.update({ where: { id }, data: input }),
    deleteUser: async (_: any, { id }: { id: string }) => {
      await prisma.user.delete({ where: { id } });
      return true;
    },
    createProduce: (_: any, { input }: { input: any }) =>
      prisma.produce.create({ data: input, include: { producer: true } }),
    updateProduce: (_: any, { id, input }: { id: string; input: any }) =>
      prisma.produce.update({
        where: { id },
        data: input,
        include: { producer: true },
      }),
    deleteProduce: async (_: any, { id }: { id: string }) => {
      await prisma.produce.delete({ where: { id } });
      return true;
    },
    createOrder: async (_: any, { input }: { input: any }) => {
      const { items, ...orderData } = input;
      const totalAmount = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      return prisma.order.create({
        data: {
          ...orderData,
          orderNumber,
          totalAmount,
          items: { create: items },
        },
        include: {
          customer: true,
          items: { include: { produce: true } },
        },
      });
    },
    updateOrderStatus: (
      _: any,
      { id, status }: { id: string; status: string }
    ) =>
      prisma.order.update({
        where: { id },
        data: { status: status as any },
        include: {
          customer: true,
          items: { include: { produce: true } },
        },
      }),
    deleteOrder: async (_: any, { id }: { id: string }) => {
      await prisma.order.delete({ where: { id } });
      return true;
    },
    createAIConversation: (_: any, { input }: { input: any }) =>
      prisma.aIConversation.create({ data: input }),
  },
};

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});

// Wrap the yoga handler with build-time protection
const protectedYoga = async (request: Request) => {
  if (isBuildTime) {
    return new Response(JSON.stringify({ error: "Service not available during build" }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return yoga(request);
};

export { protectedYoga as GET, protectedYoga as POST };
