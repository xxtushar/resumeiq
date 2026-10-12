import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// The wordmark's "IQ" on the brand navy (--brand / --accent-blue).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#10233f",
          borderRadius: 7,
          color: "#ffffff",
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        IQ
      </div>
    ),
    { ...size }
  );
}
