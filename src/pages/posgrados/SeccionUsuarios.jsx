import React, { useState } from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const ROLES = ['Todos', 'ESTUDIANTE', 'DIRECTOR', 'DEPENDENCIA', 'POSGRADOS'];

const USUARIOS_MOCK = [
  { cedula: '1098765432', nombre: 'Juan Perez',          rol: 'ESTUDIANTE',  programa: 'M. Gerencia de Empresas',                  correo: 'juan.perez@ufps.edu.co',    activo: true  },
  { cedula: '1098765435', nombre: 'Laura Gomez',         rol: 'ESTUDIANTE',  programa: 'M. Gerencia de Empresas',                  correo: 'laura.gomez@ufps.edu.co',   activo: true  },
  { cedula: '1098765440', nombre: 'Ana Torres',          rol: 'ESTUDIANTE',  programa: 'M. TIC aplicadas a la Educación',          correo: 'ana.torres@ufps.edu.co',    activo: true  },
  { cedula: '1098765433', nombre: 'Maria Director',      rol: 'DIRECTOR',    programa: 'M. Gerencia de Empresas',                  correo: 'maria.dir@ufps.edu.co',     activo: true  },
  { cedula: '3000000001', nombre: 'Biblioteca Central',  rol: 'DEPENDENCIA', programa: '—',                                        correo: 'biblioteca@ufps.edu.co',    activo: true  },
  { cedula: '3000000003', nombre: 'Admisiones y Registro', rol: 'DEPENDENCIA', programa: '—',                                      correo: 'admisiones@ufps.edu.co',    activo: true  },
  { cedula: '1098765434', nombre: 'Coordinador Posgrados', rol: 'POSGRADOS', programa: '—',                                        correo: 'posgrados@ufps.edu.co',     activo: true  },
  { cedula: '1098765499', nombre: 'Carlos Egresado',     rol: 'ESTUDIANTE',  programa: 'M. Educación Matemáticas',                 correo: 'carlos.eg@ufps.edu.co',     activo: false },
];

const SeccionUsuarios = () => {
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const filtrados = USUARIOS_MOCK.filter((u) => {
    if (filtroRol !== 'Todos' && u.rol !== filtroRol) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      if (!u.nombre.toLowerCase().includes(q) && !u.cedula.includes(q)) return false;
    }
    return true;
  });

  const mock = () => alert('Mockup — esta acción no persiste. Backend pendiente.');

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Personas / Usuarios"
        titulo="Usuarios"
        descripcion="Gestiona los usuarios del sistema: estudiantes, directores, dependencias y administradores. Próximamente leerá desde la BD oficial vía DIVISIT."
        accion={
          <div className="flex gap-2">
            <button type="button" onClick={mock}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Importar CSV
            </button>
            <button type="button" onClick={mock}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              + Nuevo usuario
            </button>
          </div>
        }
      />

      <AvisoMockup texto="Catálogo de usuarios de ejemplo. Cuando se integre la BD oficial, los estudiantes vendrán de DIVISIT y solo se editarán campos propios del módulo." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o cédula…"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-400 focus:outline-none sm:max-w-md" />
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button key={r} type="button" onClick={() => setFiltroRol(r)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filtroRol === r
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3 text-left">Cédula</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Programa</th>
              <th className="px-4 py-3 text-left">Correo</th>
              <th className="px-4 py-3 text-center">Activo</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtrados.map((u) => (
              <tr key={u.cedula} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{u.cedula}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{u.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{u.rol}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{u.programa}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{u.correo}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {u.activo ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={mock} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Editar</button>
                    <button onClick={mock} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Reset</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-400">No hay usuarios que coincidan.</div>
        )}
      </div>
    </div>
  );
};

export default SeccionUsuarios;
