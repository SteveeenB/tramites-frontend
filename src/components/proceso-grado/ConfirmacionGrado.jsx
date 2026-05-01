import React, { useState } from 'react';
import { CheckIcon, DownloadIcon, DocumentIcon } from './icons';
import { formatFecha } from '../../constants/procesodeGrado';
import { solicitudesApi } from '../../api/solicitudesApi';
import DragDropZone from './DragDropZone';

const ConfirmacionGrado = ({ solicitudGrado }) => {
  const [generando, setGenerando] = useState(false);
  const [errorActa, setErrorActa] = useState(null);
  const [actaDescargada, setActaDescargada] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState(null);
  const [archivosSubidos, setArchivosSubidos] = useState([]);

  const handleGenerarActa = async () => {
    setGenerando(true);
    setErrorActa(null);
    try {
      const { blob, contentDisposition } = await solicitudesApi.descargarActa(solicitudGrado.id);
      const filename =
        contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] ||
        `acta_grado_${solicitudGrado.id}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setActaDescargada(true);
    } catch (err) {
      setErrorActa(err.message || 'No se pudo generar el acta. Intenta nuevamente.');
    } finally {
      setGenerando(false);
    }
  };

  const handleSubirDocs = async (archivos) => {
    setSubiendo(true);
    setErrorSubida(null);
    try {
      for (const archivo of archivos) {
        await solicitudesApi.subirDocumento(solicitudGrado.id, archivo);
        setArchivosSubidos((prev) => [...prev, archivo.name]);
      }
    } catch (err) {
      setErrorSubida(err.message || 'Error al subir los archivos.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner de aprobación */}
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">¡Solicitud de Grado Aprobada!</h3>
            <p className="text-sm text-slate-600">
              Tu solicitud fue aprobada el {formatFecha(solicitudGrado.fechaDecision)}.
            </p>
          </div>
        </div>

        {/* Detalles */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tipo de trámite
            </p>
            <p className="text-sm font-medium text-slate-800">Solicitud de Grado</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Estado
            </p>
            <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700">
              Aprobada
            </span>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha de solicitud
            </p>
            <p className="text-sm font-medium text-slate-800">
              {formatFecha(solicitudGrado.fechaSolicitud)}
            </p>
          </div>
          {solicitudGrado.observacionesDirector && (
            <div className="rounded-2xl bg-white p-4 sm:col-span-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Observaciones del director
              </p>
              <p className="text-sm text-slate-700">{solicitudGrado.observacionesDirector}</p>
            </div>
          )}
        </div>

        {/* Botón Generar Acta */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerarActa}
            disabled={generando}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <DownloadIcon className="h-4 w-4" />
            {generando ? 'Generando…' : 'Generar Acta'}
          </button>
          {actaDescargada && (
            <span className="text-sm font-medium text-green-700">✓ Acta descargada correctamente</span>
          )}
        </div>

        {errorActa && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorActa}
          </p>
        )}
      </div>

      {/* Sección de documentos del expediente */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <DocumentIcon />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Documentos del expediente</h4>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Adjunta los documentos requeridos para completar tu expediente de grado.
        </p>

        {archivosSubidos.length > 0 && (
          <ul className="mb-4 space-y-1">
            {archivosSubidos.map((nombre, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-green-700">
                <CheckIcon className="h-4 w-4" />
                {nombre}
              </li>
            ))}
          </ul>
        )}

        {errorSubida && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorSubida}
          </p>
        )}

        <DragDropZone
          onUpload={handleSubirDocs}
          uploading={subiendo}
          titulo="Subir documentos de soporte"
        />
      </div>
    </div>
  );
};

export default ConfirmacionGrado;
