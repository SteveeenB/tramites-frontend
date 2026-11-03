# Prompt · Alinear el estilo visual con el Módulo de Matrícula

> Para una sesión aparte (pendiente §2 de `tramites-backend/docs/integracion-matricula-pendientes.md`). Copiar el bloque completo como primer mensaje de la sesión.

Hallazgos previos (2 nov 2026), útiles como punto de partida:
- **Matrícula no tiene tokens de diseño centralizados.** Su `src/index.css` solo define la fuente (Segoe UI) y animaciones; los colores parecen estar repartidos como clases sueltas en cada componente.
- **Tienen el sidebar duplicado:** uno por rol (`vistas/aspirante`, `vistas/programa` y `vistas/superadmin`) además de `components/AppSidebar.tsx`. Nosotros tenemos uno solo, con colores por rol en `constants/tramitesColors.js`.

````text
Quiero alinear el estilo visual del frontend de Trámites con el del Módulo de Matrícula, conservando nuestra estructura y sin copiar sus malas prácticas.

## Contexto
- Nuestro frontend: C:\AYD\tramites-posgrados\frontend (repo SteveeenB/tramites-frontend, rama develop).
  React 19 + Create React App (react-scripts 5) + Tailwind 3 + JavaScript.
  Estructura que se conserva: src/pages, src/components (un solo components/sidebar/AppSidebar.jsx para todos los roles), src/hooks, src/api, src/context/AuthContext.js, src/config/menuConfig.js y src/constants/tramitesColors.js (colores por rol).
- Frontend de Matrícula (solo lectura, es la referencia visual): C:\AYD\externos\matricula-frontend, rama prod.
  React 19 + Vite + Tailwind 4 + TypeScript + @heroicons/react. Estilo base en src/index.css (fuente Segoe UI y animaciones); layouts en src/layouts; componentes en src/components y src/vistas/*/components.
- Su backend de pruebas: https://posgrados-api-d4yv.onrender.com/posgrados-project (copia en Render; tarda ~2 min en despertar).

## Objetivo
Que Trámites se vea como parte de la misma plataforma que Matrícula: colores, tipografía, espaciados, bordes, sombras, íconos, animaciones y aspecto de layout, sidebar, encabezado, botones, tarjetas, tablas, formularios, modales, badges y alertas. Sin cambiar comportamiento, rutas, llamadas al API ni lógica.

## Cómo quiero que trabajes
1. Inventario de su estilo, antes de tocar nada:
   - Lee su código y saca los valores reales: colores (hex y para qué se usa cada uno), tipografía, radios, sombras, espaciados, breakpoints, animaciones e íconos.
   - Si puedes, corre su frontend en local (VITE_API_URL apuntando a la copia en Render) y toma capturas de sus pantallas principales como referencia.
   - Lista las malas prácticas que encuentres, para NO copiarlas: componentes duplicados por rol (tienen 3 Sidebar.tsx más AppSidebar), colores hex repetidos en vez de tokens, estilos inline, accesibilidad pobre, etc.
2. Plan para mi aprobación, sin implementar todavía:
   - Tabla de tokens: su valor → dónde va en nuestro tailwind.config.js (theme.extend) y en tramitesColors.js.
   - Tabla de componentes: componente suyo → equivalente nuestro → qué cambia.
   - Orden de PRs pequeños: 1) tokens y fuente, 2) layout, sidebar y encabezado, 3) componentes base, 4) páginas por rol.
3. Implementación por PR, después de que apruebe el plan.

## Restricciones
- No migrar a Vite, TypeScript ni Tailwind 4: traducir sus valores a nuestro Tailwind 3.
- Ningún color hex suelto en componentes: todo sale de tokens (tailwind.config.js o tramitesColors.js).
- Mantener un solo AppSidebar parametrizado por rol; no crear variantes por rol.
- No agregar librerías de UI. @heroicons/react solo si me lo propones y lo apruebo.
- Accesibilidad: contraste WCAG AA, foco visible en todo lo interactivo, textos alternativos y navegación con teclado.
- Responsive desde 360 px.
- No romper la CI: CI=true npm run build (los warnings cuentan como error).
- No tocar la lógica de DEMO_USERS / demoUsers.js (TP-147) ni AuthContext, salvo estilos.

## Verificación por PR
- Capturas antes/después por rol: estudiante, director, posgrados, dependencia y admin. Usa el modo demo en local: REACT_APP_DEMO_MODE=true y el backend con el perfil h2.
- Comparación lado a lado con las capturas de Matrícula.

## Flujo de ramas
Rama nueva por PR, con PR a develop. Lo mergeas tú cuando la CI pase. Nada directo a main.
````
