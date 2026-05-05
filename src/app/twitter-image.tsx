import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LatamSoft — Software de gestión para clínicas de optometría y ópticas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #0EA5E9 0%, #0D9488 50%, #1E3A5F 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            👁
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5 }}>
            LatamSoft
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            Software de gestión para clínicas de optometría y ópticas
          </div>
          <div
            style={{
              fontSize: 28,
              opacity: 0.85,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Pacientes, historia clínica, pedidos a laboratorio, agenda y WhatsApp.
            Multi-sucursal · Latinoamérica.
          </div>
        </div>
      </div>
    ),
    size
  );
}
