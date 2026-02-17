import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "180px",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B3A73",
          borderRadius: "40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            left: "-30px",
            width: "140px",
            height: "140px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.16)",
            filter: "blur(4px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "-40px",
            width: "190px",
            height: "190px",
            borderRadius: "999px",
            background: "rgba(94,234,212,0.22)",
            filter: "blur(6px)",
          }}
        />
        <div
          style={{
            width: "112px",
            height: "112px",
            borderRadius: "34px",
            background: "rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
              transform: "translateY(-4px)",
            }}
          >
            P
          </div>
        </div>
      </div>
    ),
    size,
  );
}

