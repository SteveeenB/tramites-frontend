import React from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const DEPENDENCIAS_MOCK = [
  { codigo: 'BIBLIOTECA',     nombre: 'Biblioteca Central',     responsable: 'Biblioteca Central',     obligatorio: true,  orden: 1, activo: true  },
  { codigo: 'FINANCIERA',     nombre: 'División Financiera',    responsable: 'División Financiera',    obligatorio: true,  orden: 2, activo: true  },
  { codigo: 'ADMISIONES',     nombre: 'Admisiones y Registro',  responsable: 'Admisiones y Registro',  obligatorio: true,  orden: 3, activo: true  },
  { codigo: 'BIENESTAR',      nombre: 'Bienestar Universitario', responsable: '—',                     obligatorio: false, orden: 4, activo: false },
  { codigo: 'DIRECTOR',       nombre: 'Director del Programa',  responsable: 'Director del Programa',  obligatorio: true,  orden: 5, activo: true  },
];

const SeccionDependencias = () => {
  const mock = () => alert('Mockup — esta acción no persiste. Backend pendiente.');

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Catálogos / Dependencias y Paz y Salvos"
        titulo="Dependencias y Paz y Salvos"
        descripcion="Define qué dependencias deben emitir paz y salvo al iniciar una Solicitud de Grado, en qué orden y si son obligatorias."
        accion={
          <button type="button" onClick={mock}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            + Nueva dependencia
          </button>
        }
      />

      <AvisoMockup />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3 text-center">Orden</th>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Usuario responsable</th>
              <th className="px-4 py-3 text-center">Obligatorio</th>
              <th className="px-4 py-3 text-center">Activo</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DEPENDENCIAS_MOCK.map((d) => (
              <tr key={d.codigo} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-center font-semibold text-slate-500">{d.orden}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{d.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{d.nombre}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{d.responsable}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    d.obligatorio ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {d.obligatorio ? 'Sí' : 'Opcional'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    d.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {d.activo ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={mock} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Editar</button>
                    <button onClick={mock} className="rounded-lg border border-slate-300 px-1.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">↑</button>
                    <button onClick={mock} className="rounded-lg border border-slate-300 px-1.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">↓</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeccionDependencias;
