import React, { useRef } from 'react';

const ICON_IMAGE = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
  </svg>
);

const ICON_DOC = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
  </svg>
);

const ICON_UPLOAD = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ICONS = { image: ICON_IMAGE, doc: ICON_DOC, upload: ICON_UPLOAD };

const FileSlot = ({ label, formats, required = false, accept, file, onChange, icon = 'upload' }) => {
  const inputRef = useRef(null);

  const handleClick = () => inputRef.current?.click();

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {required
          ? <span className="text-red-700 text-sm font-bold">*</span>
          : <span className="text-xs font-medium text-gray-500">(Opcional)</span>}
      </div>
      <p className="text-xs text-gray-500">{formats}</p>

      <div
        onClick={handleClick}
        className={`flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
          file
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50'
        }`}
      >
        {file ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="max-w-full truncate text-center text-xs font-medium text-green-700">
              {file.name}
            </p>
            <button
              type="button"
              onClick={handleRemove}
              className="mt-1 text-xs font-semibold text-red-700 hover:text-red-800"
            >
              Cambiar archivo
            </button>
          </>
        ) : (
          <>
            {ICONS[icon]}
            <p className="text-xs font-medium text-gray-600">Seleccionar archivo</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

export default FileSlot;
