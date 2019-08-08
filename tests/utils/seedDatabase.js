//encoding the password
import bcrypt from 'bcryptjs';
import prisma from '../../src/prisma';

// to implement jwt
// Bear in mind again that this seedData does not go through resover functions
import jwt from 'jsonwebtoken';

export const userOne = {
    input: {
        name: 'Jan',
        email: 'jan@gmail.com',
        password: bcrypt.hashSync('asdfghjk')
    },
    user: undefined,
    jwt: undefined
};

export const userTwo = {
    input: {
        name: 'Kevin',
        email: 'kevin@gmail.com',
        password: bcrypt.hashSync('asdfghjk')
    },
    user: undefined,
    jwt: undefined
};

export const postOne = {
    input: {
        title: 'The first test',
        body: 'Test should work as I did in User',
        published: true
    },
    post: undefined
};

export const postTwo = {
    input: {
        title: 'The second test',
        body: 'Great test will build a higher quality product',
        published: false
    },
    post: undefined
};

export const commentOne = {
    input: {
        text: 'Comment One'
    },
    comment: undefined
}

export const commentTwo = {
    input: {
        text: 'Comment two'
    },
    comment: undefined
}


// 2) To be more modularized
export default async () => {

    await prisma.mutation.deleteManyComments();

    await prisma.mutation.deleteManyPosts();

    // [ Important ]
    // It can be done without client's request
    // delete all users
    await prisma.mutation.deleteManyUsers();

    // 2) with JWT
    // to get the returned data from "prisma", not from local graphql!!!!
    // In case that is is loca, it return user { id, name, email }, and token 
    //  which are not identical with the one below
    userOne.user = await prisma.mutation.createUser({
        data: userOne.input
    });
    
    // Keep in mind again that like above, it does not go through the logcal graphql resolvers
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.PRISMA_JWT_SECRET);

    userTwo.user = await prisma.mutation.createUser({
        data: userTwo.input
    });

    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.PRISMA_JWT_SECRET);




    // 1) without JWT
    // building seed data only in the server side, not the client side
    // It does not go through resolver between node.js and the client,
    //  and instead, it directly pass through the prisma.
    // Therefore, in order to store password, becrypt is required.
    // const user = await prisma.mutation.createUser({
    //     data: {
    //         name: 'Jan',
    //         email: 'jan@gmail.com',
    //         password: bcrypt.hashSync('asdfghjk')
    //     }
    // });

    // postOne
    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: {
                connect: {
                    // since we use "userOne.user" which received the reutrned data
                    id: userOne.user.id
                    // id: user.id
                }
            }
        }
    });

    // postTwo
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: {
                connect: {
                    // same as above
                    id: userOne.user.id
                    // id: user.id
                }
            }
        }

    });

    commentOne.comment = await prisma.mutation.createComment({
        data: {
            ...commentOne.input,
            post: {
                connect: {
                    id: postOne.post.id
                }
            },
            author: {
                connect: {
                    id: userTwo.user.id
                }
            }
        }
    });

    commentTwo.comment = await prisma.mutation.createComment({
        data: {
            ...commentTwo.input,
            post: {
                connect: {
                    id: postOne.post.id
                }
            },
            author: {
                connect: {
                    id: userTwo.user.id
                }
            }
        }
    });


};


// 1)
// export default beforeEach(async () => {

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
