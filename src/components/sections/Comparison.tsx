'use client';

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { fadeInLeft, fadeInRight, VIEWPORT_DEFAULT } from "@/lib/animations";

const without = [
  "Datos del paciente repartidos entre Excel, agenda y papel",
  "Pedidos al laboratorio dictados por teléfono o WhatsApp suelto",
  "Stock de monturas y lentes en cuadernos o planillas que se desfasan",
  "Recordatorios de citas escritos a mano o copiados uno por uno",
  "Cada sucursal con su propia versión de la verdad",
  "Reportes que toman horas de armar a fin de mes",
];

const withSystem = [
  "Ficha única del paciente con foto, historial y refracciones en línea",
  "Órdenes a laboratorio con especificaciones precisas y trazabilidad",
  "Inventario en tiempo real, alertas de stock bajo automáticas",
  "WhatsApp integrado: confirmaciones y recordatorios automáticos al paciente",
  "Multi-sucursal con stock transferible y vista del admin por sucursal",
  "Dashboard en tiempo real: ventas, citas, diagnósticos frecuentes",
];

export default function Comparison() {
  return (
    <section className="relative py-24 sm:py-28 overflow-hidden bg-white">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky/40 to-transparent"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-teal mb-4">
              El antes y el después
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2
              className="font-jakarta font-bold text-navy mb-5"
              style={{ fontSize: "clamp(30px, 4vw, 48px)" }}
            >
              De Excel y papel{" "}
              <span className="text-aurora">a una clínica que funciona sola</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.1}>
            <p className="font-inter text-text-muted text-lg">
              Si todavía gestionas tu óptica con planillas, libretas y herramientas
              genéricas que no entienden de refracciones, esto es lo que cambia.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_DEFAULT}
            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            className="relative rounded-card border border-border bg-bg-slate/60 p-7 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-inter text-xs uppercase tracking-widest text-text-muted">Sin sistema especializado</p>
                <h3 className="font-jakarta font-bold text-navy text-lg">Excel, papel o herramientas genéricas</h3>
              </div>
            </div>
            <ul className="space-y-3.5">
              {without.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEWPORT_DEFAULT}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 inline-flex shrink-0 w-4 h-4 rounded-full bg-red-500/15 items-center justify-center">
                    <X className="w-2.5 h-2.5 text-red-500" strokeWidth={3} />
                  </span>
                  <span className="font-inter text-text-muted text-sm leading-relaxed">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_DEFAULT}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            className="relative rounded-card border-aurora bg-white p-7 sm:p-8 shadow-glow-sky"
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-sky/15 blur-3xl pointer-events-none"
            />
            <div className="relative flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky to-teal flex items-center justify-center shadow-glow-sky">
                <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-inter text-xs uppercase tracking-widest text-sky">Con LatamSoft</p>
                <h3 className="font-jakarta font-bold text-navy text-lg">Plataforma especializada</h3>
              </div>
            </div>
            <ul className="relative space-y-3.5">
              {withSystem.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEWPORT_DEFAULT}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 inline-flex shrink-0 w-4 h-4 rounded-full bg-gradient-to-br from-sky to-teal items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="font-inter text-text text-sm leading-relaxed">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
