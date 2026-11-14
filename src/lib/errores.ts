export interface DetalleError {
  campo: string;
  mensaje: string;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly detalles?: DetalleError[];

  constructor(status: number, message: string, detalles?: DetalleError[]) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.detalles = detalles;
  }
}

export class ValidationError extends HttpError {
  constructor(detalles: DetalleError[], message = 'Error de validación') {
    super(400, message, detalles);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'No autenticado. Se requiere una sesión válida.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'No tiene permisos suficientes para realizar esta acción.') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'El recurso solicitado no fue encontrado.') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
    this.name = 'ConflictError';
  }
}

