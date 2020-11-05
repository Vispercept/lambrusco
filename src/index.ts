import {match as generateMatcher, Path} from 'path-to-regexp'
import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'
import {JSONSchema6Object as Schema} from 'json-schema'
import Errors from './Errors'

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  jsonPointers: true,
})
ajvErrors(ajv)

export type Response = Record<string, unknown> | string | number
type PathParams = Record<string, unknown>

const matchUriAgainstPattern = (pattern: Path, uri: string) =>
  generateMatcher<PathParams>(pattern, {decode: decodeURIComponent})(
    uri
  )
const validateParams = (schema: Schema, params: PathParams) =>
  ajv.validate(schema, params)

type Route = {
  pattern: Path
  handler: (pathParams: PathParams) => Promise<Response>
  schema?: Schema
  onError?: (error: Error) => Promise<Response>
}

export default class Lambrusco {
  private routes: Route[] = []

  private onErrors: (error: Error) => Promise<Response>

  doesPatternExist(route: Route): boolean {
    return (
      this.routes.findIndex(
        ({pattern}) => pattern === route.pattern
      ) > 0
    )
  }

  constructor(
    options: {
      onErrors?: (error: Error) => Promise<Response>
      routes: Route[]
    } = {routes: []}
  ) {
    if (options.onErrors) this.onErrors = options.onErrors
    options.routes.forEach(route => {
      if (this.doesPatternExist(route)) {
        throw new Error(
          `A route with pattern ${route.pattern} already exists.`
        )
      }
      this.routes.push(route)
    })
  }

  route(route: Route): void {
    if (this.doesPatternExist(route)) {
      throw new Error(
        `A route with pattern ${route.pattern} already exists.`
      )
    }
    this.routes.push(route)
  }

  private findRoute(uri: string): Route | undefined {
    return this.routes.find(x =>
      matchUriAgainstPattern(x.pattern, uri)
    )
  }

  async handle(uri?: string): Promise<Response> {
    if (!uri) return

    const routeFound = this.findRoute(uri)

    try {
      if (!routeFound)
        throw new Errors.NotFoundError(`No route matching uri ${uri}`)
      const match = matchUriAgainstPattern(routeFound.pattern, uri)
      if (!match) return

      if (routeFound.schema) {
        const valid = validateParams(routeFound.schema, match.params)
        if (!valid) throw new Errors.ValidationError(ajv.errorsText())
      }

      return routeFound.handler(match.params)
    } catch (error) {
      if (routeFound?.onError) return routeFound.onError(error)
      if (this.onErrors) return this.onErrors(error)
      throw error
    }
  }
}

// const app = new Lambrusco({
//   onErrors: async (error: Error): Promise<Response> => {
//     console.error('global err:', error.message)
//     return {x: 'bye bye'};
//   },
//   routes: [
//     {
//       pattern: '/user/:user/:id',
//       schema: {
//         type: 'object',
//         title: 'path schema',
//         required: ['user'],
//         properties: { user: { type: 'number' } },
//         errorMessage: 'mist',
//       },
//       handler: async (x: {user: string, id: string} ): Promise<Response> => {
//         console.log('user:', x.user, 'id', x.id)
//         return {x: 'bye bye'};
//       },

//       onError: async (error: Error): Promise<Response> => {
//         console.error('ERROR:', error.message)
//         return {x: 'bye bye'};
//       },
//     },
//     {
//       pattern: '/book/:title',
//       handler: async (x: {title: string}): Promise<Response> => {
//         console.log('book:', x.title)
//         return {x: 'bye bye'};
//       },
//       onError: async (error: Error): Promise<Response> => {
//         console.error(error.message)
//         return {x: 'bye bye'};
//       }
//     },
//     {
//       pattern: '/error/:number',
//       schema: {
//         type: 'object',
//         title: 'path schema',
//         required: ['number'],
//         properties: { number: { type: 'number' } },
//         errorMessage: 'my err',
//       },
//       handler: async (x: {title: string}): Promise<Response> => {
//         console.log('onerr', x)
//         return {x: 'bye bye'};
//       },
//     },
//   ],
// })

// app.handle('/user/thomas/123')
// app.handle('/book/fast')
// app.handle('/error/abc')
// app.handle('/nixgibts')
