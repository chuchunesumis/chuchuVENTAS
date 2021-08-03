const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

// Conectar a la base de datos
conectarDB();

// servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => {
    // console.log(req.headers['authorization']);

    // console.log(req.headers);

    const token = req.headers['authorization'] || '';
    if(token) {
      try {
        const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA )
        // console.log(usuario);
        return {
          usuario
        }
      } catch (error) {
        if (error.message === "jwt expired") {
          console.log('Hubo un error:', error.message);
        } else {
          console.log('Hubo un error:', error);
        }
        
      }
    }
  }
});


// Iniciar el servidor
server.listen({ port: process.env.PORT || 5000 }).then( ({url}) => {
    console.log(`Servidor listo en la URL ${url}`);
})