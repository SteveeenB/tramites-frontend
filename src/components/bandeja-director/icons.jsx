import React from 'react';
import {
  ArrowLeftIcon as HeroArrowLeftIcon,
  CheckCircleIcon as HeroCheckCircleIcon,
  ClockIcon as HeroClockIcon,
  EyeIcon as HeroEyeIcon,
  XCircleIcon as HeroXCircleIcon,
} from '@heroicons/react/24/outline';

// Íconos de las bandejas.
// Mismo set que el Módulo de Matrícula (Heroicons 24/outline); se conservan
// los nombres y tamaños por defecto para no tocar a quien los importa.

export const ClockIcon = ({ className = 'h-5 w-5' }) => <HeroClockIcon className={className} aria-hidden="true" />;
export const XCircleIcon = ({ className = 'h-5 w-5' }) => <HeroXCircleIcon className={className} aria-hidden="true" />;
export const CheckCircleIcon = ({ className = 'h-5 w-5' }) => <HeroCheckCircleIcon className={className} aria-hidden="true" />;
export const ArrowLeftIcon = ({ className = 'h-4 w-4' }) => <HeroArrowLeftIcon className={className} aria-hidden="true" />;
export const EyeIcon = ({ className = 'h-5 w-5' }) => <HeroEyeIcon className={className} aria-hidden="true" />;
