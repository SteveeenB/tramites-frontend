import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { clasesBoton } from '../components/ui/Boton';

const NoAutorizado = () => (
  <main className="flex min-h-screen items-center justify-center bg-fondo px-4">
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow animate-fade-in-up">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
        <ShieldExclamationIcon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="text-xl font-bold text-gray-900">Acceso denegado</h1>
      <p className="mt-2 text-sm text-gray-600">No tienes permisos para acceder a esta página.</p>
      <Link to="/tramites" className={clasesBoton({ className: 'mt-6' })}>
        Volver al módulo de trámites
      </Link>
    </div>
  </main>
);

export default NoAutorizado;
