import React from 'react';
import {
  AcademicCapIcon as HeroAcademicCapIcon,
  ArrowRightIcon as HeroArrowRightIcon,
  ClockIcon as HeroClockIcon,
  Cog6ToothIcon as HeroCog6ToothIcon,
  DocumentTextIcon as HeroDocumentTextIcon,
  InboxIcon as HeroInboxIcon,
  Squares2X2Icon as HeroSquares2X2Icon,
  UsersIcon as HeroUsersIcon,
} from '@heroicons/react/24/outline';

// Íconos de las tarjetas de trámites.
// Mismo set que el Módulo de Matrícula (Heroicons 24/outline); se conservan
// los nombres y tamaños por defecto para no tocar a quien los importa.

export const GraduationIcon = ({ className = 'h-6 w-6' }) => <HeroAcademicCapIcon className={className} aria-hidden="true" />;
export const CertificateIcon = ({ className = 'h-6 w-6' }) => <HeroDocumentTextIcon className={className} aria-hidden="true" />;
export const InboxIcon = ({ className = 'h-6 w-6' }) => <HeroInboxIcon className={className} aria-hidden="true" />;
export const HistoryIcon = ({ className = 'h-6 w-6' }) => <HeroClockIcon className={className} aria-hidden="true" />;
export const PanelIcon = ({ className = 'h-6 w-6' }) => <HeroSquares2X2Icon className={className} aria-hidden="true" />;
export const UsersIcon = ({ className = 'h-6 w-6' }) => <HeroUsersIcon className={className} aria-hidden="true" />;
export const SettingsIcon = ({ className = 'h-6 w-6' }) => <HeroCog6ToothIcon className={className} aria-hidden="true" />;
export const ArrowRightIcon = ({ className = 'h-4 w-4' }) => <HeroArrowRightIcon className={className} aria-hidden="true" />;
