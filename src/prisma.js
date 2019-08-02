import { Prisma } from 'prisma-binding';
import { fragmentReplacements } from './resolvers';

const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    // endpoint: 'http://192.168.99.100:4466',
    endpoint: process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET,
    fragmentReplacements
})

export default prisma;