import React from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const PROGRAMAS_MOCK = [
  { nombre: 'Doctorado en Educación',                                  tipo: 'DOCTORADO',       creditos: 80, modalidad: 'PRESENCIAL', estudiantes: 24, activo: true  },
  { nombre: 'Doctorado en Educación Matemática',                       tipo: 'DOCTORADO',       creditos: 90, modalidad: 'PRESENCIAL', estudiantes: 12, activo: true  },
  { nombre: 'Maestría en Gerencia de Empresas',                        tipo: 'MAESTRIA',        creditos: 56, modalidad: 'MIXTA',      estudiantes: 87, activo: true  },
  { nombre: 'Maestría en TIC aplicadas a la Educación',                tipo: 'MAESTRIA',        creditos: 77, modalidad: 'VIRTUAL',    estudiantes: 42, activo: true  },
  { nombre: 'Maestría en Ciencias Biológicas',                         tipo: 'MAESTRIA',        creditos: 60, modalidad: 'PRESENCIAL', estudiantes: 18, activo: true  },
  { nombre: 'Especialización en Estructuras',                          tipo: 'ESPECIALIZACION', creditos: 30, modalidad: 'PRESENCIAL', estudiantes: 31, activo: true  },
  { nombre: 'Especialización en Logística y Negocios Internacionales', tipo: 'ESPECIALIZACION', creditos: 24, modalidad: 'MIXTA',      estudiantes: 19, activo: false },
];

const TIPO_BADGE = {
  DOCTORADO:       'bg-purple-100 text-purple-700',
  MAESTRIA:        'bg-blue-100 text-blue-700',
  ESPECIALIZACION: 'bg-emerald-100 text-emerald-700',
};

const SeccionProgramas = () => {
  const mock = () => alert('Mockup — esta acción no persiste. Backend pendiente.');

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Personas / Programas Académicos"
        titulo="Programas Académicos"
        descripcion="Catálogo de doctorados, maestrías y especializaciones que ofrece la sección de Posgrados. Una vez se integre la BD oficial, este catálogo será de solo lectura desde su tabla `programas`."
        accion={
          <button type="button" onClick={mock}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            + Nuevo programa
          </button>
        }
      />

      <AvisoMockup texto="Catálogo de ejemplo. La cantidad de estudiantes se calculará dinámicamente cuando se integre la BD oficial." />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-center">Tipo</th>
              <th className="px-4 py-3 text-right">Créditos</th>
              <th className="px-4 py-3 text-center">Modalidad</th>
              <th className="px-4 py-3 text-right">Estudiantes</th>
              <th className="px-4 py-3 text-center">Activo</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PROGRAMAS_MOCK.map((p) => (
              <tr key={p.nombre} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{p.nombre}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIPO_BADGE[p.tipo] || 'bg-slate-100 text-slate-600'}`}>
                    {p.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-800">{p.creditos}</td>
                <td className="px-4 py-3 text-center text-xs text-slate-600">{p.modalidad}</td>
                <td className="px-4 py-3 text-right text-slate-700">{p.estudiantes}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {p.activo ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={mock} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeccionProgramas;
