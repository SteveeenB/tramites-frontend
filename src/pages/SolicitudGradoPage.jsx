import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProcesoPGSidebar from '../components/proceso-grado/ProcesoPGSidebar';
import FileSlot from '../components/proceso-grado/FileSlot';
import { solicitudesApi } from '../api/solicitudesApi';

const TIPOS_PROYECTO = [
  { value: 'INVESTIGACION',     label: 'Trabajo de Investigación' },
  { value: 'MONOGRAFIA',        label: 'Monografía' },
  { value: 'SISTEMATIZACION',   label: 'Sistematización del Conocimiento' },
  { value: 'TRABAJO_DIRIGIDO',  label: 'Trabajo Dirigido' },
  { value: 'PASANTIA',          label: 'Pasantía' },
];

const SolicitudGradoPage = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [tituloProyecto, setTituloProyecto]     = useState('');
  const [resumen, setResumen]                   = useState('');
  const [tipoProyecto, setTipoProyecto]         = useState('');
  const [foto, setFoto]                         = useState(null);
  const [actaSustentacion, setActaSustentacion] = useState(null);
  const [certificadoIngles, setCertificadoIngles] = useState(null);

  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState('');

  const camposInvalidos =
    !tituloProyecto.trim() ||
    !resumen.trim() ||
    !tipoProyecto ||
    !foto ||
    !actaSustentacion;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (camposInvalidos) return;

    setEnviando(true);
    setError('');
    try {
      await solicitudesApi.crearSolicitudGrado(usuario.cedula, {
        tituloProyecto,
        resumen,
        tipoProyecto,
        foto,
        actaSustentacion,
        certificadoIngles,
      });
      navigate('/proceso-de-grado');
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud. Intenta de nuevo.');
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <ProcesoPGSidebar usuario={usuario} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 bg-red-600 px-6 py-4 text-white shadow-sm md:px-8">
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">ESTUDIANTES</h1>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {usuario?.nombre?.slice(0, 2).toUpperCase()}
              </div>
              <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            <button
              type="button"
              onClick={() => navigate('/proceso-de-grado')}
              className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver al proceso de grado
            </button>

            <div className="mx-auto max-w-2xl">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Solicitud de Grado</h2>
                <p className="mt-1 text-sm text-red-600">
                  Complete todos los campos requeridos para iniciar su proceso de grado
                </p>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">

                  {/* ── Información del Proyecto ────────────────────────── */}
                  <section>
                    <h3 className="mb-5 text-base font-bold text-slate-900">Información del Proyecto</h3>

                    <div className="flex flex-col gap-5">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                          Título del Proyecto/Tesis <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={tituloProyecto}
                          onChange={(e) => setTituloProyecto(e.target.value)}
                          placeholder="Ingrese el título de su proyecto o tesis"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                          Resumen del Proyecto/Tesis <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={resumen}
                          onChange={(e) => setResumen(e.target.value)}
                          placeholder="Describa brevemente su proyecto o tesis"
                          rows={5}
                          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                          Tipo de Proyecto <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={tipoProyecto}
                          onChange={(e) => setTipoProyecto(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        >
                          <option value="">Seleccione el tipo de proyecto</option>
                          {TIPOS_PROYECTO.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* ── Carga de Archivos ───────────────────────────────── */}
                  <section>
                    <h3 className="mb-5 text-base font-bold text-slate-900">Carga de Archivos</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FileSlot
                        label="Fotografía Actualizada"
                        formats="PNG, JPG"
                        required
                        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                        icon="image"
                        file={foto}
                        onChange={setFoto}
                      />
                      <FileSlot
                        label="Acta de Sustentación"
                        formats="PDF, DOCX"
                        required
                        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                        icon="doc"
                        file={actaSustentacion}
                        onChange={setActaSustentacion}
                      />
                      <FileSlot
                        label="Certificado de Inglés"
                        formats="PDF, DOCX, PNG, JPG"
                        required={false}
                        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,image/png,image/jpeg,.png,.jpg,.jpeg"
                        icon="upload"
                        file={certificadoIngles}
                        onChange={setCertificadoIngles}
                      />
                    </div>
                  </section>

                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={camposInvalidos || enviando}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {enviando ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Enviando…
                        </>
                      ) : (
                        'Enviar Solicitud de Grado'
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SolicitudGradoPage;
