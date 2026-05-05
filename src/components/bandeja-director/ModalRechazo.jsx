import React, { useEffect, useRef, useState } from 'react';

const ModalRechazo = ({ solicitud, onConfirmar, onCancelar, procesando }) => {
  const [motivo, setMotivo] = useState('');
  const textareaRef         = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const motivoValido = motivo.trim().length > 0;

  const handleConfirmar = () => {
    if (!motivoValido) return;
    onConfirmar(solicitud.id, motivo.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancelar}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        {/* Ícono */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
          </svg>
        </div>

        <h3 id="modal-titulo" className="mb-1 text-xl font-bold text-slate-900">
          Rechazar solicitud
        </h3>
        <p className="mb-1 text-sm text-slate-500">
          Estudiante:{' '}
          <span className="font-semibold text-slate-700">{solicitud?.estudiante?.nombre}</span>
        </p>
        <p className="mb-5 text-sm text-slate-500">
          Esta acción notificará al estudiante y no se puede deshacer.
        </p>

        <label htmlFor="motivo-rechazo" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Motivo del rechazo <span className="text-red-500">*</span>
        </label>
        <textarea
          id="motivo-rechazo"
          ref={textareaRef}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
          placeholder="Ej: El estudiante no cumple con los requisitos mínimos de créditos aprobados…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
          disabled={procesando}
        />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={procesando || !motivoValido}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {procesando ? 'Rechazando…' : 'Confirmar rechazo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRechazo;
