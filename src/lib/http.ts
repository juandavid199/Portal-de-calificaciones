import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HttpError, type DetalleError } from './errores';

export function respuestaJson<T>(data: T, status = 200, headersInit?: HeadersInit): Response {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json; charset=utf-8',
      ...headersInit,
    },
  });
}

export function respuestaError(status: number, mensaje: string, detalles?: DetalleError[]): Response {
  return NextResponse.json(
    {
      error: mensaje,
      ...(detalles && detalles.length > 0 ? { detalles } : {}),
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function manejar(handler: (...args: any[]) => Promise<Response>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (...args: any[]): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const detalles: DetalleError[] = err.errors.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message,
        }));
        return respuestaError(400, 'Error de validación', detalles);
      }

      if (err instanceof HttpError) {
        return respuestaError(err.status, err.message, err.detalles);
      }

      // Error no controlado: Registrar sin exponer secretos ni trazas internas al cliente
      console.error('Error interno no controlado en Route Handler:', err);
      return respuestaError(500, 'Error interno del servidor');
    }
  };
}

