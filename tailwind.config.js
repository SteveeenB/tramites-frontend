/** @type {import('tailwindcss').Config} */

// Tokens visuales alineados con el Módulo de Matrícula (SC-03).
// Matrícula usa Tailwind 4, cuya paleta está en OKLCH: el mismo nombre de clase
// no da el mismo color en nuestro Tailwind 3 (su red-700 es #c10007; el nuestro,
// #b91c1c). Por eso aquí se fijan en hex las escalas que usan para marca y estados.
// Detalle y fuentes: docs/integracion-ui-plan.md.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red:   { 50: '#fef2f2', 100: '#ffe2e2', 200: '#ffc9c9', 300: '#ffa2a2', 400: '#ff6467', 500: '#fb2c36', 600: '#e7000b', 700: '#c10007', 800: '#9f0712', 900: '#82181a', 950: '#460809' },
        green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#b9f8cf', 300: '#7bf1a8', 400: '#05df72', 500: '#00c950', 600: '#00a63e', 700: '#008236', 800: '#016630', 900: '#0d542b', 950: '#032e15' },
        amber: { 50: '#fffbeb', 100: '#fef3c6', 200: '#fee685', 300: '#ffd230', 400: '#ffb900', 500: '#fe9a00', 600: '#e17100', 700: '#bb4d00', 800: '#973c00', 900: '#7b3306', 950: '#461901' },
        blue:  { 50: '#eff6ff', 100: '#dbeafe', 200: '#bedbff', 300: '#8ec5ff', 400: '#51a2ff', 500: '#2b7fff', 600: '#155dfc', 700: '#1447e6', 800: '#193cb8', 900: '#1c398e', 950: '#162456' },
        // Rojo institucional UFPS, igual para todos los roles. El código nuevo usa estos alias.
        primario: {
          DEFAULT: '#c10007', // botones, cabecera de la sidebar, ítem activo, badge de rol
          hover: '#9f0712',
          suave: '#fef2f2',   // grupo abierto, hover de "Cerrar sesión"
          claro: '#ffe2e2',   // badges
          borde: '#ffc9c9',   // bordes rojos y anillo de foco
        },
        fondo: '#f3f4f6',     // fondo de página
      },
      fontFamily: {
        sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Oxygen', 'Ubuntu',
          'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
      width: { sidebar: '16rem' },
      keyframes: {
        'fade-in-up': { from: { opacity: '0', transform: 'translateY(36px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-left': { from: { opacity: '0', transform: 'translateX(-48px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'modal-in': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'overlay-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'dropdown-in': { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'alert-in': { from: { opacity: '0', transform: 'translateY(-16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in-up': 'fade-in-up 1.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 1.5s ease both',
        'slide-left': 'slide-left 1.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'modal-in': 'modal-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        'overlay-in': 'overlay-in 0.2s ease both',
        'dropdown-in': 'dropdown-in 0.15s cubic-bezier(0.22, 1, 0.36, 1) both',
        'alert-in': 'alert-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
