import { match as generateMatcher, MatchFunction, Path } from 'path-to-regexp'
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

export default class Route {
  public pattern: Path
  private handler: HandlerFn
  private errorFn?: ErrorFn
  private validate?: Ajv.ValidateFunction
  // private matcher
  private matcher: MatchFunction

  constructor(options: RouteOptions) {
    this.pattern = options.pattern
    this.matcher = generateMatcher<PathParams>(options.pattern, { decode: decodeURIComponent })
    this.handler = options.handler
    if (options.errorFn) this.errorFn = options.errorFn
    if (options.schema) this.validate = ajv.compile(options.schema)
  }

  private shouldValidateParams(): boolean {
    return this.validate != undefined
  }

  private handleError(error: Error): Res {
    if (!this.errorFn) throw error
    return this.errorFn(error)
  }

  public hasMatchingPattern(uri: string): boolean {
    return this.matcher(uri) !== false
  }

  public handle(uri: string): Res {
    try {
      const match = this.matcher(uri)
      if (!match)
        throw new Errors.NotFoundError(`No matching params found on uri ${uri}`)

      if (this.shouldValidateParams()) {
        const valid = this.validate(match.params)
        if (!valid) throw new Errors.ValidationError(ajv.errorsText(this.validate.errors))
      }

      return this.handler(match.params as PathParams)
    } catch (error) {
      this.handleError(error)
    }
  }
}
