import React from 'react';
import {
  ArrowDownTrayIcon as HeroArrowDownTrayIcon,
  ArrowUpTrayIcon as HeroArrowUpTrayIcon,
  CheckIcon as HeroCheckIcon,
  DocumentTextIcon as HeroDocumentTextIcon,
  ExclamationTriangleIcon as HeroExclamationTriangleIcon,
  LockClosedIcon as HeroLockClosedIcon,
  LockOpenIcon as HeroLockOpenIcon,
  PaperAirplaneIcon as HeroPaperAirplaneIcon,
  ReceiptPercentIcon as HeroReceiptPercentIcon,
  XMarkIcon as HeroXMarkIcon,
} from '@heroicons/react/24/outline';

// Íconos del proceso de grado.
// Mismo set que el Módulo de Matrícula (Heroicons 24/outline); se conservan
// los nombres y tamaños por defecto para no tocar a quien los importa.

export const CheckIcon = ({ className = 'h-5 w-5' }) => <HeroCheckIcon className={className} aria-hidden="true" />;
export const WarningIcon = ({ className = 'h-5 w-5' }) => <HeroExclamationTriangleIcon className={className} aria-hidden="true" />;
export const LockIcon = ({ className = 'h-5 w-5' }) => <HeroLockClosedIcon className={className} aria-hidden="true" />;
export const OpenLockIcon = ({ className = 'h-5 w-5' }) => <HeroLockOpenIcon className={className} aria-hidden="true" />;
export const SendIcon = ({ className = 'h-4 w-4' }) => <HeroPaperAirplaneIcon className={className} aria-hidden="true" />;
export const ReceiptIcon = ({ className = 'h-5 w-5' }) => <HeroReceiptPercentIcon className={className} aria-hidden="true" />;
export const DownloadIcon = ({ className = 'h-5 w-5' }) => <HeroArrowDownTrayIcon className={className} aria-hidden="true" />;
export const DocumentIcon = ({ className = 'h-5 w-5' }) => <HeroDocumentTextIcon className={className} aria-hidden="true" />;
export const UploadIcon = ({ className = 'h-5 w-5' }) => <HeroArrowUpTrayIcon className={className} aria-hidden="true" />;
export const XIcon = ({ className = 'h-4 w-4' }) => <HeroXMarkIcon className={className} aria-hidden="true" />;
