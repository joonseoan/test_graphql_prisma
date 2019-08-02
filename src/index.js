import '@babel/polyfill/noConflict';
import { GraphQLServer } from 'graphql-yoga';

import { resolvers, fragmentReplacements } from './resolvers';
import prisma from './prisma';

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context(request) {
        return {
            prisma,
            request
        }
    },
    fragmentReplacements
})

// Heroku does not use port number , 4000.
// Heroku gives us its own port to the code by using prcess.env.PORT.
//  Therefore, we need to set this variable.
// We can still 4000 in the development mode.
server.start({ port: process.env.PORT || 4000 }, () => console.log('Production_deployment'));
// server.start(() => console.log('Production_deployment'));

