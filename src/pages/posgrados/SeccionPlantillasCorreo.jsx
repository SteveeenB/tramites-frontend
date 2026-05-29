import React, { useState } from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const PLANTILLAS_MOCK = [
  {
    codigo: 'CERTIFICADO_GENERADO',
    asunto: '[UFPS Posgrados] Tu certificado está listo',
    cuerpo: 'Estimado/a {{nombre}},\n\nTu certificado {{tipo_certificado}} ha sido generado y está adjunto a este correo.\n\nNúmero de solicitud: {{numero_solicitud}}\nFecha de expedición: {{fecha_expedicion}}\n\nAtentamente,\nSección de Posgrados — UFPS',
    variables: ['nombre', 'tipo_certificado', 'numero_solicitud', 'fecha_expedicion'],
    activo: true,
  },
  {
    codigo: 'GRADO_APROBADO_POSGRADOS',
    asunto: '[UFPS Posgrados] Solicitud de grado aprobada',
    cuerpo: 'Estimado/a {{nombre}},\n\nTu solicitud de grado para el programa de {{programa}} ha sido aprobada. La ceremonia está programada para el {{fecha_grado}}.\n\nNúmero de radicado: {{radicado}}\n\nAtentamente,\nSección de Posgrados — UFPS',
    variables: ['nombre', 'programa', 'fecha_grado', 'radicado'],
    activo: true,
  },
  {
    codigo: 'PAZ_Y_SALVO_PENDIENTE',
    asunto: '[UFPS] Solicitud de paz y salvo pendiente',
    cuerpo: 'Estimado responsable de {{dependencia}},\n\nEl estudiante {{nombre}} ha solicitado paz y salvo para su proceso de grado. Por favor, responde a la brevedad.\n\nLink: {{link_respuesta}}',
    variables: ['dependencia', 'nombre', 'link_respuesta'],
    activo: true,
  },
];

const SeccionPlantillasCorreo = () => {
  const [seleccionada, setSeleccionada] = useState(PLANTILLAS_MOCK[0]);
  const mock = () => alert('Mockup — esta acción no persiste. Backend pendiente.');

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Comunicación / Plantillas de Correo"
        titulo="Plantillas de Correo"
        descripcion="Edita los correos automáticos que envía el sistema. Soporta variables tipo {{nombre}}, {{numero_solicitud}}, etc."
      />

      <AvisoMockup texto="Vista previa de plantillas hardcoded en Java. Cuando se implemente, se podrán editar desde aquí sin redeployar." />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Lista de plantillas */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">Plantillas</p>
          <div className="mt-2 space-y-1">
            {PLANTILLAS_MOCK.map((p) => (
              <button key={p.codigo} type="button" onClick={() => setSeleccionada(p)}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                  seleccionada.codigo === p.codigo
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}>
                <span className="font-mono">{p.codigo}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-slate-400">{seleccionada.codigo}</p>
              <h3 className="text-lg font-bold text-slate-900">Editar plantilla</h3>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              seleccionada.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
            }`}>
              {seleccionada.activo ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Asunto</label>
          <input type="text" defaultValue={seleccionada.asunto} key={`s-${seleccionada.codigo}`}
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />

          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Cuerpo</label>
          <textarea defaultValue={seleccionada.cuerpo} rows={10} key={`b-${seleccionada.codigo}`}
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono" />

          <div className="mb-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Variables disponibles</p>
            <div className="flex flex-wrap gap-1.5">
              {seleccionada.variables.map((v) => (
                <code key={v} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{`{{${v}}}`}</code>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={mock}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Vista previa
            </button>
            <button type="button" onClick={mock}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Enviar prueba
            </button>
            <button type="button" onClick={mock}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeccionPlantillasCorreo;
