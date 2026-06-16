'use client';

import { useEffect, useRef, useState } from "react";
import {
  PLAN_AMOUNT_TOTAL,
  PLAN_AMOUNT_WITH_TAX,
  PLAN_AMOUNT_WITHOUT_TAX,
  PLAN_TAX,
  PLAN_CURRENCY,
} from "@/lib/payphone";

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
  showPayphonePayment?: boolean;
  showCashPayment?: boolean;
  showCardPayment?: boolean;
}

const SCRIPT_SRC = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
const CONTAINER_ID = "pp-button";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
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
  onError?: (msg: string) => void;
}

export default function PayphoneBox({ clientTransactionId, email, phone, onError }: Props) {
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

    ref.current.innerHTML = "";

    const responseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/payphone/response`
        : "/payphone/response";

    try {
      new window.PPaymentButtonBox({
        token,
        clientTransactionId,
        amount: PLAN_AMOUNT_TOTAL,
        amountWithTax: PLAN_AMOUNT_WITH_TAX,
        amountWithoutTax: PLAN_AMOUNT_WITHOUT_TAX,
        tax: PLAN_TAX,
        service: 0,
        tip: 0,
        currency: PLAN_CURRENCY,
        storeId,
        reference: "Dioptrika - Plan mensual",
        responseUrl,
        cancellationUrl: responseUrl,
        email,
        phoneNumber: phone,
        lang: "es",
        showPayphonePayment: false,
        showCashPayment: false,
        showCardPayment: true,
      }).render(CONTAINER_ID);
      renderedFor.current = clientTransactionId;
    } catch (err) {
      onError?.((err as Error).message || "No se pudo abrir la pasarela");
    }
  }, [ready, clientTransactionId, email, phone, onError]);

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
