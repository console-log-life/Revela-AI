import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Revela AI";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at top left, rgba(56,189,248,0.35), transparent 40%), radial-gradient(circle at 80% 20%, rgba(244,114,182,0.3), transparent 30%), #020617",
          color: "white"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #38bdf8, #1d4ed8 48%, #f472b6)"
            }}
          >
            <div style={{ fontSize: 28 }}>AI</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", opacity: 0.8 }}>
              Adaptive Hiring Intelligence
            </div>
            <div style={{ fontSize: 54, fontWeight: 700 }}>Revela AI</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, lineHeight: 1.1, fontWeight: 700 }}>
            Interview memory, model routing, and recruiter-grade analytics in one surface.
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.78)" }}>
            AI interviewer · Candidate trajectories · Evaluation engine · Cascade policy
          </div>
        </div>
      </div>
    ),
    size
  );
}
