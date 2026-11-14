'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BotonVolver } from '@/components/common/BotonVolver';
import type { RolUsuario } from '@/lib/auth';

interface UsuarioItem {
  uid: string;
  correo: string;
  nombre: string;
  rol: RolUsuario;
  creadoEn: string;
}

const USUARIOS_DEMO_INICIALES: UsuarioItem[] = [
  {
    uid: 'demo-docente',
    correo: 'docente@portal.edu.co',
    nombre: 'Prof. Carlos Mendoza',
    rol: 'docente',
    creadoEn: '2026-11-14T10:00:00.000Z',
  },
  {
    uid: 'demo-estudiante',
    correo: 'estudiante@portal.edu.co',
    nombre: 'Ana Sofía Gómez',
    rol: 'estudiante',
    creadoEn: '2026-11-14T10:05:00.000Z',
  },
  {
    uid: 'demo-admin',
    correo: 'admin@portal.edu.co',
    nombre: 'Administrador Principal',
    rol: 'admin',
    creadoEn: '2026-11-14T09:00:00.000Z',
  },
];

export default function PaginaAdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(USUARIOS_DEMO_INICIALES);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<RolUsuario>('docente');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Cargar usuarios desde la API
  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch('/api/admin/usuarios', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.usuarios) && data.usuarios.length > 0) {
            setUsuarios(data.usuarios);
          }
        }
      } catch {
        // En entorno local o sin conexión usa la lista inicial
      }
    }
    cargar();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!nombre.trim() || !correo.trim() || !contrasena.trim()) {
      setMensaje({ tipo: 'error', texto: 'Todos los campos son obligatorios.' });
      return;
    }

    if (contrasena.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          contrasena: contrasena.trim(),
          rol,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el usuario');
      }

      const nuevo: UsuarioItem = data.usuario || {
        uid: `usr-${Date.now()}`,
        correo: correo.trim(),
        nombre: nombre.trim(),
        rol,
        creadoEn: new Date().toISOString(),
      };

      setUsuarios((prev) => [nuevo, ...prev]);
      setNombre('');
      setCorreo('');
      setContrasena('');
      setMensaje({
        tipo: 'exito',
        texto: `Usuario "${nuevo.nombre}" (${nuevo.correo}) con rol ${nuevo.rol} creado exitosamente.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario';
      setMensaje({ tipo: 'error', texto: msg });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-admin-usuarios">
      {/* Navegación y Botones de Retroceso */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <nav aria-label="Ruta de navegación (Miga de pan)">
          <ol
            style={{
              display: 'flex',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b',
            }}
          >
            <li>
              <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
                Inicio
              </Link>
              <span aria-hidden="true" style={{ margin: '0 0.5rem' }}>
                /
              </span>
            </li>
            <li>
              <Link href="/admin/cursos" style={{ color: '#2563eb', textDecoration: 'none' }}>
                Administración
              </Link>
              <span aria-hidden="true" style={{ margin: '0 0.5rem' }}>
                /
              </span>
            </li>
            <li aria-current="page" style={{ fontWeight: 600, color: '#0f172a' }}>
              Gestión de usuarios
            </li>
          </ol>
        </nav>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <BotonVolver href="/admin/cursos" texto="Volver a Cursos" />
          <BotonVolver href="/" texto="Volver al Inicio" />
        </div>
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="titulo-admin-usuarios"
          style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}
        >
          Creación y gestión de usuarios
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          Registre nuevos usuarios en Firebase Authentication, asigne sus roles inmutables y
          vincúlelos a la base de datos de Firestore.
        </p>
      </header>

      {/* Notificación accesible */}
      {mensaje && (
        <div
          role={mensaje.tipo === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          style={{
            padding: '1rem',
            backgroundColor: mensaje.tipo === 'error' ? '#fef2f2' : '#ecfdf5',
            color: mensaje.tipo === 'error' ? '#991b1b' : '#065f46',
            border: `1px solid ${mensaje.tipo === 'error' ? '#fecaca' : '#a7f3d0'}`,
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario accesible de creación */}
      <form
        onSubmit={handleCrearUsuario}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#1e293b' }}>
          Registrar nuevo usuario
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <label
              htmlFor="nombre-usuario"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}
            >
              Nombre completo
            </label>
            <input
              id="nombre-usuario"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Dra. Luisa Ortega"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                minHeight: '2.75rem',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="correo-usuario"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}
            >
              Correo institucional
            </label>
            <input
              id="correo-usuario"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@portal.edu.co"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                minHeight: '2.75rem',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="contrasena-usuario"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}
            >
              Contraseña inicial
            </label>
            <input
              id="contrasena-usuario"
              type="password"
              required
              minLength={6}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                minHeight: '2.75rem',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="rol-usuario"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}
            >
              Rol en la plataforma
            </label>
            <select
              id="rol-usuario"
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                minHeight: '2.75rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="docente">👨‍🏫 Docente (Gestiona notas y porcentajes)</option>
              <option value="estudiante">👨‍🎓 Estudiante (Consulta notas y definitivos)</option>
              <option value="admin">🛡️ Administrador (Control total del portal)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          style={{
            padding: '0.625rem 1.5rem',
            backgroundColor: guardando ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: guardando ? 'not-allowed' : 'pointer',
            minHeight: '2.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {guardando ? 'Creando usuario en Firebase...' : 'Crear usuario en el sistema'}
        </button>
      </form>

      {/* Listado de usuarios creados */}
      <section aria-labelledby="titulo-lista-usuarios">
        <h2 id="titulo-lista-usuarios" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          Usuarios registrados ({usuarios.length})
        </h2>

        <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '0.5rem', backgroundColor: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <caption className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
              Lista de usuarios y sus roles asignados
            </caption>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>
                  Nombre
                </th>
                <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>
                  Correo electrónico
                </th>
                <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>
                  Rol asignado
                </th>
                <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>
                  Identificador (UID)
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.uid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                    {u.nombre}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    {u.correo}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor:
                          u.rol === 'admin' ? '#fef3c7' : u.rol === 'docente' ? '#dbeafe' : '#dcfce7',
                        color:
                          u.rol === 'admin' ? '#92400e' : u.rol === 'docente' ? '#1e40af' : '#166534',
                      }}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                    {u.uid}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
