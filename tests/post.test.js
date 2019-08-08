import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';

import prisma from '../src/prisma';
import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase';
import { getPosts, myPosts, createPost, updatePost, deletePost } from './utils/post_operations';
import getClient from './utils/getClient';

const client = getClient();

beforeEach(seedDatabase);

test('should return published post only', async () => {

    const response = await client.query({ query: getPosts });
    expect(response.data.posts.length).toBe(1);
    expect(response.data.posts[0].published).toBe(true);
    
});

test('Should fetch my post with authentication', async () => {
    const client = getClient(userOne.jwt);
    const { data } = await client.query({ query: myPosts });
    expect(data.myPosts.length).toBe(2);

});

test('Should be able to create a new post', async () => {
    const client = getClient(userOne.jwt);
    const title = 'New Post';
    const body = 'This must be indentical with test result';
    const published = true
    
    const variables = {
        data: {
            title,
            body,
            published
        }
    }

    // Without Variables
    // Important to use "${}" in apollo client
    // const createPost = gql `
    //     mutation {
    //         createPost(
    //             data: {
    //                 title: "${title}"
    //                 body: "${body}"
    //                 published: true   
    //             }
    //         ) {
    //             id
    //             title
    //             body
    //             published
    //             author {
    //                 id
    //             }
    //         }
    //     }
    // `;

    // const { data } = await client.mutate({ mutation: createPost });

    const { data } = await client.mutate({ mutation: createPost, variables });
    const exist = await prisma.exists.Post({ id: data.createPost.id, published: true });
    expect(data.createPost.author.id).toBe(userOne.user.id);
    expect(data.createPost.title).toBe(title);
    expect(data.createPost.body).toBe(body);
    expect(exist).toBe(true);

});

test('Should be able to update own post', async () => {
    const client = getClient(userOne.jwt);
    const title = 'Updated Title';
    const body = 'Updated Body';
    const published = false;
    
    const variables = {
        id: postOne.post.id,
        data: {
            title,
            body,
            published
        }
    };

    const { data } = await client.mutate({ mutation: updatePost, variables });

    // const updatePost = gql `
    //     mutation {
    //         updatePost(
    //             id: "${postOne.post.id}"
    //             data: {
    //                 title: "${title}"
    //                 body: "${body}"
    //                 published: false
    //             }
    //         ) {
    //             id
    //             title
    //             body
    //             published
    //         }
    //     }
    // `;

    // const { data } = await client.mutate({ mutation: updatePost });
    const exist = await prisma.exists.Post({ id: postOne.post.id, published: false});
    expect(data.updatePost.title).toBe(title);
    expect(data.updatePost.body).toBe(body);
    expect(data.updatePost.published).toBe(false);
    expect(exist).toBe(true);

});

test('Should delete the designated post', async () => {
    const client = getClient(userOne.jwt);

    const variables = {
        id: postTwo.post.id
    }
    const { data } = await client.mutate({ mutation: deletePost, variables });
    
    
    // const deletePost = gql `
    //     mutation {
    //         deletePost (
    //             id: "${postTwo.post.id}"
    //         ) {
    //             id
    //             title
    //             author {
    //                 id
    //             }
    //         }
    //     }
    // `;

    // const { data } = await client.mutate({ mutation: deletePost });

    // must verification here
    const exist = await prisma.exists.Post({ id: postTwo.post.id });
    expect(data.deletePost.id).toBe(postTwo.post.id);
    expect(data.deletePost.author.id).toBe(userOne.user.id);
    expect(exist).toBe(false);
})