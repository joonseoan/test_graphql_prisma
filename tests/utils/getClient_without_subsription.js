import  ApolloBoost from 'apollo-boost';


// apollo-boost does not automatically support websocket (subscriptio) !
//  even though apollo-boost supports many apollo library behind the scene.
// However, apollo-boost provides a method to add new apollo objects
//  and in result, we can add the subscription library to apollo-boost.
// The new subscription library : "apollo-link-ws"

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