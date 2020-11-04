export default class NotFoundError extends Error {
  constructor(error: string) {
    super(error)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
export const isNotFoundError = (err: Error): boolean => err instanceof NotFoundError
