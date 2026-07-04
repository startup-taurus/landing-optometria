function getBaseUrl(): string {
  return (process.env.OPTOMETRY_API_URL || "").replace(/\/+$/, "");
}

function getApiKey(): string {
  return process.env.PROVISIONING_API_KEY || "";
}

export function optometryEnabled(): boolean {
  return Boolean(getBaseUrl() && getApiKey());
}

type OptometryResult = {
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
};

async function postOptometry(
  path: string,
  payload: Record<string, unknown>
): Promise<OptometryResult> {
  if (!optometryEnabled()) return { ok: false, error: "not_configured" };

  const url = `${getBaseUrl()}${path}`;
  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPTOMETRY_API_TIMEOUT_MS) || 10000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-provision-key": getApiKey(),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, status: res.status, data, error: `http_${res.status}` };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

export interface ProvisionInput {
  opticaName: string;
  ownerName: string;
  adminEmail: string;
  phone: string;
  documentId: string;
  externalSubscriptionId: string;
  planCode?: string;
  amountCents?: number;
  currency?: string;
  billingCycle?: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  currentPeriodEnd?: string | null;
  status?: string;
}

export async function provisionOptometryAccount(
  input: ProvisionInput
): Promise<OptometryResult> {
  const payload: Record<string, unknown> = {
    opticaName: input.opticaName,
    ownerName: input.ownerName,
    adminEmail: input.adminEmail,
    phone: input.phone,
    documentId: input.documentId,
    externalSubscriptionId: input.externalSubscriptionId,
  };
  if (input.planCode) payload.planCode = input.planCode;
  if (typeof input.amountCents === "number") payload.amountCents = input.amountCents;
  if (input.currency) payload.currency = input.currency;
  if (input.billingCycle) payload.billingCycle = input.billingCycle;
  if (input.cardBrand) payload.cardBrand = input.cardBrand;
  if (input.cardLast4) payload.cardLast4 = input.cardLast4;
  if (input.currentPeriodEnd) payload.currentPeriodEnd = input.currentPeriodEnd;
  if (input.status) payload.status = input.status;
  return postOptometry("/provisioning/subscriptions", payload);
}

export interface SyncInput {
  externalSubscriptionId: string;
  status?: string;
  currentPeriodEnd?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
  amountCents?: number;
}

export async function syncOptometrySubscription(
  input: SyncInput
): Promise<OptometryResult> {
  const payload: Record<string, unknown> = {
    externalSubscriptionId: input.externalSubscriptionId,
  };
  if (input.status) payload.status = input.status;
  if (input.currentPeriodEnd) payload.currentPeriodEnd = input.currentPeriodEnd;
  if (input.cardBrand) payload.cardBrand = input.cardBrand;
  if (input.cardLast4) payload.cardLast4 = input.cardLast4;
  if (typeof input.amountCents === "number") payload.amountCents = input.amountCents;
  return postOptometry("/provisioning/subscriptions/sync", payload);
}
