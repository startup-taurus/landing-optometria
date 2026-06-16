import {
  confirmTransactionWithPayphone,
  isApproved,
  sanitizeForClient,
  verifyClientTransactionId,
  PLAN_AMOUNT_TOTAL,
  type PayphoneConfirmResponse,
  type StoredTransaction,
} from "./payphone";
import { getTransaction, updateTransaction } from "./transactions";
import {
  sendCustomerReceipt,
  sendInternalNotification,
  sendAmountMismatchAlert,
} from "./email";

function isValidEmail(s: string | undefined): boolean {
  return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export interface ConfirmOutcome {
  success: boolean;
  alreadyConfirmed?: boolean;
  reference?: string;
  payment?: ReturnType<typeof sanitizeForClient>;
  error?: string;
  /** Estado HTTP sugerido para la ruta /api/payphone/confirm. */
  httpStatus: number;
}

/**
 * Confirma un pago de la Cajita contra Payphone (server-to-server) y persiste el
 * resultado de forma idempotente. Es la ÚNICA fuente de verdad de la confirmación:
 * la usa tanto la página server-side /payphone/response (capturando el redirect de
 * Payphone sin depender del JS del navegador) como la ruta /api/payphone/confirm.
 *
 * Garantías:
 *  - Idempotente: si ya está "approved", devuelve el recibo hidratado sin re-llamar.
 *  - Compare-and-set: solo la llamada que hace la transición pending->approved envía
 *    los correos (evita recibos/avisos duplicados en confirmaciones concurrentes).
 *  - Fallo de transporte (throw) NO marca "failed": queda elegible para reintento
 *    dentro de la ventana de 5 min antes de que Payphone revierta.
 */
export async function confirmPayment(input: {
  id: unknown;
  clientTransactionId: unknown;
}): Promise<ConfirmOutcome> {
  const idNum = Number(input.id);
  const clientTransactionId = (input.clientTransactionId ?? "").toString();

  if (!Number.isFinite(idNum) || idNum <= 0) {
    return { success: false, error: "id inválido", httpStatus: 400 };
  }
  if (!verifyClientTransactionId(clientTransactionId)) {
    return { success: false, error: "Referencia inválida", httpStatus: 400 };
  }

  // Idempotencia: si ya está aprobada, devolvemos el recibo COMPLETO hidratado desde
  // el almacén (autorización, tarjeta, monto) para que un refresh muestre todo igual.
  const stored = await getTransaction(clientTransactionId);
  if (stored?.status === "approved") {
    return {
      success: true,
      alreadyConfirmed: true,
      reference: clientTransactionId,
      payment: sanitizeForClient({
        transactionId: stored.payphoneTransactionId,
        clientTransactionId,
        statusCode: 3,
        transactionStatus: "Approved",
        authorizationCode: stored.authorizationCode,
        cardBrand: stored.cardBrand,
        lastDigits: stored.lastDigits,
        amount: PLAN_AMOUNT_TOTAL,
      }),
      httpStatus: 200,
    };
  }

  let payphoneResponse: PayphoneConfirmResponse;
  try {
    payphoneResponse = await confirmTransactionWithPayphone({
      id: idNum,
      clientTransactionId,
    });
  } catch (err) {
    console.error("[confirm] fallo llamando a Payphone:", (err as Error).message);
    // No marcamos failed: error de transporte → reintentable dentro de los 5 min.
    return {
      success: false,
      error: "No pudimos verificar el pago. Intenta nuevamente.",
      httpStatus: 502,
    };
  }

  const statusApproved = isApproved(payphoneResponse);
  const amountOk = Number(payphoneResponse.amount) === PLAN_AMOUNT_TOTAL;
  const approved = statusApproved && amountOk;
  const amountMismatch = statusApproved && !amountOk;

  if (amountMismatch) {
    console.error(
      `[confirm] MONTO NO COINCIDE ref=${clientTransactionId} ` +
        `esperado=${PLAN_AMOUNT_TOTAL} recibido=${payphoneResponse.amount} ` +
        `ppTxId=${payphoneResponse.transactionId}`
    );
  }

  const nextStatus: "approved" | "failed" | "amount_mismatch" = approved
    ? "approved"
    : amountMismatch
      ? "amount_mismatch"
      : "failed";

  // chargeCaptured = Payphone YA tomó el dinero (aprobado o aprobado-con-monto-distinto).
  // A partir de aquí, una falla de disco o la ausencia de fila NO puede dejar el cobro
  // sin rastro humano: ese es el invariante que protegen los bloques de abajo.
  const chargeCaptured = approved || amountMismatch;
  const now = new Date().toISOString();

  // Si no había fila previa (almacén borrado/reiniciado o falla en /init) usamos un lead
  // mínimo, para reconstruir el registro y nunca perder un cobro ya capturado.
  const baseLead = stored?.lead ?? { name: "(desconocido)", email: "", phone: "" };

  // Transición atómica (compare-and-set). Reconstruye la fila si no existía.
  // willEmail = true SOLO si ESTA llamada sella emailedAt por primera vez (evita reenvíos).
  let willEmail = false;
  let persisted: StoredTransaction | null = null;
  let persistFailed = false;
  try {
    persisted = await updateTransaction(clientTransactionId, (current) => {
      if (current?.status === "approved") return null; // otra llamada ya ganó
      const base: StoredTransaction = current ?? {
        clientTransactionId,
        status: "pending",
        createdAt: now,
        lead: baseLead,
      };
      const sealEmail = chargeCaptured && !base.emailedAt;
      willEmail = sealEmail;
      return {
        ...base,
        status: nextStatus,
        confirmedAt: now,
        payphoneTransactionId:
          typeof payphoneResponse.transactionId === "number"
            ? payphoneResponse.transactionId
            : base.payphoneTransactionId,
        authorizationCode: payphoneResponse.authorizationCode,
        cardBrand: payphoneResponse.cardBrand,
        lastDigits: payphoneResponse.lastDigits,
        // Sellamos emailedAt en la misma escritura para que el envío sea único.
        emailedAt: sealEmail ? now : base.emailedAt,
      };
    });
  } catch (err) {
    // El cobro ya está hecho en Payphone, pero la persistencia falló (disco lleno, EPERM
    // en rename, etc.). NO se puede perder un cobro irreversible en silencio.
    persistFailed = true;
    console.error(
      `[confirm] PERSISTENCIA FALLÓ tras Confirm ref=${clientTransactionId} ` +
        `ppTxId=${payphoneResponse.transactionId} auth=${payphoneResponse.authorizationCode} ` +
        `amount=${payphoneResponse.amount} status=${nextStatus}: ${(err as Error).message}`
    );
  }

  if (!stored && chargeCaptured) {
    console.warn(
      `[confirm] cobro capturado sin fila previa ref=${clientTransactionId} ` +
        `(¿almacén reiniciado?) — registro reconstruido y equipo alertado.`
    );
  }

  // INVARIANTE: si Payphone capturó el cobro, SIEMPRE sale una señal humana.
  if (chargeCaptured) {
    if (persistFailed) {
      // Alerta de respaldo (no depende del disco) para conciliar manualmente. Reutiliza el
      // lead real si lo teníamos. Puede duplicarse si el usuario reintenta — aceptable
      // frente a la alternativa (un cobro irreversible sin ningún aviso).
      const alertTx: StoredTransaction = {
        ...(stored ?? {
          clientTransactionId,
          status: "pending",
          createdAt: now,
          lead: baseLead,
        }),
        status: nextStatus,
        confirmedAt: now,
        payphoneTransactionId:
          typeof payphoneResponse.transactionId === "number"
            ? payphoneResponse.transactionId
            : stored?.payphoneTransactionId,
        authorizationCode: payphoneResponse.authorizationCode,
        cardBrand: payphoneResponse.cardBrand,
        lastDigits: payphoneResponse.lastDigits,
      };
      try {
        await sendInternalNotification(alertTx);
      } catch (err) {
        console.error(
          "[confirm] no se pudo alertar cobro sin persistir:",
          (err as Error).message
        );
      }
    } else if (willEmail && persisted) {
      // Camino normal: la transición se persistió. Enviamos UNA sola vez.
      if (approved) {
        // El recibo al cliente solo si tenemos un email válido (en un registro
        // reconstruido sin lead, solo va el aviso interno al equipo).
        const tasks = [sendInternalNotification(persisted)];
        if (isValidEmail(persisted.lead.email)) {
          tasks.push(sendCustomerReceipt(persisted));
        }
        try {
          await Promise.all(tasks);
        } catch (err) {
          console.error("[confirm] error enviando emails:", (err as Error).message);
        }
      } else {
        // amountMismatch: avisamos al equipo para revisar/reembolsar.
        try {
          await sendAmountMismatchAlert(persisted, Number(payphoneResponse.amount));
        } catch (err) {
          console.error("[confirm] error enviando aviso de mismatch:", (err as Error).message);
        }
      }
    }
  }

  return {
    success: approved,
    reference: clientTransactionId,
    payment: sanitizeForClient(payphoneResponse),
    httpStatus: 200,
  };
}
