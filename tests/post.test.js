import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';

import seedDatabase, { userOne } from './utils/seedDatabase';
import getClient from './utils/getClient';

const client = getClient();

beforeEach(seedDatabase);

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

test('Should fetch my post with authentication', async () => {
    const client = getClient(userOne.jwt);
    const myPosts = gql `
        query {
           myPosts {
               title
               body
               published
           } 
        }
    `;
    const { data } = await client.query({ query: myPosts });
    expect(data.myPosts.length).toBe(2);

})