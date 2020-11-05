import {match as generateMatcher, Path} from 'path-to-regexp'
import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'
import {JSONSchema6Object as Schema} from 'json-schema'
import Errors from './Errors'

type Returnable = Record<string, unknown> | string | number | void
type PathParams = Record<string, unknown>
export type Response = Promise<Returnable> | Returnable
export type ErrorFn = (error: Error) => Response
export type HandlerFn = (pathParams: PathParams) => Response
type Route = {
  pattern: Path
  handler: HandlerFn
  schema?: Schema
  onError?: ErrorFn
}

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  jsonPointers: true,
})
ajvErrors(ajv)

const matchUriAgainstPattern = (pattern: Path, uri: string) =>
  generateMatcher<PathParams>(pattern, {decode: decodeURIComponent})(
    uri
  )
const validateParams = (schema: Schema, params: PathParams) =>
  ajv.validate(schema, params)

export default class Lambrusco {
  private routes: Route[] = []

  private onErrors: ErrorFn
  private doesPatternExist(route: Route): boolean {
    return (
      this.routes.findIndex(
        ({pattern}) => pattern === route.pattern
      ) >= 0
    )
  }

  constructor(options: {onErrors?: ErrorFn; routes: Route[]}) {
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

  private findMatchingRoute(uri: string): Route | undefined {
    return this.routes.find(x =>
      matchUriAgainstPattern(x.pattern, uri)
    )
  }

  async handle(uri: string): Promise<Response> {
    const routeFound = this.findMatchingRoute(uri)

    try {
      if (!routeFound)
        throw new Errors.NotFoundError(`No route matching uri ${uri}`)
      const match = matchUriAgainstPattern(routeFound.pattern, uri)
      if (!match)
        throw new Errors.NotFoundError(
          `No matching params found on uri ${uri}`
        )

      if (routeFound.schema) {
        const valid = validateParams(routeFound.schema, match.params)
        if (!valid) throw new Errors.ValidationError(ajv.errorsText())
      }

      return await routeFound.handler(match.params)
    } catch (error) {
      if (routeFound?.onError) return routeFound.onError(error)
      if (this.onErrors) return this.onErrors(error)
      throw error
    }
  }
}
