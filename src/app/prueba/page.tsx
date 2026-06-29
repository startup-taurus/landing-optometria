import type { Metadata } from "next";
import TestCheckout from "./TestCheckout";

// Ruta INTERNA para probar el cobro recurrente ($1) sin mostrar el botón en la
// landing. No se enlaza en el sitio y se marca noindex para que no aparezca en
// buscadores. Solo funciona si PAYPHONE_TEST_MODE=true (lo valida /init).
export const metadata: Metadata = {
  title: "Prueba de pago",
  robots: { index: false, follow: false },
};

export default function PruebaPage() {
  return <TestCheckout />;
}
