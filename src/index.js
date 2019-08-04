import '@babel/polyfill/noConflict';

import server from './server';

// moving to server.js
// import { GraphQLServer } from 'graphql-yoga';

// import { resolvers, fragmentReplacements } from './resolvers';
// import prisma from './prisma';

// const server = new GraphQLServer({
//     typeDefs: './src/schema.graphql',
//     resolvers,
//     context(request) {
//         return {
//             prisma,
//             request
//         }
//     },
//     fragmentReplacements
// })

server.start({ port: process.env.PORT || 4000 }, () => console.log('test up!'));

