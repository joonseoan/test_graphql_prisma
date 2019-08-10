import 'cross-fetch/polyfill';

import prisma from '../src/prisma';
import seedDatabase, { userOne, commentOne, commentTwo, postOne } from './utils/seedDatabase';
import { getComments, deleteComment, subscribeToComments } from './utils/comment_operation';
import getClient from './utils/getClient';

const client = getClient();

beforeEach(seedDatabase);

test('Should delete own connect', async () => {
    const client_jwt = getClient(userOne.jwt);

    const variables = {
        id: commentOne.comment.id
    };

    const { data } = await client_jwt.mutate({ mutation: deleteComment, variables });
    const commentLength = await client.query({ query: getComments });
    const existComment = await prisma.exists.Comment({ id: commentOne.comment.id });

    expect(data.deleteComment.id).toBe(commentOne.comment.id);
    expect(commentLength.data.comments.length).toBe(1);
    expect(existComment).toBe(false);

});

test('Should not delete other users comments', async () => {
    const client_jwt = getClient(userOne.jwt);

    const variables ={
        id: commentTwo.comment.id
    };

    await expect(
        client_jwt.mutate({ mutation: deleteComment, variables })
    ).rejects.toThrow();

});
// done for asynch function
test('Should subscribe to comments for a post', async done => {
    const variables = {
        postId: postOne.post.id
    };

    //  - subscribe: use "query" because once the comment is posted
    //      it immediately fetch the data.
    //  - no use promise here. Because prommise is just for single time and single value.
    //      we need to use subscribe's own chanin function "subscrible"
    //      to setup callback that will be fired off whenever new comment is posted 
    //  - In this case, without promise, it is simply async function
    //      Therefore, it is fired off after global functions and variables are memorized.
    //  - Solution is "done" for asynchronous function.
    client.subscribe({ query: subscribeToComments, variables }).subscribe({
        next(response) {

            // Assertion
            // For instance,
            // It is fired off after prisma.mutation down below is done
            // Therefore, 
            // expect(1).toBe(2); // It is not recognized by Jest because async function.
            
            // It is run after prisma.mutation.deleteComment down below.
            // As define in subscribe, the subscribe is updated for every single mutations 
            //  (DELETED, CREATED, UPDATED)
            expect(response.data.comment.mutation).toBe('DELETED')
            
            // now when we use done(), it runs now before the function goes to the next line
            // Therefore prisma.mutation is fired off after this asyn function.
            done(); // for asycn function, done() marks that "It runs bfore running next line
        }

    })

    // Change a comment
    await prisma.mutation.deleteComment({ where: { id: commentOne.comment.id }});
});


