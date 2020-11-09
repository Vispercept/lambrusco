import Errors from './Errors'
import Route, { ErrorFn, RouteOptions, Res } from './Route'

export type PathParams = Record<string, unknown>

export default class Lambrusco {
  private routes: Route[] = []
  private onErrors: ErrorFn

  constructor(options: { onErrors?: ErrorFn; routes: RouteOptions[] }) {
    if (options.onErrors) this.onErrors = options.onErrors
    options.routes.forEach((route) => this.route(route))
  }

  private doesPatternExist(route: RouteOptions): boolean {
    return (
      this.routes.findIndex(({ pattern }) => pattern === route.pattern) >= 0
    )
  }

  private findMatchingRoute(uri: string): Route | undefined {
    return this.routes.find((route) => route.hasMatchingPattern(uri))
  }

  route(route: RouteOptions): void {
    if (this.doesPatternExist(route)) {
      throw new Error(`A route with pattern ${route.pattern} already exists.`)
    }
    this.routes.push(new Route(route))
  }

  async handle(uri: string): Promise<Res> {
    const routeFound = this.findMatchingRoute(uri)

    try {
      if (!routeFound)
        throw new Errors.NotFoundError(`No route matching uri ${uri}`)
      return await routeFound.handle(uri)
    } catch (error) {
      if (routeFound?.hasErrorHandler()) return routeFound.handleError(error)
      if (this.onErrors) return this.onErrors(error)
      throw error
    }
  }
}
