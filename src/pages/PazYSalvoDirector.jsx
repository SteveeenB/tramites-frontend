import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMisSolicitudesPazYSalvo, responderPazYSalvo } from '../api/pazYSalvoApi';

const Badge = ({ estado }) => {
  const styles = {
    PENDIENTE: 'bg-amber-100 text-amber-800 border border-amber-300',
    APROBADO:  'bg-green-100 text-green-800 border border-green-300',
    RECHAZADO: 'bg-red-100 text-red-800 border border-red-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[estado] || 'bg-gray-100 text-gray-600'}`}>
      {estado}
    </span>
  );
};

const ModalRespuesta = ({ item, onClose, onConfirm }) => {
  const [decision, setDecision] = useState('APROBADO');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await onConfirm(item.id, decision, obs);
      onClose();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Confirmar Paz y Salvo</h2>
        <p className="text-sm text-gray-500 mb-2">Estudiante: <span className="font-semibold">{item.nombreEstudiante}</span></p>
        <p className="text-xs text-blue-600 font-medium mb-6 bg-blue-50 rounded-lg px-3 py-2">
          Este es su paz y salvo como Director de Programa
        </p>
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setDecision('APROBADO')}
            className={`flex-1 py-2 rounded-xl border-2 font-semibold transition-all ${decision === 'APROBADO' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
          >
            ✓ A Paz y Salvo
          </button>
          <button
            onClick={() => setDecision('RECHAZADO')}
            className={`flex-1 py-2 rounded-xl border-2 font-semibold transition-all ${decision === 'RECHAZADO' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}
          >
            ✗ No está a Paz y Salvo
          </button>
        </div>
        <textarea
          value={obs}
          onChange={e => setObs(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Observaciones (opcional)"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-600 font-medium">Cancelar</button>
          <button
            onClick={submit}
            disabled={loading}
            className={`flex-1 py-2 rounded-xl font-semibold text-white disabled:opacity-50 ${decision === 'APROBADO' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PazYSalvoDirector() {
  const { usuario } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filtro, setFiltro] = useState('PENDIENTE');

  const cargar = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const data = await getMisSolicitudesPazYSalvo();
      setSolicitudes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleConfirmar = async (id, decision, obs) => {
    await responderPazYSalvo(id, decision, obs);
    await cargar();
  };

  const filtradas = filtro === 'TODOS' ? solicitudes : solicitudes.filter(s => s.estado === filtro);
  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">Mis Paz y Salvos</h2>
        <p className="text-sm text-slate-500">Solicitudes de paz y salvo como Director de Programa</p>
        {pendientes > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-amber-600 font-bold text-lg">{pendientes}</span>
            <span className="text-amber-700 text-sm">pendiente(s) de su confirmación</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {['PENDIENTE', 'APROBADO', 'RECHAZADO', 'TODOS'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filtro === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {f === 'TODOS' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="ml-1.5 text-xs">({f === 'TODOS' ? solicitudes.length : solicitudes.filter(s => s.estado === f).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No hay solicitudes en este estado</div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(ps => (
            <div key={ps.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{ps.nombreEstudiante || ps.cedulaEstudiante}</span>
                  <Badge estado={ps.estado} />
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>Código: {ps.codigoEstudiante || '—'} · Programa: {ps.programa || '—'}</div>
                  <div>Solicitud N° {ps.solicitudId} · {ps.fechaSolicitud ? new Date(ps.fechaSolicitud).toLocaleDateString('es-CO') : '—'}</div>
                  {ps.observaciones && <div className="mt-1 text-gray-600">Obs: {ps.observaciones}</div>}
                  {ps.fechaRespuesta && <div>Respondido: {new Date(ps.fechaRespuesta).toLocaleDateString('es-CO')}</div>}
                </div>
              </div>
              {ps.estado === 'PENDIENTE' && (
                <button
                  onClick={() => setModal(ps)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all whitespace-nowrap"
                >
                  Responder
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && <ModalRespuesta item={modal} onClose={() => setModal(null)} onConfirm={handleConfirmar} />}
    </div>
  );
}