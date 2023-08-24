// import { ApolloServer } from "apollo-server-";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./schema.js";
import express from "express";

const server = new ApolloServer({typeDefs, resolvers});
const app = express();

app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    res.on("finish", () => {
      console.log(`Response status: ${res.statusCode}`);
    });
    next();
  });

async function startApolloServer() {
    await server.start();
    server.applyMiddleware({ app });
  
    const PORT =  4242;    //process.env.PORT || 4000;
  
    app.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  }
  
startApolloServer();

// server.listen().then(({ url })=> {
//     console.log(`Server ready at ${url}`)
// });

