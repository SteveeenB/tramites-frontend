import React, { useState } from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const TRAMITES = [
  { codigo: 'GRADO',                  label: 'Solicitud de Grado' },
  { codigo: 'TERMINACION_MATERIAS',   label: 'Terminación de Materias' },
];

const DOCUMENTOS_POR_TRAMITE = {
  GRADO: [
    { id: 1, nombre: 'Fotocopia documento de identidad', formatos: 'pdf,jpg,png', tamanoMb: 3, obligatorio: true,  orden: 1 },
    { id: 2, nombre: 'Hoja de vida actualizada',         formatos: 'pdf',         tamanoMb: 5, obligatorio: true,  orden: 2 },
    { id: 3, nombre: 'Soporte de pago de grado',         formatos: 'pdf,jpg',     tamanoMb: 3, obligatorio: true,  orden: 3 },
    { id: 4, nombre: 'Acta de sustentación firmada',     formatos: 'pdf',         tamanoMb: 5, obligatorio: true,  orden: 4 },
    { id: 5, nombre: 'Foto fondo blanco (formato visa)', formatos: 'jpg,png',     tamanoMb: 2, obligatorio: false, orden: 5 },
  ],
  TERMINACION_MATERIAS: [
    { id: 6, nombre: 'Constancia de matrícula vigente',  formatos: 'pdf',         tamanoMb: 3, obligatorio: true,  orden: 1 },
    { id: 7, nombre: 'Pago de matrícula del semestre',   formatos: 'pdf,jpg',     tamanoMb: 3, obligatorio: true,  orden: 2 },
  ],
};

const SeccionDocumentosRequeridos = () => {
  const [tramite, setTramite] = useState('GRADO');
  const mock = () => alert('Mockup — esta acción no persiste. Backend pendiente.');

  const documentos = DOCUMENTOS_POR_TRAMITE[tramite] || [];

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Catálogos / Documentos Requeridos"
        titulo="Documentos Requeridos"
        descripcion="Define qué documentos debe subir el estudiante al iniciar cada tipo de trámite."
        accion={
          <button type="button" onClick={mock}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            + Agregar documento
          </button>
        }
      />

      <AvisoMockup texto="La tabla `tipo_documento_requerido` ya existe en BD pero no se está usando. Este mockup muestra cómo se vería su configuración." />

      <div className="mb-4 flex flex-wrap gap-2">
        {TRAMITES.map((t) => (
          <button key={t.codigo} type="button" onClick={() => setTramite(t.codigo)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tramite === t.codigo
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">({(DOCUMENTOS_POR_TRAMITE[t.codigo] || []).length})</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3 text-center">Orden</th>
              <th className="px-4 py-3 text-left">Documento</th>
              <th className="px-4 py-3 text-left">Formatos aceptados</th>
              <th className="px-4 py-3 text-right">Tamaño máx.</th>
              <th className="px-4 py-3 text-center">Obligatorio</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documentos.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-center font-semibold text-slate-500">{d.orden}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{d.nombre}</td>
                <td className="px-4 py-3">
                  {d.formatos.split(',').map((f) => (
                    <code key={f} className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{f}</code>
                  ))}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{d.tamanoMb} MB</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    d.obligatorio ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {d.obligatorio ? 'Sí' : 'Opcional'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={mock} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">Editar</button>
                    <button onClick={mock} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Quitar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {documentos.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-400">Este trámite no tiene documentos configurados.</div>
        )}
      </div>
    </div>
  );
};

export default SeccionDocumentosRequeridos;
