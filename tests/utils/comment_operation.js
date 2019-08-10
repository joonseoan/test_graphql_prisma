import { gql } from 'apollo-boost';

export const getComments = gql `
    query {
        comments {
            text
            author {
                id
            }
            post {
                id
            }
        }
    }
`;

export const deleteComment = gql `
   mutation($id: ID!) {
       deleteComment(id: $id) {
           id
           text
           author {
               id
               name
               email
           }
       }
   }
`;

export const subscribeToComments = gql `
    subscription ($postId: ID!) {
        comment(postId: $postId) {
            mutation
            node {
                id
                text
            }
        }
    }
`;

