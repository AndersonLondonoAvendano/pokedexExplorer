// Typed errors thrown by the services. Callers branch on the error type
// (not on its message), so the UI can pick its own Spanish text and never
// shows technical details to the user. Messages are for developers only.

// The requested resource does not exist (HTTP 404). For a search this means
// "no results", not a failure.
export class NotFoundError extends Error {
  constructor(message = 'Resource not found (HTTP 404)') {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Any other non-successful HTTP response. Keeps the status code so the cause
// can be diagnosed without exposing it on screen.
export class HttpError extends Error {
  constructor(status, message = `Request failed with HTTP ${status}`) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// A cancelled request rejects with an error named 'AbortError'. It is an
// expected outcome (a newer request replaced it or the view went away), so
// callers use this check to ignore it instead of showing an error state.
export function isAbortError(error) {
  return error?.name === 'AbortError';
}
