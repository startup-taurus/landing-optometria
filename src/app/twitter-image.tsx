import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dioptrika — Software clínico especializado para ópticas";
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
          background: "#071A1F",
          color: "#F8FBFA",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 540,
            height: 540,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(20,184,117,0.30) 0%, rgba(20,184,117,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -140,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(8,122,90,0.28) 0%, rgba(8,122,90,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #14B875 0%, #087A5A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 18px 40px -10px rgba(20,184,117,0.55)",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#F8FBFA",
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -1,
              color: "#F8FBFA",
            }}
          >
            Dioptrika
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1020,
              color: "#F8FBFA",
            }}
          >
            Precisión clínica para gestionar ópticas con claridad.
          </div>
          <div
            style={{
              fontSize: 28,
              opacity: 0.85,
              maxWidth: 940,
              lineHeight: 1.35,
              color: "#B7D1D2",
            }}
          >
            Historias clínicas, órdenes de laboratorio, inventario y facturación en
            un sistema especializado para ópticas.
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 18,
              color: "#B7D1D2",
              letterSpacing: 0.5,
              display: "flex",
            }}
          >
            dioptrika.com  ·  Producto de LatamSoft
          </div>
        </div>
      </div>
    ),
    size
  );
}
