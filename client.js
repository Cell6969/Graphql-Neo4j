import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const client = new ApolloClient({
    uri: "http://localhost:4000/graphql",
    cache: new InMemoryCache()
});

const INTROSPECTION_QUERY = gql `
    query IntrospectionQuery {
        __schema {
        types {
            name
            kind
        }
        }
    }
`;
// Fetch and log Introspection data
client.query({
    query: INTROSPECTION_QUERY,
}).then(result => {
    const introspectionData = result.data.__schema;
    console.log(introspectionData);
})