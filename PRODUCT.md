# Product

## Register

brand

## Users

Dueños y administradores de **ópticas** en Latinoamérica (Ecuador primero), normalmente
no técnicos: optometristas y comerciantes que hoy gestionan su negocio con Excel, libretas,
agenda de papel y WhatsApp suelto. Llegan a la landing buscando una sola herramienta
especializada que ordene historia clínica, refracciones, laboratorio, inventario y
facturación. Deciden por confianza y por "esto entiende mi rubro", no por specs.

## Product Purpose

Dioptrika es **software clínico especializado para ópticas**: centraliza historias clínicas
oftalmológicas, órdenes de laboratorio, inventario, agenda y facturación electrónica
(Ecuador/SRI) en un sistema multi-sucursal. La landing existe para convertir: comunicar que
es un sistema *hecho para ópticas* (no un ERP genérico adaptado), generar confianza y llevar
a "Ver planes" (checkout Payphone) o "Solicitar demo" (WhatsApp). Éxito = el visitante siente
precisión clínica y agenda demo o paga.

## Brand Personality

Preciso · clínico · humano. Voz de instrumento óptico: claro, medido, sin ruido — pero cálido
y en español de LatAm, no corporativo frío. Debe evocar **claridad y confianza** (la sensación
de enfocar bien una lente), no urgencia ni hype. "Menos administración, más tiempo para tus
pacientes."

## Anti-references

- El **dark-SaaS genérico con glow verde** que produce la IA por defecto (gradient-text,
  glass por todos lados, blobs aurora, ruido `feTurbulence`, mockup con tarjetas flotantes
  "1.284 / +12%"). Era exactamente el estado anterior de esta misma landing.
- Eyebrows en mayúsculas + marcadores numerados (01/02/03) sobre cada sección como andamiaje.
- Lo editorial-revista (serif display + itálicas + drop caps): no es una revista.
- Frío/corporativo azul-marino-y-dorado de fintech. Esto es salud + óptica, no banca.

## Design Principles

1. **Instrumento óptico, no SaaS oscuro.** El sitio se ve como un instrumento de precisión:
   claro por defecto, líneas finas (hairlines) tipo diagrama de lente / cartilla optométrica,
   alineación exacta. La identidad la lleva el verde de marca como acento, no como relleno.
2. **Claridad sobre decoración.** Cada elemento informa. Si un degradado, glow o glass no
   comunica, se elimina. Enfocar (blur→nítido) es el único motivo decorativo permitido,
   porque *es* la marca (óptica = enfocar).
3. **Hecho para ópticas, demostrado.** Mostrar el producto real (refracción OD/OI, pedidos a
   laboratorio, multi-sucursal) con datos de optometría creíbles — no claims vacíos.
4. **Una verdad, dicha una vez.** Narrativa tensa: cada sección agrega algo nuevo. Nada de
   repetir "somos especializados" en cuatro secciones distintas.
5. **Dos mundos, una marca.** Claro (sala de examen) y oscuro (cuarto oscuro / foróptero)
   comparten el mismo verde y la misma precisión. El usuario elige; por defecto, claro.

## Accessibility & Inclusion

- WCAG 2.1 AA. Cuerpo ≥4.5:1, texto grande ≥3:1 en **ambos** temas (el verde de marca es
  acento/relleno, no texto pequeño sobre blanco; para texto verde se usa el verde profundo).
- `prefers-reduced-motion`: alternativa de fundido/instantánea para toda animación; los
  reveals realzan contenido ya visible (nunca ocultan contenido tras una clase).
- Toggle de tema accesible (botón con `aria-label`, persistido en localStorage, sin flash).
- Navegación por teclado y foco visible; objetivos táctiles ≥44px.
