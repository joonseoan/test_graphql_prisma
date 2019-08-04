// [ IMPORTANT !!!!! ]

// Apollo is using "fetch" but it has a compatiblity issue with babel.
//  Therefore we need to use cross-fetch with polyfill.
import 'cross-fetch/polyfill';
// For test, test itself must be a client to fetch and mustate the data
import  ApolloBoost, { gql } from 'apollo-boost';
//encoding the password
import bcrypt from 'bcryptjs';

import prisma from '../src/prisma';

// 1) [Basic ]
// import { getFirstName, isValidPassword } from '../src/utils/user';

// "test" allowes us to define individual test case.

// test('This is my first jest', () => {
    
// });

// test('Andrews challenge', () => {
    
// });

// test('should return first name when given full name', () => {
//     const firstName = getFirstName('Mike Hyashi');
//     // IMPORTANT!!!!
//     // if run throw error, jest think it has an error
//     // throw new Error('This should trigger a failure.')

//     // (old one)
//     // if(firstName !== 'Mike') throw new Error('This should trigger a failure.');
    
//     // By using expect..
//     expect(firstName).toBe('Mike');
// });

// test('shold return first name when given the first name', () => {
//     const firstName = getFirstName('Jan');
//     expect(firstName).toBe('Jan');
// });

// test('shold reject password shorter than 8 letters', () => {
//     const password = isValidPassword('abcd');
//     expect(password).toBe(false);
// });

// test('shold reject password does not include password word', () => {
//     const password = isValidPassword('aafcgafadfasdf');
//     expect(password).toBe(false);
// });

// GraphQL
const client = new ApolloBoost({
    uri: 'http://localhost:4000'
});

// all lifecycle functions take a single callback

// deleteManyUser property to delete data in users table.
beforeEach(async () => {

    await prisma.mutation.deleteManyPosts();

    // [ Important ]
    // It can be done without client's request
    // delete all users
    await prisma.mutation.deleteManyUsers();

    // building seed data only in the server side, not the client side
    // It does not go through resolver between node.js and the client,
    //  and instead, it directly pass through the prisma.
    // Therefore, in order to store password, becrypt is required.
    const user = await prisma.mutation.createUser({
        data: {
            name: 'Jan',
            email: 'jan@gmail.com',
            password: bcrypt.hashSync('asdfghjk')
        }
    });

    await prisma.mutation.createPost({
        data: {
            title: 'The first test',
            body: 'Test should work as I did in User',
            published: true,
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    });

    await prisma.mutation.createPost({
        data: {
            title: 'The second test',
            body: 'Great test will build a higher quality product',
            published: false,
            author: {
                connect: {
                    id: user.id
                }
            }
        }

    });
})

test('Should create a new user', async () => {

    // Can't rerun because the email must be unique.
    //  in this case, error is thrown in the application code,
    //  not from the test code.
    const createUser = gql `
        mutation {
            createUser(
                data: {
                    email: "jsons@jsons.com"
                    name: "Jsons Andrew"
                    password: "asdfghjk"
                }
            ) {
                token,
                user {
                    id
                }
            }
        }
    `;

    // createUser ===> goes through resolver in grapqhQL
    const response = await client.mutate({ mutation: createUser });
    const userVerified = await prisma.exists.User({ id: response.data.createUser.user.id });
    expect(userVerified).toBe(true);
});

test('should expose public author profile', async () => {
    const getUsers = gql `
       query {
            users {
                id
                name
                email
            }
       }
    `;

    const response = await client.query({ query: getUsers });
    expect(response.data.users.length).toBe(1);
    expect(response.data.users[0].email).toBe(null);
    expect(response.data.users[0].name).toBe('Jan')
});

test('should return published post only', async () => {
    const getPosts = gql `
        query {
            posts {
                id
                title
                body
                published
            }
        }
    `;

    const response = await client.query({ query: getPosts });
    expect(response.data.posts.length).toBe(1);
    expect(response.data.posts[0].published).toBe(true);
    
});
