import { NextResponse } from 'next/server';
import { manejar } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';
import { crearUsuarioSchema } from '@/schemas/usuario.schema';
import { registrarNuevoUsuario, obtenerUsuariosSistema } from '@/services/usuarioService';

/**
 * POST /api/admin/usuarios
 * Permite al Administrador dar de alta docentes, estudiantes y administradores en Firebase Auth y Firestore.
 */
export const POST = manejar(async (request: Request) => {
  // Exigir exclusivamente rol admin
  await requerirUsuario(request, ['admin']);

  const body = await request.json();
  const datosValidados = crearUsuarioSchema.parse(body);

  const usuario = await registrarNuevoUsuario(datosValidados);

  return NextResponse.json(
    {
      mensaje: 'Usuario creado exitosamente.',
      usuario,
    },
    { status: 201 }
  );
});

/**
 * GET /api/admin/usuarios
 * Retorna la lista de usuarios del sistema registrados en Firestore.
 */
export const GET = manejar(async (request: Request) => {
  await requerirUsuario(request, ['admin']);

  const usuarios = await obtenerUsuariosSistema();

  return NextResponse.json({ usuarios }, { status: 200 });
});

