export class AppError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "AppError"
    this.status = status
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong."
}

export function getErrorStatus(error: unknown) {
  return error instanceof AppError ? error.status : 500
}
