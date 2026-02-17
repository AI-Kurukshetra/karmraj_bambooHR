import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B3A73",
          borderRadius: "14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10px",
            left: "-10px",
            width: "42px",
            height: "42px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.18)",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-14px",
            right: "-14px",
            width: "58px",
            height: "58px",
            borderRadius: "999px",
            background: "rgba(94,234,212,0.22)",
            filter: "blur(2px)",
          }}
        />

        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
              transform: "translateY(-1px)",
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

