import { crearUsuarioSchema, type CrearUsuarioInput } from '@/schemas/usuario.schema';
import {
  crearUsuarioAdmin,
  listarUsuariosAdmin,
  type UsuarioDoc,
} from '@/repositories/usuarioRepository';

export async function registrarNuevoUsuario(datos: CrearUsuarioInput): Promise<UsuarioDoc> {
  const datosValidados = crearUsuarioSchema.parse(datos);
  return await crearUsuarioAdmin(datosValidados);
}

export async function obtenerUsuariosSistema(): Promise<UsuarioDoc[]> {
  return await listarUsuariosAdmin();
}
