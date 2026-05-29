import React from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const CONFIG_MOCK = [
  { clave: 'certificados.dias_vigencia_pago',     valor: '5',                       tipo: 'INT',     descripcion: 'Días que tiene el estudiante para pagar antes de que el recibo se venza.' },
  { clave: 'certificados.minutos_generacion_pdf', valor: '5',                       tipo: 'INT',     descripcion: 'Tiempo estimado en minutos que tarda la generación del PDF tras confirmar el pago.' },
  { clave: 'mantenimiento.activo',                valor: 'false',                   tipo: 'BOOLEAN', descripcion: 'Modo mantenimiento: si está activo, los estudiantes no pueden iniciar nuevos trámites.' },
  { clave: 'mantenimiento.mensaje',               valor: '',                        tipo: 'STRING',  descripcion: 'Texto que se muestra al estudiante cuando el sistema está en mantenimiento.' },
  { clave: 'email.from',                          valor: 'posgrados@ufps.edu.co',   tipo: 'STRING',  descripcion: 'Dirección desde la que se envían los correos del sistema.' },
  { clave: 'email.firma_institucional',           valor: 'Sección de Posgrados — UFPS', tipo: 'STRING', descripcion: 'Firma que se agrega al pie de todos los correos.' },
  { clave: 'pagos.wompi.modo',                    valor: 'sandbox',                 tipo: 'STRING',  descripcion: 'Modo de operación de Wompi: sandbox o production.' },
  { clave: 'sistema.timezone',                    valor: 'America/Bogota',          tipo: 'STRING',  descripcion: 'Zona horaria del sistema.' },
];

const TIPO_BADGE = {
  INT:     'bg-blue-100 text-blue-700',
  STRING:  'bg-emerald-100 text-emerald-700',
  BOOLEAN: 'bg-amber-100 text-amber-700',
  JSON:    'bg-purple-100 text-purple-700',
};

const SeccionConfiguracionGlobal = () => {
  const mock = () => alert('Mockup — esta acción no persiste. Backend pendiente.');

  // Agrupar por prefijo
  const grupos = CONFIG_MOCK.reduce((acc, c) => {
    const prefijo = c.clave.split('.')[0];
    if (!acc[prefijo]) acc[prefijo] = [];
    acc[prefijo].push(c);
    return acc;
  }, {});

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Sistema / Configuración Global"
        titulo="Configuración Global"
        descripcion="Parámetros del sistema que hoy viven como constantes en código. Editarlos desde aquí no requiere redeploy."
        accion={
          <button type="button" onClick={mock}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Recargar caché
          </button>
        }
      />

      <AvisoMockup texto="Los valores mostrados son referenciales. El backend aún no expone los endpoints de configuración global." />

      <div className="space-y-6">
        {Object.entries(grupos).map(([prefijo, items]) => (
          <div key={prefijo} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-600">{prefijo}.*</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((c) => (
                <div key={c.clave} className="grid gap-3 p-5 sm:grid-cols-[1fr_280px] sm:items-center">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <code className="text-xs font-bold text-slate-800">{c.clave}</code>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${TIPO_BADGE[c.tipo] || 'bg-slate-100 text-slate-600'}`}>
                        {c.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{c.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.tipo === 'BOOLEAN' ? (
                      <select defaultValue={c.valor}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : (
                      <input type={c.tipo === 'INT' ? 'number' : 'text'} defaultValue={c.valor}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono" />
                    )}
                    <button type="button" onClick={mock}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                      Guardar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeccionConfiguracionGlobal;
