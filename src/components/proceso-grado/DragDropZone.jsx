import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, DocumentIcon, XIcon } from './icons';

const TIPOS_ACEPTADOS = {
  'application/pdf': 'PDF',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

const EXTENSIONES_VALIDAS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'docx']);

const getExtension = (filename) => filename.split('.').pop()?.toLowerCase();

const validar = (file) => {
  const tipoOk = Boolean(TIPOS_ACEPTADOS[file.type]);
  const extOk = EXTENSIONES_VALIDAS.has(getExtension(file.name));
  if (!tipoOk && !extOk) {
    return `"${file.name}": formato no permitido. Use PDF, PNG, JPG o DOCX.`;
  }
  if (file.size > 10 * 1024 * 1024) {
    return `"${file.name}": supera el límite de 10 MB.`;
  }
  return null;
};

const DragDropZone = ({ onUpload, uploading = false, titulo = 'Documentos de soporte' }) => {
  const [archivos, setArchivos] = useState([]);
  const [sobreZona, setSobreZona] = useState(false);
  const [errores, setErrores] = useState([]);
  const inputRef = useRef(null);

  const agregar = useCallback(
    (nuevos) => {
      const lista = Array.from(nuevos);
      const erroresNuevos = [];
      const validos = [];

      lista.forEach((f) => {
        const err = validar(f);
        if (err) {
          erroresNuevos.push(err);
        } else if (!archivos.find((a) => a.name === f.name && a.size === f.size)) {
          validos.push(f);
        }
      });

      setErrores(erroresNuevos);
      setArchivos((prev) => [...prev, ...validos]);
    },
    [archivos],
  );

  const quitar = (index) => setArchivos((prev) => prev.filter((_, i) => i !== index));

  const onDragOver = (e) => {
    e.preventDefault();
    setSobreZona(true);
  };
  const onDragLeave = () => setSobreZona(false);
  const onDrop = (e) => {
    e.preventDefault();
    setSobreZona(false);
    agregar(e.dataTransfer.files);
  };

  return (
    <div className="mt-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{titulo}</h4>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
          sobreZona
            ? 'border-red-400 bg-red-50'
            : 'border-slate-300 bg-slate-50 hover:border-red-300 hover:bg-red-50/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          className="hidden"
          onChange={(e) => agregar(e.target.files)}
        />
        <UploadIcon className="mx-auto mb-2 h-8 w-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">
          {sobreZona ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
        </p>
        <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG, DOCX — máx. 10 MB por archivo</p>
      </div>

      {errores.length > 0 && (
        <ul className="mt-3 space-y-1">
          {errores.map((e, i) => (
            <li key={i} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {e}
            </li>
          ))}
        </ul>
      )}

      {archivos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {archivos.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm"
            >
              <DocumentIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{f.name}</span>
              <span className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  quitar(i);
                }}
                className="rounded-md p-0.5 text-slate-400 hover:text-red-600"
              >
                <XIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {archivos.length > 0 && onUpload && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => onUpload(archivos)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadIcon className="h-4 w-4" />
          {uploading
            ? 'Subiendo…'
            : `Subir ${archivos.length} archivo${archivos.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

export default DragDropZone;
