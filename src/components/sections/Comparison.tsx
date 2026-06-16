'use client';

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ScrollHighlight from "@/components/ui/ScrollHighlight";
import { VIEWPORT_DEFAULT } from "@/lib/animations";

const without = [
  "Datos del paciente repartidos entre Excel, agenda y papel",
  "Pedidos al laboratorio dictados por teléfono o WhatsApp suelto",
  "Stock de monturas y lentes en cuadernos que se desfasan",
  "Recordatorios de citas escritos a mano o copiados uno por uno",
  "Cada sucursal con su propia versión de la verdad",
  "Reportes que toman horas de armar a fin de mes",
];

const withSystem = [
  "Ficha única del paciente con foto, historial y refracciones en línea",
  "Órdenes a laboratorio con especificaciones precisas y trazabilidad",
  "Inventario en tiempo real, con alertas de stock bajo automáticas",
  "WhatsApp integrado: confirmaciones y recordatorios automáticos",
  "Multi-sucursal con stock transferible y vista del admin por local",
  "Dashboard en tiempo real: ventas, citas y diagnósticos frecuentes",
];

export default function Comparison() {
  return (
    <section className="relative overflow-hidden bg-canvas py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          {/* Reveal palabra-por-palabra al hacer scroll (acento → verde marca). */}
          <ScrollHighlight
            as="h2"
            className="font-display font-bold"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            segments={[
              { text: "De Excel y papel " },
              { text: "a una óptica que funciona sola", accent: true },
            ]}
          />
          <Reveal variant="up" delay={0.06}>
            <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
              Si todavía gestionas con planillas, libretas y herramientas genéricas que no
              entienden de refracciones, esto es lo que cambia con Dioptrika.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {/* Sin sistema — entra amplio desde la izquierda y se queda fija
              (sin deriva por scroll: las dos columnas se mueven coordinadas). */}
          <motion.div
            initial={{ opacity: 0, x: -64 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT_DEFAULT}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            className="h-full rounded-card border border-line bg-surface-2 p-7 sm:p-8"
          >
            <div className="mb-6">
              <span className="kicker !text-muted">Hoy, sin sistema</span>
              <h3 className="mt-2 font-display text-lg font-bold text-ink-2">
                Excel, papel o herramientas genéricas
              </h3>
            </div>
            <ul className="space-y-1">
              {without.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={VIEWPORT_DEFAULT}
                  transition={{ duration: 0.45, delay: 0.08 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-start gap-3 py-2.5 ${
                    i < without.length - 1 ? "border-b border-line/70" : ""
                  }`}
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line-strong text-muted">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-[14px] leading-relaxed text-muted">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Con Dioptrika — entra amplio desde la derecha y se queda fija. */}
          <motion.div
            initial={{ opacity: 0, x: 64 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT_DEFAULT}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            className="h-full rounded-card border border-brand/35 bg-surface p-7 shadow-float sm:p-8"
          >
            <div className="mb-6">
              <span className="kicker">Con Dioptrika</span>
              <h3 className="mt-2 font-display text-lg font-bold text-ink">
                Una plataforma especializada
              </h3>
            </div>
            <ul className="space-y-1">
              {withSystem.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={VIEWPORT_DEFAULT}
                  transition={{ duration: 0.45, delay: 0.12 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-start gap-3 py-2.5 ${
                    i < withSystem.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cta text-cta-on">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink-2">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
