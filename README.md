# lambrusco

A helper for matching uris agains pathpatterns, validate the results using a json-schema and call a handler.

Define patterns, schemata and a handler. When lambrusco.handle is called it will search for a matching pattern, validates all found properties if a schema is passed. If schema validation passes the handler function will be called. If schema validation has errors the onError function will be called.

  + pattern: a pattern used by [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
  + schema: a json-schema wich is validated by [ajv](https://github.com/epoberezkin/ajv)

## Usage

### Simple handler

```js
const lambrusco = require('lambrusco');

lambrusco.route({
  pattern: '/:user',
  handler: async ({ user }) => {
    console.log('user:', user);
    // user: Kaoma
  }
});

// request yourdomain.com/Kaoma
async function handler(event, context) {
  // triggered by cloudfront as @edge lambda
  const request = event.Records[0].cf.request;
  await lambrusco.handle(`${request.uri}?${request.queryString}`);
};

exports.handler = handler;
```

### Handler with schema

```js
const lambrusco = require('lambrusco');

lambrusco.route({
  pattern: '/:user',
  schema: {
    type: 'object',
    title: 'path schema',
    required: ['user'],
    properties: { user: { type: 'string' } }
  },
  handler: async ({ user }) => {
    console.log('user:', user);
    // user: Kaoma
  }
});

// request yourdomain.com/Kaoma
async function handler(event, context) {
  // triggered by cloudfront as @edge lambda
  const request = event.Records[0].cf.request;
  await lambrusco.handle(`${request.uri}?${request.queryString}`);
};

exports.handler = handler;
```


### Error Handler

```js
const lambrusco = require('lambrusco');

lambrusco.route({
  pattern: '/:counter',
  schema: {
    type: 'object',
    title: 'path schema',
    required: ['counter'],
    properties: { counter: { type: 'number' } }
  },
  onError: (err, uri) => console.error(err, uri),
  // ValidationError: /:counter: counter should be number aadfadfasdfasdf
  handler: async () => { /* won't reach this */ }
});

// request yourdomain.com/aadfadfasdfasdf
async function handler(event, context) {
  // triggered by cloudfront as @edge lambda
  const request = event.Records[0].cf.request;
  await lambrusco.handle(`${request.uri}?${request.queryString}`);
};

exports.handler = handler;
```
