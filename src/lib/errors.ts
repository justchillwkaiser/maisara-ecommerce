/**
 * Error seragam untuk aplikasi Maisara.
 * Rujukan: API.md section 8 (error codes).
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
