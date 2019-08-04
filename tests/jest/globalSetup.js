// Keep in mind that
//  The Jest global does not go throught "babel"
// Therefore we need to use the legacy file concontrol

// import babel based file
require('babel-register');
// for production's postbuild in heroku
require('@babel/polyfill/noConflict');

// user server to implement prisma and database
// "default" is used only to make sure compatibility between import export and require
const server = require('../../src/server').default;

module.exports = async () => {
    // make it global to be accessed in globalTearDown.js
    // now httpServer can be accessed by any other files
   global.httpServer = await server.start({ port: 4000 });
}