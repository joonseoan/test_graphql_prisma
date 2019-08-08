import { gql } from 'apollo-boost';

export const getPosts = gql `
    query {
        posts {
            id
            title
            body
            published
        }
    }
`;

export const myPosts = gql `
    query {
        myPosts {
            title
            body
            published
        } 
    }
`;

export const createPost = gql `
    mutation ($data: createPostInput!) {
        createPost(
            data: $data
        ) {
            id
            title
            body
            published
            author {
                id
            }
        }
    }
`;

export const updatePost = gql `
    mutation ($id: ID!, $data: updatePostInput) {
        updatePost(
            id: $id
            data: $data
        ) {
            id
            title
            body
            published
        }
    }
`;

export const deletePost = gql `
    mutation ($id: ID!) {
        deletePost (
            id: $id
        ) {
            id
            title
            author {
                id
            }
        }
    }
`;

    

