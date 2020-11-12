# lambrusco

A helper for matching uris agains pathpatterns, validate the results using a json-schema and call a handler.

Define patterns, schemata and a handler. When lambrusco.handle is called it will search for a matching pattern, validates all found properties if a schema is passed. If schema validation passes the handler function will be called. If schema validation has errors the onError function will be called.

- pattern: a pattern used by [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
- schema: a json-schema wich is validated by [ajv](https://github.com/epoberezkin/ajv)

## Usage

### Simple handler

```ts
import Lambrusco from 'lambrusco'

const app = new Lambrusco({
  routes: [
    {
      pattern: '/:user',
      handler: ({ user: any }) => `User: "${user}"`,
    },
  ],
})

// request yourdomain.com/Kaoma
exports.handler = async function handler(event, context) {
  // triggered by cloudfront as @edge lambda
  const request = event.Records[0].cf.request
  return await app.handle(`${request.uri}?${request.queryString}`)
  // returns `User: "Kaoma"`
}
```

### Handler with schema

```ts
import Lambrusco from 'lambrusco'

const app = new Lambrusco({
  routes: [
    {
      pattern: '/:user/:update',
      schema: {
        type: 'object',
        title: 'path schema',
        required: ['user'],
        properties: { user: { type: 'string' }, update: { type: 'boolean' } },
      },
      handler: (opts: { user: string; update: boolean }) =>
        opts.update ? `User: "${opts.user}"` : 'none',
    },
  ],
})

// request yourdomain.com/Kaoma/true
exports.handler = async function handler(event, context) {
  // triggered by cloudfront as @edge lambda
  const request = event.Records[0].cf.request
  return await app.handle(`${request.uri}?${request.queryString}`)
  // returns `User: "Kaoma"`
}
```

### Error Handler

```ts
import Lambrusco from 'lambrusco'

const app = new Lambrusco({
  routes: [
    {
      pattern: '/:user/:update',
      schema: {
        type: 'object',
        title: 'path schema',
        required: ['user'],
        properties: { user: { type: 'string' }, update: { type: 'boolean' } },
      },
      errorFn: (err: Error) => {
        console.log(Error)
        return Error.message
      }
      handler: (opts: { user: string; update: boolean }) =>
        opts.update ? `User: "${opts.user}"` : 'none',
    },
  ],
})

// request yourdomain.com/Kaoma/not-a-boolean
exports.handler = async function handler(event, context) {
  // triggered by cloudfront as @edge lambda
  const request = event.Records[0].cf.request
  return await app.handle(`${request.uri}?${request.queryString}`)
  // logs and returns: ValidationError: data/update should be boolean
}
```
