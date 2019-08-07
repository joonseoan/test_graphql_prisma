import { gql } from 'apollo-boost';


// 2) Variable setup
export const createUser = gql `
    mutation ($data: createUserInput!) {
        createUser(
            data: $data
        ) {
            token,
            user {
                id
                name
                email
            }
        }
    }
`;

export const getUsers = gql `
    query {
        users {
            id
            name
            email
        }
    }
`;

export const login = gql `
    mutation ($data: loginInput!) {
        login(
            data: $data
        ) {
            token
            user {
                id
                name
                email
            }
        }
    }
`;

export const getProfile = gql `
    query {
        me {
            id
            name
            email
        }
    }
`;