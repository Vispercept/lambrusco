const Lambrusco = require('lambrusco');
const app = new Lambrusco({
  routes: [{
    pattern: '/:user',
    handler: ({ user }) => `User: "${user}"`,
  }]
});

exports.handler = async function handler(event, context) {
  const request = event.request;
  return await app.handle(`${request.uri}`)
}

// test-event
// {
//   "request": {
//     "uri": "/Kaoma"
//   }
// }
