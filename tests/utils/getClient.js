import  ApolloBoost from 'apollo-boost';

export default jwt => {
    return new ApolloBoost({
        uri: 'http://localhost:4000',
        // "Authorization": `Bearer ${jwt}`
        // like request in graphQL yoga
        request(operation) {
            if(jwt) {
                //setting context property like yoga
                operation.setContext({
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                })
            }
        }
    });
}