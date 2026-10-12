import { ImageResponse } from "next/og";

export const alt = "ResumeIQ — See how recruiters see your resume";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link-preview card, in the site's paper/ink/navy palette.
export default function OpengraphImage() {
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
          background: "#faf9f6",
          color: "#18202b",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#10233f" }}>
          Resume<span style={{ color: "#3566b8", fontStyle: "italic" }}>IQ</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#10233f" }}>
            See how recruiters see your resume.
          </div>
          <div style={{ fontSize: 32, color: "#647080", maxWidth: 820 }}>
            Match score, ATS checks, skill gaps, and the edits to make before you apply.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
