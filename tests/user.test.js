// [ IMPORTANT !!!!! ]

// Apollo is using "fetch" but it has a compatiblity issue with babel.
//  Therefore we need to use cross-fetch with polyfill.
import 'cross-fetch/polyfill';
// For test, test itself must be a client to fetch and mustate the data
// import { gql } from 'apollo-boost';

// [Moving to seedDatabase.js to be used in other test]
//encoding the password
// import bcrypt from 'bcryptjs';

import getClient from './utils/getClient';
import prisma from '../src/prisma';

// GraphQL
const client = getClient();

// 3) 
import seedDatabase, { userOne } from './utils/seedDatabase';

import { createUser, getProfile, getUsers, login } from './utils/user_operations';
beforeEach(seedDatabase);

// 2) It is working but not much modularized. 
// import './utils/seedDatabase';


// 1) To be commonly used in other test files

// all lifecycle functions take a single callback

// [Moving to seedDatabase.js to be used in other test]
// deleteManyUser property to delete data in users table.
// beforeEach(async () => {

//     await prisma.mutation.deleteManyPosts();

//     // [ Important ]
//     // It can be done without client's request
//     // delete all users
//     await prisma.mutation.deleteManyUsers();

//     // building seed data only in the server side, not the client side
//     // It does not go through resolver between node.js and the client,
//     //  and instead, it directly pass through the prisma.
//     // Therefore, in order to store password, becrypt is required.
//     const user = await prisma.mutation.createUser({
//         data: {
//             name: 'Jan',
//             email: 'jan@gmail.com',
//             password: bcrypt.hashSync('asdfghjk')
//         }
//     });

//     await prisma.mutation.createPost({
//         data: {
//             title: 'The first test',
//             body: 'Test should work as I did in User',
//             published: true,
//             author: {
//                 connect: {
//                     id: user.id
//                 }
//             }
//         }
//     });

//     await prisma.mutation.createPost({
//         data: {
//             title: 'The second test',
//             body: 'Great test will build a higher quality product',
//             published: false,
//             author: {
//                 connect: {
//                     id: user.id
//                 }
//             }
//         }

//     });
// });


// // 2) Variable setup
// const createUser = gql `
//     mutation ($data: createUserInput!) {
//         createUser(
//             data: $data
//         ) {
//             token,
//             user {
//                 id
//                 name
//                 email
//             }
//         }
//     }
// `;

// const getUsers = gql `
//     query {
//         users {
//             id
//             name
//             email
//         }
//     }
// `;

// const login = gql `
//     mutation ($data: loginInput!) {
//         login(
//             data: $data
//         ) {
//             token
//             user {
//                 id
//                 name
//                 email
//             }
//         }
//     }
// `;

// const getProfile = gql `
//     query {
//         me {
//             id
//             name
//             email
//         }
//     }
// `;

test('Should create a new user', async () => {

    // 2) By using variable

    const variables = {
        data: {
            email: "jsons@jsons.com",
            name: "Jsons Andrew",
            password: "asdfghjk"
        }
    }

    const response = await client.mutate({ 
        mutation: createUser, 
        variables
    });

    // 1) Hard coding
    // Can't rerun because the email must be unique.
    //  in this case, error is thrown in the application code,
    //  not from the test code.
    
    // const createUser = gql `
    //     mutation {
    //         createUser(
    //             data: {
    //                 email: "jsons@jsons.com"
    //                 name: "Jsons Andrew"
    //                 password: "asdfghjk"
    //             }
    //         ) {
    //             token,
    //             user {
    //                 id
    //             }
    //         }
    //     }
    // `;

    // createUser ===> goes through resolver in grapqhQL
    // const response = await client.mutate({ mutation: createUser });

    const userVerified = await prisma.exists.User({ id: response.data.createUser.user.id });
    expect(userVerified).toBe(true);

});

test('should expose public author profile', async () => {

    // Refactoring as since we use variables
    // const getUsers = gql `
    //     query {
    //         users {
    //             id
    //             name
    //             email
    //         }
    //     }
    // `;

    const response = await client.query({ query: getUsers });
    expect(response.data.users.length).toBe(2);
    expect(response.data.users[0].email).toBe(null);
    expect(response.data.users[0].name).toBe('Jan');

});

test('should throw an error with bad credentials', async () => {

    const variables = {
        data: {
            email: "jan@gmail.com",
            password: "asdf"
        }
    }


    // client.mutate({ mutation: login }) is promise
    // Use Promise "rejects" and then check if the code throw an error 
    //  when it is rejected
    await expect(
        client.mutate({ mutation: login, variables })
    ).rejects.toThrow();


    // 1) Without Variables
    // const login = gql `
    //     mutation {
    //         login(
    //             data: {
    //                 email: "jan@gmail.com",
    //                 password: "asdf"
    //             }
    //         ) {
    //             token
    //             user {
    //                 id
    //                 name
    //                 email
    //             }
    //         }
    //     }
    // `;


    // await expect(
    //     client.mutate({ mutation: login })
    // ).rejects.toThrow();
    
    // It is wrong syntax becaue "client.mutate({ mutations: login})"
    //  must be fired off in the call back args in expect and then,
    //  the return value should be error instance from inside of expect
    // Then, the result passes to the next promise "rejects"
    // const response = await client.mutate({ mutation: login });
    // await expect(response).rejects.toThrow();

});

test('should throw an error with invalid password', async () => {

    const variables = {
        data: {
            email: "aaa@aaa.com",
            name: "Jeffry",
            password: "aaa"
        }
    }

    await expect(
        client.mutate({ mutation: createUser, variables })
    ).rejects.toThrow();
    

    // 1) Without Variable
    // const createUser = gql `
    //     mutation {
    //         createUser(
    //             data: {
    //                 email: "aaa@aaa.com"
    //                 name: "Jeffry"
    //                 password: "aaa"
    //             }
    //         ) {
    //             token
    //         }
    //     }
    // `;

    // await expect(
    //     client.mutate({ mutation: createUser })
    // ).rejects.toThrow();
    
});

// With jwt
// should have the user profile back if the user is authenticated
test('Should fetch user profile', async () => {

    // Separate client defninition when the user sends jwt
    // For "Jan", new jwt is created ahead in seedDatabase  
    const client = getClient(userOne.jwt);

    // 1) Without variables
    // const getProfile = gql `
    //     query {
    //         me {
    //             id
    //             name
    //             email
    //         }
    //     }
    // `;

    const { data } = await client.query({ query: getProfile });
    expect(data.me.id).toBe(userOne.user.id);
    expect(data.me.name).toBe(userOne.user.name);
    expect(data.me.email).toBe(userOne.user.email);

});





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

