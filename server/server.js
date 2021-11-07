const express = require('express');
const path = require('path');

// create a new Apollo server and pass in schema data
const { ApolloServer } = require('apollo-server-express');

const { authMiddleware } = require('./utils/auth');

// import typeDefs & resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => {

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  // start the apollo server
  await server.start();

  // integrate the Apollo server with the express application as middleware
  server.applyMiddleware({ app });

  // // log where to go to test the GQL API
  // console.log(`User GraphQL at http://localhost:${PORT}${server.graphqlPath}`)
};

// initialize the Apollo server
startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build'));
// });

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});