'use client';

import { motion } from "framer-motion";
import {
  Users, FileText, TestTube, Package,
  ShoppingCart, Calendar, MessageCircle, BarChart3
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { staggerCards, fadeInUp, VIEWPORT_DEFAULT } from "@/lib/animations";

const features = [
  {
    icon: Users,
    title: "Gestión de pacientes",
    description: "Registro centralizado con foto, datos de contacto e historial médico completo por paciente.",
    color: "from-sky/20 to-sky/5",
    iconColor: "text-sky",
  },
  {
    icon: FileText,
    title: "Historia clínica digital",
    description: "Agudeza visual, refracción, queratometría y diagnóstico oftalmológico en un solo formulario digital.",
    color: "from-teal/20 to-teal/5",
    iconColor: "text-teal",
  },
  {
    icon: TestTube,
    title: "Pedidos de laboratorio",
    description: "Crea, envía y rastrea órdenes de lentes con especificaciones ópticas precisas para cada paciente.",
    color: "from-sky/20 to-sky/5",
    iconColor: "text-sky",
  },
  {
    icon: Package,
    title: "Inventario inteligente",
    description: "Control de stock de monturas, lentes y accesorios con alertas automáticas de bajo inventario.",
    color: "from-teal/20 to-teal/5",
    iconColor: "text-teal",
  },
  {
    icon: ShoppingCart,
    title: "Órdenes de compra",
    description: "Gestión de proveedores, cotizaciones y facturación electrónica al SRI desde el mismo sistema.",
    color: "from-navy/20 to-navy/5",
    iconColor: "text-navy",
  },
  {
    icon: Calendar,
    title: "Agenda por sucursal",
    description: "Calendario por sucursal con estados de cita y vista por día, semana o mes.",
    color: "from-sky/20 to-sky/5",
    iconColor: "text-sky",
  },
  {
    icon: MessageCircle,
    title: "Notificaciones WhatsApp",
    description: "Recordatorios automáticos a pacientes vía WhatsApp, configurables por reglas y horarios silenciosos.",
    color: "from-teal/20 to-teal/5",
    iconColor: "text-teal",
  },
  {
    icon: BarChart3,
    title: "Dashboard analytics",
    description: "Métricas en tiempo real: ventas, diagnósticos frecuentes, tendencia de citas y top productos.",
    color: "from-navy/20 to-navy/5",
    iconColor: "text-navy",
  },
];

export default function Features() {
  return (
    <section id="caracteristicas" className="relative py-24 sm:py-28 bg-white overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky/40 to-transparent"
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 sm:mb-20 max-w-2xl mx-auto">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-sky mb-4">
              Plataforma todo-en-uno
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2
              className="font-jakarta font-bold text-navy mb-5"
              style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
            >
              Todo lo que tu clínica necesita,{" "}
              <span className="text-aurora">en un solo lugar</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.1}>
            <p className="font-inter text-text-muted text-lg leading-relaxed">
              Desde el primer paciente hasta el análisis del negocio, la plataforma
              cubre cada aspecto operativo de tu óptica o clínica oftalmológica.
            </p>
          </Reveal>
        </div>

        <motion.div
          variants={staggerCards}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeInUp}>
              <TiltCard className="h-full">
                <div className="relative h-full rounded-card border border-border bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover overflow-hidden group">
                  <div
                    aria-hidden
                    className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${f.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-bg-blue flex items-center justify-center mb-4 ring-1 ring-sky/15 group-hover:ring-sky/40 transition-all">
                      <f.icon className={`w-5 h-5 ${f.iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`} />
                    </div>
                    <h3 className="font-jakarta font-semibold text-navy text-base mb-2">
                      {f.title}
                    </h3>
                    <p className="font-inter text-text-muted text-sm leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
