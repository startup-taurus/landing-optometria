'use client';

import { useEffect, useRef, useState } from "react";
import { PLAN_CURRENCY, PLAN_REFERENCE } from "@/lib/payphone-constants";

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: PayphoneBoxConfig) => { render: (id: string) => void };
  }
}

interface PayphoneBoxConfig {
  token: string;
  clientTransactionId: string;
  amount: number;
  amountWithTax: number;
  amountWithoutTax: number;
  tax: number;
  service?: number;
  tip?: number;
  currency: string;
  storeId: string;
  reference: string;
  responseUrl: string;
  cancellationUrl?: string;
  email?: string;
  phoneNumber?: string;
  defaultMethod?: string;
  lang?: string;
  documentId?: string;
  identification?: string;
  identificationType?: number; // 1=Cédula, 2=RUC, 3=Pasaporte (doc oficial)
  showPayphonePayment?: boolean;
  showCashPayment?: boolean;
  showCardPayment?: boolean;
}

// Versión oficial actual de la Cajita (https://docs.payphone.app/cajita-de-pagos).
// La doc exige DOS recursos: el script (type="module") y su hoja de estilos.
// La v1.1 (sin CSS) renderiza/comporta mal → usamos v2.0 con su CSS obligatorio.
const SCRIPT_SRC = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js";
const STYLE_SRC = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css";
const CONTAINER_ID = "pp-button";

let scriptPromise: Promise<void> | null = null;

// Inyecta la hoja de estilos obligatoria de la Cajita una sola vez.
function ensureStylesheet(): void {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${STYLE_SRC}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = STYLE_SRC;
  document.head.appendChild(link);
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  ensureStylesheet();
  if (window.PPaymentButtonBox) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Script Payphone falló")));
      if (window.PPaymentButtonBox) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    // La Cajita v2.0 se sirve como módulo ES (así lo indica la doc oficial).
    s.type = "module";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar el script de Payphone"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface Props {
  clientTransactionId: string;
  email: string;
  phone: string;
  documentId?: string;
  amount: number;
  amountWithTax: number;
  amountWithoutTax: number;
  tax: number;
  reference?: string;
  onError?: (msg: string) => void;
  // Se llama cuando Payphone responde "Ya existe una transacción con el
  // ClientTransactionId…". El padre debe pedir un id NUEVO y remontar la Cajita.
  onDuplicate?: () => void;
}

export default function PayphoneBox({
  clientTransactionId,
  email,
  phone,
  documentId,
  amount,
  amountWithTax,
  amountWithoutTax,
  tax,
  reference,
  onError,
  onDuplicate,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const renderedFor = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) onError?.(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [onError]);

  useEffect(() => {
    if (!ready || !ref.current) return;
    if (renderedFor.current === clientTransactionId) return;

    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
    const storeId = process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;

    if (!token || !storeId) {
      onError?.("Configuración de pago incompleta.");
      return;
    }
    if (!window.PPaymentButtonBox) {
      onError?.("La cajita de Payphone no se inicializó.");
      return;
    }

    const container = ref.current;
    container.innerHTML = "";

    // Al montar, la Cajita a veces enfoca un input y el navegador desplaza la
    // página FUERA del formulario (el usuario tenía que hacer scroll hacia arriba).
    // Tras pintar, la traemos de vuelta a la vista con el mínimo desplazamiento.
    let scrollTimer: number | undefined;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const bringIntoView = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Solo si quedó (en gran parte) fuera de la vista.
      if (rect.top < 8 || rect.top > vh * 0.8) {
        container.scrollIntoView({
          block: "nearest",
          behavior: reduceMotion ? "auto" : "smooth",
        });
      }
    };

    // SIEMPRE retornamos por la ruta SERVER /api/payphone/response: captura el
    // `ctoken` (cardToken) del redirect sin exponerlo y reenvía a la página de
    // resultado con la URL limpia. Antes esto dependía de un flag de CLIENTE
    // (TOKENIZATION_ENABLED); si en el navegador quedaba en `false`, el retorno
    // iba directo a la página, el `ctoken` se perdía y NO se creaba la suscripción
    // → sin renovación. Por eso ahora es incondicional (la ruta server redirige
    // limpio también cuando no hay token).
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const responseUrl = `${origin}/api/payphone/response`;
    const cancellationUrl = `${origin}/payphone/response`;

    let observer: MutationObserver | undefined;
    try {
      new window.PPaymentButtonBox({
        token,
        clientTransactionId,
        amount,
        amountWithTax,
        amountWithoutTax,
        tax,
        service: 0,
        tip: 0,
        currency: PLAN_CURRENCY,
        storeId,
        reference: reference || PLAN_REFERENCE,
        responseUrl,
        cancellationUrl,
        email,
        phoneNumber: phone,
        // Cédula/RUC del titular (necesaria para tokenización; opcional sin ella).
        // identificationType (doc oficial): 1=Cédula (10 díg.), 2=RUC (13 díg.).
        // VERIFY-2: si la Cajita requiere un flag explícito para devolver el
        // cardToken, se agrega aquí cuando se confirme en sandbox.
        ...(documentId
          ? { documentId, identificationType: documentId.length === 13 ? 2 : 1 }
          : {}),
        lang: "es",
        showPayphonePayment: false,
        showCashPayment: false,
        showCardPayment: true,
      }).render(CONTAINER_ID);
      renderedFor.current = clientTransactionId;

      // La Cajita pinta su contenido de forma asíncrona (carga + prepare); damos
      // un respiro y luego corregimos el scroll si la página saltó.
      scrollTimer = window.setTimeout(bringIntoView, 450);

      // La Cajita muestra el error de id duplicado INLINE y no avisa al padre.
      // Vigilamos el texto del contenedor; si aparece, pedimos un id nuevo
      // (onDuplicate) para que el siguiente intento use un clientTransactionId
      // virgen y no caiga en "Ya existe una transacción…".
      if (onDuplicate) {
        observer = new MutationObserver(() => {
          const txt = (container.textContent || "").toLowerCase();
          if (
            txt.includes("clienttransactionid") ||
            txt.includes("ya existe una transacci")
          ) {
            observer?.disconnect();
            onDuplicate();
          }
        });
        observer.observe(container, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    } catch (err) {
      onError?.((err as Error).message || "No se pudo abrir la pasarela");
    }

    return () => {
      observer?.disconnect();
      if (scrollTimer) window.clearTimeout(scrollTimer);
    };
  }, [
    ready,
    clientTransactionId,
    email,
    phone,
    documentId,
    amount,
    amountWithTax,
    amountWithoutTax,
    tax,
    reference,
    onError,
    onDuplicate,
  ]);

  return (
    <div className="w-full">
      <div id={CONTAINER_ID} ref={ref} className="w-full min-h-[60px]" />
      {!ready && (
        <p className="text-center font-body text-sm text-muted py-3">
          Cargando pasarela segura…
        </p>
      )}
    </div>
  );
}
