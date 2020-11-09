import { match as generateMatcher, Path } from 'path-to-regexp'
import { JSONSchema6Object as Schema } from 'json-schema'
import Errors from './Errors'
import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  jsonPointers: true,
})
ajvErrors(ajv)

type Returnable = Record<string, unknown> | string | number | void
export type Res = Promise<Returnable> | Returnable

export type PathParams = Record<string, unknown>
export type ErrorFn = (error: Error) => Res
export type HandlerFn = (pathParams: PathParams) => Res
export type RouteOptions = {
  pattern: Path
  handler: HandlerFn
  errorFn?: ErrorFn
  schema?: Schema
}

const matchUriAgainstPattern = (pattern: Path, uri: string) =>
  generateMatcher<PathParams>(pattern, { decode: decodeURIComponent })(uri)

const validateParams = (schema: Schema, params: PathParams) =>
  ajv.validate(schema, params)

export default class Route {
  public pattern: Path
  private handler: HandlerFn
  private errorFn?: ErrorFn
  private schema?: Schema

  constructor(options: RouteOptions) {
    this.pattern = options.pattern
    this.handler = options.handler
    if (options.errorFn) this.errorFn = options.errorFn
    if (options.schema) this.schema = options.schema
  }

  private hasSchema(): boolean {
    return this.schema != undefined
  }

  public hasMatchingPattern(uri: string): boolean {
    return matchUriAgainstPattern(this.pattern, uri) !== false
  }

  public hasErrorHandler(): boolean {
    return this.errorFn != undefined
  }

  public handle(uri: string): Res {
    const match = matchUriAgainstPattern(this.pattern, uri)
    if (!match)
      throw new Errors.NotFoundError(`No matching params found on uri ${uri}`)

    if (this.hasSchema()) {
      const valid = validateParams(this.schema, match.params)
      if (!valid) throw new Errors.ValidationError(ajv.errorsText())
    }

    return this.handler(match.params)
  }

  public handleError(error: Error): Res {
    return this.errorFn(error)
  }
}
