import 'cross-fetch/polyfill';

import prisma from '../src/prisma';
import seedDatabase, { userOne, commentOne, commentTwo } from './utils/seedDatabase';
import { getComments, deleteComment } from './utils/comment_operation';
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