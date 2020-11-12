export default class ValidationError extends Error {
  constructor(error: string) {
    super(error)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
export const isValidationError = (err: Error): boolean => err instanceof ValidationError
