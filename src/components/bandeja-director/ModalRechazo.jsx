import React, { useEffect, useRef, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Boton, Campo, CLASE_CAMPO, Modal } from '../ui';

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
    <Modal
      titulo="Rechazar solicitud"
      onCerrar={procesando ? undefined : onCancelar}
      pie={(
        <>
          <Boton variante="secundario" onClick={onCancelar} disabled={procesando}>Cancelar</Boton>
          <Boton onClick={handleConfirmar} cargando={procesando} disabled={!motivoValido}>
            {procesando ? 'Rechazando…' : 'Confirmar rechazo'}
          </Boton>
        </>
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
          <XCircleIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="text-sm text-gray-600">
          <p>
            Estudiante:{' '}
            <span className="font-semibold text-gray-900">{solicitud?.estudiante?.nombre}</span>
          </p>
          <p className="mt-1">Esta acción notificará al estudiante y no se puede deshacer.</p>
        </div>
      </div>

      <Campo id="motivo-rechazo" etiqueta="Motivo del rechazo" requerido>
        <textarea
          id="motivo-rechazo"
          ref={textareaRef}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
          required
          placeholder="Ej: El estudiante no cumple con los requisitos mínimos de créditos aprobados…"
          className={`${CLASE_CAMPO} resize-none`}
          disabled={procesando}
        />
      </Campo>
    </Modal>
  );
};

export default ModalRechazo;
