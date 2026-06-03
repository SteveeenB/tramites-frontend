import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../api/apiClient';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';

const VARIABLES = [
  { key: 'nombre_completo',    label: 'Nombre completo' },
  { key: 'cedula',             label: 'Cédula' },
  { key: 'codigo_estudiantil', label: 'Código estudiantil' },
  { key: 'programa',           label: 'Programa académico' },
  { key: 'tipo_certificado',   label: 'Tipo de certificado' },
  { key: 'fecha_expedicion',   label: 'Fecha de expedición' },
  { key: 'fecha_aprobacion',   label: 'Fecha de aprobación' },
  { key: 'numero_solicitud',   label: 'Número de solicitud' },
  { key: 'codigo_verificacion',label: 'Código de verificación' },
  { key: 'dependencia',        label: 'Dependencia responsable' },
];

const DATOS_PREVIEW = {
  nombre_completo:    'Ana María Torres Rodríguez',
  cedula:             '1098765440',
  codigo_estudiantil: '20261010',
  programa:           'Maestría en TIC aplicadas a la Educación',
  tipo_certificado:   'Certificado de Terminación de Materias',
  fecha_expedicion:   '2 de junio de 2026',
  fecha_aprobacion:   '15 de mayo de 2026',
  numero_solicitud:   '42',
  codigo_verificacion:'UFPS-TM-42-5440',
  dependencia:        'Sección de Posgrados',
};

const PLANTILLA_DEFAULT = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; margin: 60px 72px; color: #222; }
    .encabezado { background: #004785; color: white; text-align: center; padding: 14px; margin-bottom: 0; }
    .encabezado h1 { margin: 0; font-size: 14px; }
    .encabezado p  { margin: 4px 0 0; font-size: 10px; }
    .barra-dorada  { background: #c8a000; height: 3px; margin-bottom: 28px; }
    h2 { color: #004785; text-align: center; font-size: 18px; margin-bottom: 20px; }
    .cuerpo { font-size: 11px; text-align: justify; line-height: 1.6; margin-bottom: 20px; }
    table { width: 88%; margin: 0 auto 24px; border-collapse: collapse; font-size: 10px; }
    td { padding: 7px; border: 1px solid #b4c8e1; }
    td:first-child { background: #ebf2fc; font-weight: bold; width: 38%; }
    .verificacion { width: 88%; margin: 0 auto 28px; font-size: 9px; color: #555; }
    .firmas { width: 88%; margin: 0 auto; display: flex; justify-content: space-around; font-size: 9px; text-align: center; }
    .firma { width: 45%; }
    .firma .linea { border-top: 1px solid #222; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="encabezado">
    <h1>UNIVERSIDAD FRANCISCO DE PAULA SANTANDER</h1>
    <p>Vicerrectoría Académica · Sección de Posgrados</p>
  </div>
  <div class="barra-dorada"></div>

  <h2>{{tipo_certificado}}</h2>

  <p class="cuerpo">
    Se certifica que el/la estudiante identificado(a) con los datos relacionados en el presente
    documento ha cumplido satisfactoriamente con todos los requisitos académicos establecidos
    por la institución, según resolución aprobada el {{fecha_aprobacion}}. Este certificado lo
    habilita para continuar con las siguientes etapas del proceso de grado ante la
    {{dependencia}}.
  </p>

  <table>
    <tr><td>Nombre completo</td>      <td>{{nombre_completo}}</td></tr>
    <tr><td>Cédula de ciudadanía</td> <td>{{cedula}}</td></tr>
    <tr><td>Código estudiantil</td>   <td>{{codigo_estudiantil}}</td></tr>
    <tr><td>Programa académico</td>   <td>{{programa}}</td></tr>
  </table>

  <div class="verificacion">
    <strong>Código de verificación:</strong> {{codigo_verificacion}} &nbsp;|&nbsp;
    <strong>Expedido el:</strong> {{fecha_expedicion}} &nbsp;|&nbsp;
    <strong>No. solicitud:</strong> {{numero_solicitud}}
  </div>

  <div class="firmas">
    <div class="firma">
      <div class="linea"></div>
      <p>Director(a) de Programa</p>
      <p>Universidad Francisco de Paula Santander</p>
    </div>
    <div class="firma">
      <div class="linea"></div>
      <p>Coordinador(a) de Posgrados</p>
      <p>Universidad Francisco de Paula Santander</p>
    </div>
  </div>
</body>
</html>`;

const SeccionPlantillasCertificado = () => {
  const [tipos, setTipos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [html, setHtml] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [verPreview, setVerPreview] = useState(false);
  const textareaRef = useRef(null);

  const cargarTipos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await apiClient('/admin/tipos-certificado');
      setTipos(data || []);
      if (data && data.length > 0 && !seleccionado) {
        seleccionarTipo(data[0]);
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error cargando tipos: ' + e.message });
    } finally {
      setCargando(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const seleccionarTipo = async (tipo) => {
    setSeleccionado(tipo);
    setVerPreview(false);
    setMensaje(null);
    try {
      const data = await apiClient(`/admin/tipos-certificado/${tipo.id}/plantilla`);
      setHtml(data.plantillaHtml || PLANTILLA_DEFAULT);
    } catch {
      setHtml(PLANTILLA_DEFAULT);
    }
  };

  useEffect(() => { cargarTipos(); }, [cargarTipos]);

  const guardar = async () => {
    if (!seleccionado) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await apiClient(`/admin/tipos-certificado/${seleccionado.id}/plantilla`, {
        method: 'PUT',
        body: JSON.stringify({ plantillaHtml: html }),
      });
      setMensaje({ tipo: 'ok', texto: 'Plantilla guardada correctamente.' });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + e.message });
    } finally {
      setGuardando(false);
    }
  };

  const insertarVariable = (clave) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const inicio = ta.selectionStart;
    const fin = ta.selectionEnd;
    const token = `{{${clave}}}`;
    const nuevoHtml = html.slice(0, inicio) + token + html.slice(fin);
    setHtml(nuevoHtml);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(inicio + token.length, inicio + token.length);
    });
  };

  const htmlPreview = VARIABLES.reduce((acc, { key }) => {
    return acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), DATOS_PREVIEW[key] || `[${key}]`);
  }, html);

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Comunicación / Plantillas de Certificado"
        titulo="Plantillas de Certificado"
        descripcion="Define el diseño HTML de cada certificado. Usa variables tipo {{nombre_completo}}, {{programa}}, etc."
      />

      {cargando ? (
        <p className="text-sm text-slate-500">Cargando tipos de certificado...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Sidebar de tipos */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Tipos de Certificado
            </p>
            <div className="mt-2 space-y-1">
              {tipos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => seleccionarTipo(t)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                    seleccionado?.id === t.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-mono font-semibold">{t.codigo}</span>
                  <span className={`block truncate text-[11px] ${seleccionado?.id === t.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Panel editor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {seleccionado ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-400">{seleccionado.codigo}</p>
                    <h3 className="text-lg font-bold text-slate-900">{seleccionado.label}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVerPreview((v) => !v)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {verPreview ? 'Ocultar vista previa' : 'Vista previa'}
                    </button>
                    <button
                      type="button"
                      onClick={guardar}
                      disabled={guardando}
                      className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                  </div>
                </div>

                {mensaje && (
                  <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                    mensaje.tipo === 'ok'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {mensaje.texto}
                  </div>
                )}

                {verPreview ? (
                  <div className="mb-4 overflow-auto rounded-lg border border-slate-200 bg-white" style={{ height: 520 }}>
                    <iframe
                      title="Vista previa del certificado"
                      srcDoc={htmlPreview}
                      className="h-full w-full"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    rows={22}
                    spellCheck={false}
                    className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder={`<!DOCTYPE html>\n<html>…</html>`}
                  />
                )}

                {/* Variables clicables */}
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Variables disponibles{' '}
                    <span className="font-normal normal-case text-slate-400">(clic para insertar en el cursor)</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLES.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => insertarVariable(key)}
                        title={label}
                        className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 hover:bg-slate-200 transition"
                      >
                        {`{{${key}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Selecciona un tipo de certificado para editar su plantilla.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeccionPlantillasCertificado;
